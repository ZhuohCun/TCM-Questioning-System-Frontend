<template>
  <div class="message" :class="{ 'message-user': isUser }">
    <div class="message-avatar">
      <template v-if="isUser">
        <svg viewBox="0 0 24 24" class="avatar-icon">
          <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </template>
      <template v-else>
        <svg viewBox="0 0 24 24" class="avatar-icon">
          <path fill="currentColor" d="M21 10.975V8a2 2 0 0 0-2-2h-6V4.688c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5a2 2 0 0 0-2 2v2.975A3.5 3.5 0 0 0 2 14.5a3.5 3.5 0 0 0 1 2.45V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2.05a3.5 3.5 0 0 0 1-2.45 3.5 3.5 0 0 0-1-2.475zM5 8h14v2h-4.5a1.5 1.5 0 0 0-3 0H5V8z"/>
        </svg>
      </template>
    </div>
    
    <div class="message-wrapper">
      <div class="message-content">
        <div class="markdown-body" v-html="renderedContent"></div>
      </div>
      <div class="message-time">{{ formatTime(time) }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  isUser: {
    type: Boolean,
    default: false
  },
  time: {
    type: String,
    required: true
  },
  streaming: {
    type: Boolean,
    default: false
  }
})

// 使用 ref 来跟踪内容，以便实时更新
const currentContent = ref(props.content)

// 监听内容变化
watch(() => props.content, (newContent) => {
  currentContent.value = newContent
}, { immediate: true })

// 计算渲染后的内容
const renderedContent = computed(() => md.render(currentContent.value))

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}
</script>

<style scoped>
.message {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  padding: 0 20px;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-user .message-content {
  background: #e3f2fd;
  color: #374151;
}

.message-time {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* Markdown 样式 */
:deep(.markdown-body) {
  font-size: 14px;
  line-height: 1.6;
  background: transparent !important;
}

/* 代码块样式 */
:deep(.markdown-body pre) {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  border: 1px solid #e9ecef;
}

/* 行内代码样式 */
:deep(.markdown-body code) {
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 12px;
  padding: 2px 4px;
  background: #f8f9fa;
  border-radius: 3px;
  border: 1px solid #e9ecef;
  color: #030303;
}

/* 引用块样式 */
:deep(.markdown-body blockquote) {
  background: #f8f9fa;
  border-left: 4px solid #dee2e6;
  padding: 12px 16px;
  margin: 8px 0;
  color: #495057;
}

/* 表格样式 */
:deep(.markdown-body table) {
  border-collapse: collapse;
  margin: 8px 0;
  width: 100%;
}

:deep(.markdown-body table th),
:deep(.markdown-body table td) {
  padding: 8px;
  border: 1px solid #dee2e6;
  background: #fff;
}

:deep(.markdown-body table th) {
  background: #f8f9fa;
}

/* 用户消息的特殊样式 */
.message-user :deep(.markdown-body) {
  color: #374151;
}

.message-user :deep(.markdown-body code) {
  background: rgba(0, 0, 0, 0.05);
  color: #000000;
  border-color: #070808;
}

.message-user :deep(.markdown-body pre) {
  background: #f8f9fa;
  border-color: #e9ecef;
}

.message-user :deep(.markdown-body pre code) {
  color: #374151;
  background: transparent;
  border: none;
}

.message-user :deep(.markdown-body blockquote) {
  background: #f8f9fa;
  border-left-color: #dee2e6;
  color: #495057;
}

.message-user :deep(.markdown-body table th),
.message-user :deep(.markdown-body table td) {
  background: #fff;
  border-color: #dee2e6;
  color: #374151;
}

/* 添加图标相关样式 */
.avatar-icon {
  width: 24px;
  height: 24px;
  color: #6B7280;
}

.message-user .avatar-icon {
  color: #3B82F6;
}
</style> 