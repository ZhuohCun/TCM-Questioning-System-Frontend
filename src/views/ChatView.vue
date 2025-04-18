<template>
  <div class="chat-container">
    <!-- 添加模型选择器 -->
    <div class="model-selector">
      <el-dropdown @command="handleModelChange">
        <button class="model-button">
          {{ currentModel === 'stream' ? '针灸大模型' : '针灸智能体' }}
          <i class="el-icon-arrow-down"></i>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="stream">针灸大模型</el-dropdown-item>
            <el-dropdown-item command="normal">针灸智能体</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <button class="sidebar-trigger" @click="toggleHistory">
      <span>≡</span>
    </button>

    <div class="chat-content" :class="{ 'is-shifted': isHistoryOpen }">
      <!-- 添加空状态提示 -->
      <div v-if="messages.length === 0" class="empty-state">
        <h2 class="empty-title">请问有什么可以帮到您？</h2>
      </div>

      <!-- 聊天记录区域 -->
      <div v-else class="chat-messages" ref="messagesRef">
        <ChatMessage
          v-for="(message, index) in messages"
          :key="index"
          :content="message.content"
          :is-user="message.isUser"
          :time="message.time"
          :streaming="message.streaming"
        />
      </div>

      <!-- 输入区域 -->
      <div class="chat-footer">
        <div class="input-area">
          <button class="new-chat-btn" @click="newDialog">
            <i class="fas fa-plus"></i>
            新对话
          </button>
          <textarea
            v-model="inputMessage"
            @keydown.enter.prevent="sendMessage"
            placeholder="请输入您的问题..."
            :rows="1"
            ref="inputRef"
          ></textarea>
          <button 
            class="send-btn" 
            @click="sendMessage"
            :disabled="loading || !inputMessage.trim()"
          >
            {{ loading ? '正在回复...' : '发送' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 历史对话侧边栏 -->
    <div class="history-sidebar" :class="{ 'is-open': isHistoryOpen }">
      <HistoryDialog
        v-model:visible="isHistoryOpen"
        @select="loadHistory"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { api } from '@/api'
import HistoryDialog from '@/components/HistoryDialog.vue'

const messagesRef = ref(null)
const inputRef = ref(null)
const inputMessage = ref('')
const loading = ref(false)
const messages = ref([])
const currentInfo = ref(null)
const isHistoryOpen = ref(false)
const chatHistory = ref([]) // 这里需要从API获取历史记录

// 添加模型选择相关的状态
const currentModel = ref('normal') // 'normal' 或 'stream'
let currentEventSource = null

// 处理模型切换
const handleModelChange = async (model) => {
  if (model === currentModel.value) return
  currentModel.value = model
  // 新建对话
  await newDialog()
}

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 检查文中的穴位名称并获取信息
const checkAcupoints = async (text) => {
  // 这里需要一个穴位名称的正则表达式匹配
  // 这是一个简单的示例，实际应用中可能需要更复杂的匹配规则
  const acupointPattern = /[a-zA-Z\u4e00-\u9fa5]+穴/g
  const matches = text.match(acupointPattern)
  
  if (matches) {
    try {
      const res = await api.getMeridianInfo({
        MeridianName: matches[0].replace('穴', '')
      })
      if (res.data && res.data.length > 0) {
        currentInfo.value = res.data[0]
      }
    } catch (error) {
      console.error('获取穴位信息失败:', error)
    }
  }
}

// 发送消息
const sendMessage = async () => {
  if (loading.value || !inputMessage.value.trim()) return
  
  const userMessage = {
    content: inputMessage.value,
    isUser: true,
    time: new Date().toISOString(),
    streaming: false
  }
  
  messages.value.push(userMessage)
  const messageText = inputMessage.value
  inputMessage.value = ''
  scrollToBottom()
  
  try {
    loading.value = true
    
    // 创建一个空的 AI 回复消息
    const botMessage = {
      content: '',
      isUser: false,
      time: new Date().toISOString(),
      streaming: currentModel.value === 'stream'
    }
    messages.value.push(botMessage)

    if (currentModel.value === 'stream') {
      try {
        loading.value = true
        // 使用流式接口
        const response = await api.sendQuestionStream({ question: messageText })
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { value, done } = await reader.read()
          if (done) {
            loading.value = false
            break
          }
          // 解码并显示新的内容
          const text = decoder.decode(value)
          botMessage.content += text
          scrollToBottom()
        }
      } catch (error) {
        console.error('Stream error:', error)
        loading.value = false
      }
    } else {
      // 使用普通接口
      const res = await api.sendQuestion({ question: messageText })
      botMessage.content = res.data
      scrollToBottom()
      loading.value = false
      await checkAcupoints(botMessage.content)
    }
    
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error(error.message || '发送失败')
    loading.value = false
  }
}

// 新建对话
const newDialog = async () => {
  try {
    await api.newDialogue()
    messages.value = []
    currentInfo.value = null
  } catch (error) {
    alert(error.message || '新建对话失败')
  }
}

// 显示历史记录（这里需要实现历史记录的显示逻辑）
const showHistory = () => {
  // TODO: 实现历史记录显示
}

// 切换历史记录抽屉
const toggleHistory = () => {
  isHistoryOpen.value = !isHistoryOpen.value
}

// 格式化时间
const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

// 加载历史话
const loadHistory = async (historyData) => {
  try {
    messages.value = historyData.map(item => ({
      content: item.content,
      isUser: item.role === 'user',
      time: item.time,
      streaming: false
    }))
    scrollToBottom()
  } catch (error) {
    console.error('加载历史对话失败:', error)
  }
}

// 监听输入框高变化
watch(inputMessage, () => {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
  }
})

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})

