<template>
  <div class="acupoint-container">
    <!-- 左侧经络列表 -->
    <div class="meridian-list">
      <div 
        v-for="meridian in meridians" 
        :key="meridian"
        class="meridian-item"
        :class="{ active: currentMeridian === meridian }"
        @click="selectMeridian(meridian)"
      >
        {{ meridian }}
      </div>
    </div>

    <!-- 右侧穴位卡片展示区 -->
    <div class="acupoint-content">
      <!-- 添加加载状态 -->
      <el-empty v-if="loading" description="加载中...">
        <el-icon class="loading"><Loading /></el-icon>
      </el-empty>
      
      <!-- 添加空状态 -->
      <el-empty 
        v-else-if="!loading && (!currentAcupoints || currentAcupoints.length === 0)" 
        description="暂无数据"
      />

      <div v-else class="acupoint-grid">
        <div 
          v-for="acupoint in currentAcupoints" 
          :key="acupoint.id" 
          class="acupoint-card"
          @click="toggleAcupointDetail(acupoint.name)"
        >
          <!-- 简略信息卡片 -->
          <div class="card-header">
            <h3>{{ acupoint.name }}</h3>
            <span class="meridian-tag">{{ acupoint.meridian_id }}</span>
          </div>
          
          <!-- 详细信息卡片(只在点击后显示) -->
          <div v-if="expandedAcupoint === acupoint.name" class="card-detail">
            <div v-if="acupointDetails[acupoint.name]" class="detail-content">
              <div class="detail-item">
                <label>位置：</label>
                <p>{{ acupointDetails[acupoint.name].location_description }}</p>
              </div>
              <div class="detail-item">
                <label>功效：</label>
                <p>{{ acupointDetails[acupoint.name].functions }}</p>
              </div>
              <div class="detail-item">
                <label>操作方法：</label>
                <p>{{ acupointDetails[acupoint.name].technique }}</p>
              </div>
            </div>
            <div v-else class="loading-detail">
              <el-icon class="loading"><Loading /></el-icon>
              加载中...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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

// 经络列表
const meridians = [
  "手太阴肺经", "手阳明大肠经", "足阳明胃经", "足太阴脾经",
  "手少阴心经", "手太阳小肠经", "足太阳膀胱经", "足少阴肾经",
  "手厥阴心包经", "手少阳三焦经", "足少阳胆经", "足厥阴肝经",
  "督脉", "任脉"
]

// 根据经络ID分组的穴位数据
const groupedAcupoints = computed(() => {
  console.log('计算 groupedAcupoints, allAcupoints:', allAcupoints.value)
  const groups = {}
  meridians.forEach(meridian => {
    const meridianAcupoints = allAcupoints.value.filter(item => item.meridian_id === meridian)
    if (meridianAcupoints.length > 0) {
      groups[meridian] = meridianAcupoints
    }
  })
  console.log('分组后的数据:', groups)
  return groups
})

// 当前选中经络的穴位列表
const currentAcupoints = computed(() => {
  console.log('计算 currentAcupoints, currentMeridian:', currentMeridian.value)
  if (!currentMeridian.value) return []
  const acupoints = groupedAcupoints.value[currentMeridian.value] || []
  console.log('当前经络的穴位:', acupoints)
  return acupoints
})

// 选择经络
const selectMeridian = (meridian) => {
  console.log('选择经络:', meridian)
  currentMeridian.value = meridian
  console.log('当前经络的穴位数据:', groupedAcupoints.value[meridian])
}

// 切换穴位详情显示
const toggleAcupointDetail = async (name) => {
  if (expandedAcupoint.value === name) {
    expandedAcupoint.value = null // 如果已经展开则收起
    return
  }
  
  expandedAcupoint.value = name // 展开新的穴位
  
  // 如果还没有加载详情则加载
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
      expandedAcupoint.value = null // 加载失败时收起
    }
  }
}

