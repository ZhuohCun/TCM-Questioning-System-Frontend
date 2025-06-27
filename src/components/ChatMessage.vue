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
  margin-bottom: 1.85vh;
  display: flex;
  gap: 0.63vw;
  padding: 0 1.04vw;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 2.08vw;
  height: 3.70vh;
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
  padding: 1.11vh 0.83vw;
  border-radius: 0.63vw;
  background: white;
  box-shadow: 0 0.19vh 0.42vw rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 0 1.2vw rgba(0, 0, 0, 0.10);
  }
}

.message-user .message-content {
  background: #e3f2fd;
  color: #374151;
}

.message-time {
  font-size: 0.63vw;
  color: #6b7280;
  margin-top: 0.37vh;
}

:deep(.markdown-body) {
  font-size: 0.73vw;
  line-height: 1.6;
  background: transparent !important;
}

:deep(.markdown-body pre) {
  background: #f8f9fa;
  padding: 1.48vh 0.83vw;
  border-radius: 0.21vw;
  overflow-x: auto;
  border: 0.05vw solid #e9ecef;
}

:deep(.markdown-body code) {
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 0.63vw;
  padding: 0.19vh 0.21vw;
  background: #f8f9fa;
  border-radius: 0.16vw;
  border: 0.05vw solid #e9ecef;
  color: #030303;
}

:deep(.markdown-body blockquote) {
  background: #f8f9fa;
  border-left: 0.21vw solid #dee2e6;
  padding: 1.11vh 0.83vw;
  margin: 0.74vh 0;
  color: #495057;
}

:deep(.markdown-body table) {
  border-collapse: collapse;
  margin: 0.74vh 0;
  width: 100%;
}

:deep(.markdown-body table th),
:deep(.markdown-body table td) {
  padding: 0.74vh;
  border: 0.05vw solid #dee2e6;
  background: #fff;
}

:deep(.markdown-body table th) {
  background: #f8f9fa;
}

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

.avatar-icon {
  width: 1.25vw;
  height: 2.22vh;
  color: #6B7280;
}

.message-user .avatar-icon {
  color: #3B82F6;
}

</style> 