<template>
  <div class="history-dialog">
    <div class="dialog-header">
      <h3>历史对话</h3>
      <button class="close-btn" @click="$emit('update:visible', false)">
        <i><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9.25"/><path stroke-linecap="round" d="m8.875 8.875l6.25 6.25m0-6.25l-6.25 6.25"/></g></svg></i>
      </button>
    </div>
    
    <div class="dialog-body">
      <div class="history-list">
        <div 
          v-for="item in historyList" 
          :key="item.sequence_id"
          class="history-item"
          @click="viewHistory(item)"
        >
          <div class="history-info">
            <p class="history-title">{{ item.question }}</p>
            <span class="history-time">{{ formatDate(item.date) }}</span>
          </div>
          <i><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 12h15.879m-6.129 6.75l5.69-5.69c.292-.292.439-.676.439-1.06M13.75 5.25l5.69 5.69c.292.292.439.676.439 1.06"/></svg></i>
        </div>
      </div>
      
      <div class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from '@/api'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'select'])

const historyList = ref([])
const currentPage = ref(1)
const pageSize = 10
const totalPages = ref(1)

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取历史记录
const fetchHistory = async () => {
  try {
    const res = await api.getHistoryList({
      pageId: currentPage.value,
      count: pageSize
    })
    if (res.data && Array.isArray(res.data)) {
      historyList.value = res.data
      // 假设总数是当前页数据的10倍（实际应该从API返回）
      totalPages.value = Math.max(Math.ceil(res.data.length / pageSize), 1)
    }
  } catch (error) {
    console.error('获取历史记录失败:', error)
  }
}

// 查看历史对话
const viewHistory = async (item) => {
  try {
    const res = await api.getHistoryDetail({
      sequenceId: item.sequence_id
    })
    emit('select', res.data)
    emit('update:visible', false)
  } catch (error) {
    console.error('获取历史对话详情失败:', error)
  }
}

// 切换页码
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchHistory()
  }
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    fetchHistory()
  }
})

onMounted(() => {
  if (props.visible) {
    fetchHistory()
  }
})
</script>

<style scoped lang="scss">
.history-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.dialog-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #111827;
  }

  .close-btn {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    
    &:hover {
      background: #f3f4f6;
    }
  }
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.history-list {
  .history-item {
    padding: 16px;
    border-radius: 8px;
    background: #f9fafb;
    margin-bottom: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;

    &:hover {
      background: #f3f4f6;
    }

    .history-info {
      flex: 1;
      margin-right: 12px;

      .history-title {
        color: #111827;
        margin: 0 0 8px 0;
        font-size: 14px;
        line-height: 1.5;
      }

      .history-time {
        font-size: 12px;
        color: #6b7280;
      }
    }

    i {
      color: #9ca3af;
      font-size: 14px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;

  .page-btn {
    padding: 6px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: white;
    color: #374151;
    cursor: pointer;
    font-size: 14px;
    
    &:hover:not(:disabled) {
      background: #f3f4f6;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style> 