<template>
  <nav class="nav-bar">
    <div class="nav-container">
      <router-link to="/" class="logo">
        中医针灸问答系统
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/chat" class="nav-link">智能问答</router-link>
        <router-link to="/acupoint" class="nav-link">穴位信息</router-link>
        <router-link to="/knowledge-graph" class="nav-link">知识图谱</router-link>
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="nav-link">登录</router-link>
          <router-link to="/register" class="nav-link">注册</router-link>
        </template>
        <a v-else @click="handleLogout" class="nav-link">退出</a>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()

const isLoggedIn = computed(() => store.state.isLoggedIn)

const handleLogout = () => {
  localStorage.removeItem('token')
  store.commit('setLoggedIn', false)
  router.push('/login')
}
</script>

<style scoped lang="scss">
.nav-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;

  &:hover {
    color: #007AFF;
  }

  &.router-link-active {
    color: #007AFF;
  }
}
</style> 