// 组件卸载时清理 EventSource
onBeforeUnmount(() => {
  if (currentEventSource) {
    currentEventSource.close()
  }
})
</script>

<style scoped lang="scss">
.chat-container {
  position: fixed;
  top: 0.93vh;
  left: 0;
  height: calc(100vh - 0.93vh);
  width: 100%;
  display: flex;
  justify-content: center;
  background: #fff;
  overflow-y: scroll;
}

.chat-content {
  width: 100%;
  height: 100%;
  max-width: 41.67vw;
  margin: 0 auto;
  background: white;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 7.41vh;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.85vh;
  padding-bottom: 9.26vh;
  width: 100%;
  max-width: 41.67vw;
  margin: 0 auto;

  > div {
    max-width: 85%;
    margin: 0 auto;
    padding: 0 1.25vw;
  }

  &::-webkit-scrollbar {
    width: 0.31vw;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 0.16vw;

    &:hover {
      background-color: rgba(156, 163, 175, 0.8);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.chat-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  max-width: 93.75vw;
  min-width: 46.88vw;
  margin: 0 auto;
  background: transparent;
  padding: 1.48vh 1.04vw;
  z-index: 1000;

  .input-area {
    display: flex;
    gap: 0.63vw;
    background: white;
    position: relative;
    padding: 0.74vh 0.83vw;
    border-radius: 0.63vw;
    border: 0.09vw solid #e5e7eb;
    box-shadow: 0 0.19vh 0.74vh rgba(0, 0, 0, 0.1);

    .new-chat-btn {
      padding: 0.74vh 0.83vw;
      height: 3.7vh;
      border-radius: 0.42vw;
      background: #4b5563;
      color: white;
      border: none;
      font-size: 1.3vh;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.31vw;
      white-space: nowrap;
      transition: all 0.2s ease;

      &:hover {
        background: #374151;
        transform: translateY(-0.09vh);
      }

      i {
        font-size: 1.3vh;
      }
    }

    textarea {
      flex: 1;
      min-height: 3.7vh;
      max-height: 11.11vh;
      border: 0.09vw solid #e5e7eb;
      border-radius: 0.42vw;
      padding: 0.74vh 0.83vw;
      resize: none;
      font-size: 1.3vh;
      line-height: 1.5;
      background: #f8f9fa;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        background: white;
        box-shadow: 0 0 0 0.19vw rgba(59, 130, 246, 0.1);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    .send-btn {
      width: 4.17vw;
      height: 3.7vh;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.42vw;
      cursor: pointer;
      font-size: 1.3vh;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        background: #2563eb;
        transform: translateY(-0.09vh);
      }

      &:disabled {
        background: #9ca3af;
        cursor: not-allowed;
        transform: none;
      }
    }
  }
}

@media (max-width: 1200px) {
  .chat-content {
    width: 100%;
    margin-left: 0;

    &.is-shifted {
      margin-left: 0;
    }
  }

  .history-sidebar {
    width: 100%;
    left: -100%;

    &.is-open {
      left: 0;
    }
  }
}

.sidebar-trigger {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2.08vw;
  height: 3.7vh;
  background: #4b5563;
  border: none;
  border-radius: 0 0.42vw 0.42vw 0;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s ease;

  &:hover {
    background: #374151;
    width: 2.29vw;
  }

  i {
    font-size: 1.67vh;
  }
}

.history-sidebar {
  position: fixed;
  top: 5.56vh;
  left: -20.83vw;
  width: 20.83vw;
  height: calc(100vh - 5.56vh);
  background: white;
  box-shadow: 0.1vw 0 0.42vw rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 90;

  &.is-open {
    left: 0;
  }
}

@media (max-width: 768px) {
  .chat-container {
    top: 0;
    height: 100vh;
  }

  .chat-content {
    padding-bottom: 9.26vh;
  }

  .chat-footer {
    left: 0;
    right: 0;
    transform: none;
    width: 100%;
    min-width: auto;
    padding: 1.11vh;

    .input-area {
      max-width: 100%;
      padding: 0.56vh;
      margin: 0 0.63vw;

      .new-chat-btn {
        padding: 0.56vh 0.63vw;
        height: 3.33vh;
        font-size: 1.2vh;
      }

      textarea {
        min-height: 3.33vh;
        padding: 0.56vh 0.63vw;
        font-size: 1.2vh;
      }

      .send-btn {
        width: 3.65vw;
        height: 3.33vh;
        font-size: 1.2vh;
      }
    }
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.85vh;
  margin-top: -3.7vh;

  .empty-title {
    font-size: 2.59vh;
    color: #000000;
    font-weight: 600;
    text-align: center;
    margin: 0;
    letter-spacing: 0.05vw;
    line-height: 1.5;
  }
}

.model-selector {
  position: fixed;
  top: 6.48vh;
  left: 1.04vw;
  z-index: 100;
}

.model-button {
  background: white;
  border: 0.09vw solid #e5e7eb;
  padding: 0.74vh 0.83vw;
  border-radius: 0.42vw;
  display: flex;
  align-items: center;
  gap: 0.42vw;
  cursor: pointer;
  font-size: 1.3vh;
  color: #374151;
  box-shadow: 0 0.19vh 0.37vh rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  i {
    font-size: 1.11vh;
    margin-left: 0.21vw;
  }
}
</style> 