// 获取所有穴位数据
const fetchAllAcupoints = async () => {
  loading.value = true
  try {
    // 检查是否已登录
    if (!localStorage.getItem('token')) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }

    const res = await api.getMeridianList()
    console.log('API返回的原始数据:', res)
    
    if (res.data) {
      allAcupoints.value = res.data
      console.log('设置到 allAcupoints 的数据:', allAcupoints.value)
      
      // 默认选中第一个有穴位数据的经络
      const firstMeridian = meridians.find(m => 
        res.data.some(item => item.meridian_id === m)
      )
      console.log('找到的第一个经络:', firstMeridian)
      
      if (firstMeridian) {
        currentMeridian.value = firstMeridian
        console.log('设置当前经络为:', currentMeridian.value)
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
  padding: 0;
  display: flex;
  margin-top: 5.56vh;
  height: calc(100vh - 5.56vh);
  width: 100vw;
  position: fixed;
  left: 0;
  top: 5.56vh;
}

.meridian-list {
  width: 10.42vw;
  flex-shrink: 0;
  background: white;
  box-shadow: 0.10vw 0 0.42vw rgba(0, 0, 0, 0.1);
  padding: 0.83vw;
  height: 100%;
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 5.56vh;
  z-index: 1;

  .meridian-item {
    padding: 0.63vw 0.83vw;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 0.42vw;

    &:hover {
      background: #f3f4f6;
    }

    &.active {
      background: #e3f2fd;
      color: #1976d2;
      font-weight: 500;
    }
  }
}

.acupoint-content {
  flex: 1;
  padding: 1.04vw;
  margin-left: 10.42vw;
  overflow-y: auto;
  height: 100%;
  background: #f5f7fa;
  width: calc(100vw - 10.42vw);
}

.acupoint-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15.63vw, 1fr));
  gap: 1.04vw;
  max-width: 72.92vw;
  margin: 0 auto;
  padding: 0 1.04vw;
}

.acupoint-card {
  background: white;
  border-radius: 0.42vw;
  box-shadow: 0 0.10vw 0.42vw rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 0.05vw solid #eee;

  &:hover {
    transform: translateY(-0.10vw);
    box-shadow: 0 0.21vw 0.63vw rgba(0, 0, 0, 0.12);
  }

  .card-header {
    padding: 1.04vw;
    background: white;
    border-bottom: 0.05vw solid #eee;

    h3 {
      margin: 0;
      font-size: 1.25vw;
      margin-bottom: 0.42vw;
      font-weight: 700;
      color: #000;
    }

    .meridian-tag {
      font-size: 0.68vw;
      color: #666;
      background: #f5f5f5;
      padding: 0.21vw 0.63vw;
      border-radius: 0.21vw;
      display: inline-block;
    }
  }

  .card-detail {
    padding: 1.04vw;
    background: white;

    .detail-content {
      .detail-item {
        margin-bottom: 0.83vw;

        &:last-child {
          margin-bottom: 0;
        }

        label {
          color: #333;
          font-size: 0.73vw;
          margin-bottom: 0.31vw;
          display: block;
          font-weight: 600;
        }

        p {
          margin: 0;
          color: #333;
          font-size: 0.73vw;
          line-height: 1.6;
        }
      }
    }

    .loading-detail {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.42vw;
      color: #666;
      padding: 1.04vw 0;

      .loading {
        font-size: 1.04vw;
        color: #333;
      }
    }
  }
}

@media (max-width: 768px) {
  .acupoint-container {
    position: relative;
    height: auto;
    min-height: calc(100vh - 5.56vh);
  }

  .meridian-list {
    position: relative;
    width: 100%;
    height: auto;
    top: 0;
    margin-bottom: 1.04vw;
    box-shadow: 0 0.10vw 0.42vw rgba(0, 0, 0, 0.1);
  }

  .acupoint-content {
    margin-left: 0;
    width: 100%;
    padding: 0.83vw;
  }

  .acupoint-grid {
    grid-template-columns: 1fr;
    padding: 0;
  }
}

// 加载状态样式
.loading {
  font-size: 1.25vw;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

</style> 