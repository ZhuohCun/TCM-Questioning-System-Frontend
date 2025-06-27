<template>
  <div class="acupoint-container">
    <div class="acupoint-header">
      <h1 class="page-title">中医针灸穴位查询</h1>
      <div class="search-box">
        <el-input
            v-model="searchQuery"
            placeholder="搜索穴位名称"
            prefix-icon="el-icon-search"
            clearable
            @clear="clearSearch"
        >
          <template #prefix>
            <i><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="m15 15l7 7zm-5.5 2a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15Z"/></svg></i>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 左侧经络列表 -->
    <div class="main-content">
      <div class="meridian-list">
        <h3 class="list-title">经络列表</h3>
        <div class="meridian-items">
          <div
              v-for="meridian in meridians"
              :key="meridian"
              class="meridian-item"
              :class="{ active: currentMeridian === meridian }"
              @click="selectMeridian(meridian)"
          >
            <span class="meridian-name">{{ meridian }}</span>
            <span class="meridian-count" v-if="groupedAcupoints[meridian]">
              {{ groupedAcupoints[meridian]?.length || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- 右侧穴位卡片展示区 -->
      <div class="acupoint-content">
        <!-- 添加加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loader-lg"></div>
          <p>加载穴位数据中...</p>
        </div>

        <!-- 添加空状态 -->
        <el-empty
            v-else-if="!loading && filteredAcupoints.length === 0"
            description="暂无符合条件的穴位数据"
        >
          <el-button @click="clearSearch" v-if="searchQuery">清除搜索</el-button>
        </el-empty>

        <div v-else class="acupoint-grid">
          <div
              v-for="acupoint in filteredAcupoints"
              :key="acupoint.id"
              class="acupoint-card hover-lift"
              :class="{ 'expanded': expandedAcupoint === acupoint.name }"
              @click="toggleAcupointDetail(acupoint.name)"
          >
            <div class="card-header">
              <h3>{{ acupoint.name }}</h3>
              <span class="meridian-tag">{{ acupoint.meridian_name }}</span>
            </div>
            <transition
                name="expand"
            >
              <div
                  v-show="expandedAcupoint === acupoint.name"
                  class="card-detail"
              >
                <div v-if="acupointDetails[acupoint.name]" class="detail-content">
                  <div class="detail-item">
                    <label><i><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6 21v-3H3v-2h5v5zm10 0v-5h5v2h-3v3zM3 8V6h3V3h2v5zm13 0V3h2v3h3v2z"/></svg></i> <h1>位置：</h1></label>
                    <p>{{ acupointDetails[acupoint.name].location_description }}</p>
                  </div>
                  <div class="detail-item">
                    <label><i><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M8 13V4.5a1.5 1.5 0 0 1 3 0V12m0-.5v-2a1.5 1.5 0 1 1 3 0V12m0-1.5a1.5 1.5 0 0 1 3 0V12"/><path d="M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2h.208a6 6 0 0 1-5.012-2.7L7 19q-.468-.718-3.286-5.728a1.5 1.5 0 0 1 .536-2.022a1.87 1.87 0 0 1 2.28.28L8 13"/></g></svg></i><h1> 操作技术：</h1></label>
                    <p>{{ acupointDetails[acupoint.name].technique }}</p>
                  </div>
                </div>
                <div v-else class="loading-detail">
                  <div class="loader-sm"></div>
                  <span>加载详情中...</span>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { api } from '@/api'

const router = useRouter()

const loading = ref(false)
const allAcupoints = ref([])
const currentMeridian = ref('')
const acupointDetails = ref({})
const expandedAcupoint = ref(null) // 当前展开的穴位
const searchQuery = ref('') // 搜索关键词

// 经络列表
const meridians = [
  "手太阴肺经", "手阳明大肠经", "足阳明胃经", "足太阴脾经",
  "手少阴心经", "手太阳小肠经", "足太阳膀胱经", "足少阴肾经",
  "手厥阴心包经", "手少阳三焦经", "足少阳胆经", "足厥阴肝经",
  "督脉", "任脉"
]

// 根据经络ID分组的穴位数据
const groupedAcupoints = computed(() => {
  const groups = {}
  meridians.forEach(meridian => {
    const meridianAcupoints = allAcupoints.value.filter(item => item.meridian_name === meridian)
    if (meridianAcupoints.length > 0) {
      groups[meridian] = meridianAcupoints
    }
  })
  return groups
})

// 当前选中经络的穴位列表
const currentAcupoints = computed(() => {
  if (!currentMeridian.value) return []
  return groupedAcupoints.value[currentMeridian.value] || []
})

// 根据搜索过滤的穴位列表
const filteredAcupoints = computed(() => {
  if (!searchQuery.value) return currentAcupoints.value

  const query = searchQuery.value.toLowerCase().trim()
  return currentAcupoints.value.filter(acupoint =>
      acupoint.name.toLowerCase().includes(query)
  )
})

// 选择经络
const selectMeridian = (meridian) => {
  currentMeridian.value = meridian
  // 当切换经络时，清除搜索和关闭已展开的详情
  searchQuery.value = ''
  expandedAcupoint.value = null
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
}


const toggleAcupointDetail = async (name) => {
  if (expandedAcupoint.value === name) {
    expandedAcupoint.value = null
    return
  }
  expandedAcupoint.value = name
  if (!acupointDetails.value[name]) {
    try {
      const res = await api.getMeridianInfo({
        MeridianName: name
      })
      if (res.data && res.data.length > 0) {
        acupointDetails.value[name] = res.data[0]
      }
    } catch (error) {
      console.error('获取穴位详情失败:', error)
      ElMessage.error('获取穴位详情失败')
      expandedAcupoint.value = null
    }
  }
}

// 获取所有穴位数据
const fetchAllAcupoints = async () => {
  loading.value = true
  try {
    // 检查是否已登录
    var token=localStorage.getItem('token')
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
      }
    }
    const res = await api.getMeridianList()
    if (res.data) {
      allAcupoints.value = res.data

      // 默认选中第一个有穴位数据的经络
      const firstMeridian = meridians.find(m =>
          res.data.some(item => item.meridian_name === m)
      )

      if (firstMeridian) {
        currentMeridian.value = firstMeridian
      }
    }
  } catch (error) {
    console.error('获取穴位列表失败:', error)
    if (error.response?.status === 401) {
      ElMessage.warning('请先登录')
      router.push('/login')
    } else {
      ElMessage.error('获取穴位列表失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAllAcupoints()
})
</script>

<style scoped lang="scss">
.acupoint-container {
  padding: 1.85vh 1.04vw;
  padding-top: 6.48vh;
  border-radius: 0.8vw;
  background: #fafafe;
  overflow: hidden;
  max-height: 79vh;
  box-sizing: border-box;
}

.acupoint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.78vh;
  padding-bottom: 1.39vh;
  margin-top: -5vh;
  border-bottom: 0.05vw solid #e5e7eb;

  h1.page-title {
    font-size: 1.25vw;
    color: #111827;
    margin: 0;
  }

  .search-box {
    width: 15.63vw;
    i{
      display: flex;
      justify-content: center;
      align-items: center;
      svg{
        max-width: 1vw;
        max-height: 1vw;
      }
    }
  }
}

.main-content {
  display: flex;
  gap: 1.56vw;
  height: 50vh;
}

.meridian-list {
  width: 11.5vw;
  flex-shrink: 0;
  background: white;
  border-radius: 0.52vw;
  padding: 1.85vh 1.04vw;
  box-shadow: 0 0.19vh 0.42vw rgba(0, 0, 0, 0.05);
  height: 75vh;
  box-sizing: border-box;
}

.list-title {
  font-size: 0.83vw;
  margin: 0 0 1.39vh 0;
  color: #6b7280;
  font-weight: 500;
}

.meridian-items {
  max-height: 68vh;
  width: 10vw;
  overflow-y: scroll;
}

.meridian-item {
  padding: 1.11vh 0.78vw;
  border-radius: 0.42vw;
  margin-bottom: 0.74vh;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 8.6vw;
  height: 5.5vh;
  font-size: 1vw;
  color: #374151;

  &:hover {
    background: #f3f4f6;
  }

  &.active {
    background: #3b82f6;
    color: white;

    .meridian-count {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  .meridian-name {
    font-size: 0.73vw;
  }

  .meridian-count {
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 1.04vw;
    padding: 0.19vh 0.42vw;
    font-size: 0.7vw;
  }
}

.acupoint-content {
  flex: 1;
  min-height: 75vh;
  max-height: 75vh;
  overflow-y: scroll;
  box-sizing: border-box;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 27.78vh;

  p {
    margin-top: 1.85vh;
    color: #6b7280;
  }
}

.acupoint-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12vw, 1fr));
  gap: 1.04vw;
  overflow: hidden;
}

