<template>
  <div class="chat-container">
    <!-- 添加模型选择器 -->
    <div class="model-selector">
      <el-dropdown @command="handleModelChange">
        <button class="model-button">
          TCM自研针灸大模型
          <i class="el-icon-arrow-down"></i>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="dropdown">
            <el-dropdown-item command="stream">TCM自研针灸大模型</el-dropdown-item>
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
        <div class="empty-icon">
          <i class="fas fa-comments"></i>
        </div>
        <h2 class="empty-title">请问有什么可以帮到您？</h2>
        <p class="empty-subtitle">您可以询问关于中医针灸的任何问题</p>
        <div class="suggestion-chips">
          <button class="suggestion-chip" @click="useQuestion('针灸可以治疗哪些常见疾病？')">
            针灸可以治疗哪些常见疾病？
          </button>
          <button class="suggestion-chip" @click="useQuestion('足三里穴位的位置和功效是什么？')">
            足三里穴位的位置和功效是什么？
          </button>
          <button class="suggestion-chip" @click="useQuestion('头痛应该按摩哪些穴位？')">
            头痛应该按摩哪些穴位？
          </button>
        </div>
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
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import ChatMessage from '@/components/ChatMessage.vue'
import {api} from '@/api'
import HistoryDialog from '@/components/HistoryDialog.vue'
import {ElMessage} from "element-plus";

const messagesRef = ref(null)
const inputRef = ref(null)
const inputMessage = ref('')
const loading = ref(false)
let messages = ref([])
const currentInfo = ref(null)
const isHistoryOpen = ref(false)
let currentSequence=0

let currentEventSource = null
// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTo({
      top: messagesRef.value.scrollHeight,
      behavior: 'smooth' // 启用平滑滚动动画
    })
  }
}
// 发送消息
const sendMessage = async () => {
  if (loading.value || !inputMessage.value.trim()) return
  if(isHistoryOpen.value==1){
    toggleHistory();
  }
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
    const botMessage = {
      content: '',
      isUser: false,
      time: new Date().toISOString(),
      streaming: false
    }
    botMessage.content= botMessage.content.replace("data:","")
    messages.value.push(botMessage)
      try {
        loading.value = true
        const response = await api.sendQuestion({ question: messageText,sequence: currentSequence })
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
          botMessage.content += text.replace("data:","")
          scrollToBottom()
          botMessage.content=botMessage.content.replace("data:","")
        }
      } catch (error) {
        console.error('Stream error:', error)
        loading.value = false
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
    currentSequence=-1;
    if(isHistoryOpen.value==1){
      toggleHistory();
    }
  } catch (error) {
    alert(error.message || '新建对话失败')
  }
}

// 切换历史记录抽屉
const toggleHistory = () => {
  isHistoryOpen.value = !isHistoryOpen.value
}
const loadHistory = async (historyData) => {
  try {
    messages.value=[]
    historyData.forEach((item) => {
      currentSequence=item.sequence_id;
      const userMessage = {
        content: item.question,
        isUser: true,
        time: item.date,
        streaming: false
      }
      messages.value.push(userMessage)
      const botMessage = {
        content: item.responds,
        isUser: false,
        time: item.date,
        streaming: false
      }
      messages.value.push(botMessage)
    });
    await scrollToBottom();
    await scrollToBottom();
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

onMounted(async () => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
  let token=localStorage.getItem("token")
  if(!token){
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }else {
    try{
      var status = await api.getLoginStatus()
    }catch (error) {
      status.data="-1";
    }
    if (status.data!="1") {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }else {
      await newDialog();
    }
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
  height: 99%;
  margin-top: 1vh;
  max-width: 41.67vw;
  background: white;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 7.41vh;
}
.dropdown{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 8vw;
  height: 4vh;
  font-size: 0.8vw;
  border-radius: 0.6vw;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.85vh;
  padding-bottom: 9.26vh;
  width: 100%;
  max-width: 41.67vw;
  margin: 0 auto;
  max-height: 80vh; /* 按需调整 */
  scroll-behavior: smooth;
  transform: translateZ(0); /* 强制GPU合成 */
  will-change: scroll-position;
  backface-visibility: hidden;

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
        transform: translateY(-0.1vh);
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
      transition: all 0.2s;
      &:hover {
        box-shadow: 0 0 0.9vw rgba(0, 0, 0, 0.10);
      }

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
        transform: translateY(-0.1vh);
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
  top: 9vh;
  left: -20.83vw;
  width: 20.83vw;
  height: calc(100vh - 9vh);
  background: white;
  box-shadow: 0.1vw 0 0.42vw rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 0 1vw rgba(0, 0, 0, 0.10);
  }
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
  padding: 1.85vh 1.04vw;
  margin-top: 0;
  animation: fadeIn 0.5s ease;

  .empty-icon {
    font-size: 2.50vw;
    color: #3b82f6;
    margin-bottom: 2.22vh;
    background: rgba(59, 130, 246, 0.1);
    width: 5.21vw;
    height: 9.26vh;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-title {
    font-size: 1.46vw;
    color: #111827;
    font-weight: 600;
    text-align: center;
    margin: 0 0 1.11vh;
    letter-spacing: 0.03vw;
    line-height: 1.5;
  }

  .empty-subtitle {
    font-size: 0.83vw;
    color: #6b7280;
    text-align: center;
    margin-bottom: 2.96vh;
  }

  .suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.63vw;
    max-width: 31.25vw;

    .suggestion-chip {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 1.04vw;
      padding: 0.74vh 0.83vw;
      font-size: 0.73vw;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #e5e7eb;
        transform: translateY(-0.19vh);
      }
    }
  }
}

.model-selector {
  position: fixed;
  top: 6.48vh;
  left: 1.04vw;
  border-radius: 0.6vw;
  z-index: 100;
}
.model-button {
  position: fixed;
  top:10vh;
  left: 2vw;
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
    transform: translateY(-0.1vh);
    box-shadow: 0 0 1vw rgba(0, 0, 0, 0.10);
    background: #f9fafb;
    border-color: #d1d5db;
  }
  i {
    font-size: 1.11vh;
    margin-left: 0.21vw;
  }
}
</style> 