.acupoint-card {
  background: white;
  border-radius: 0.52vw;
  overflow: hidden;
  box-shadow: 0 0.19vh 0.42vw rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-0.46vh);
    box-shadow: 0 0.74vh 0.83vw rgba(0, 0, 0, 0.1);
  }

  &.expanded {
    grid-column: 1 / -1;
    max-width: 100%;
  }
}

.card-header {
  padding: 1.85vh 1.04vw;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 0.94vw;
    color: #111827;
  }
}

.meridian-tag {
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.37vh 0.52vw;
  border-radius: 1.04vw;
  font-size: 0.63vw;
}

.card-detail {
  border-top: 0.05vw solid #e5e7eb;
  padding: 1.85vh 1.04vw;
  background: #f9fafb;
}

.detail-content {
  animation: fadeIn 0.3s ease;
}

.detail-item {
  margin-bottom: 1.39vh;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: flex;
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 0.46vh;
    align-items: center;
    justify-content: left;
    h1{
      display: flex;
      justify-content:left;
      align-items: center;
      font-size: 1vw;
      max-width: 50vw;
    }

    i {
      margin-right: 0.26vw;
      color: #3b82f6;
      svg{
        max-width: 1vw;
        max-height: 1vw;
      }
    }
  }

  p {
    margin: 0;
    color: #6b7280;
    line-height: 1.6;
    font-size: 0.7vw;
  }
}

.loading-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.85vh 1.04vw;
  color: #6b7280;

  .loader-sm {
    margin-right: 0.93vw;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 46.30vh;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .meridian-list {
    width: 100%;
    margin-bottom: 1.85vh;
  }

  .acupoint-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.39vh;
  }

  .search-box {
    width: 100%;
  }

  .acupoint-grid {
    grid-template-columns: 1fr;
  }

  .acupoint-container {
    padding-top: 5.56vh;
  }
}
</style>