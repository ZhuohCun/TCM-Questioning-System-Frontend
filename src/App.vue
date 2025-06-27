<template>
  <div id="app">
    <nav class="nav-bar">
      <div class="nav-links">
        <div class="logo">
          <router-link to="/" class="logo-link">
            <img :src="logoSrc" alt="Logo" class="logo-img" />
            <span class="logo-text">TCM中医针灸问答系统</span>
          </router-link>
        </div>
        <template v-if="store.state.isLoggedIn">
          <router-link to="/chat" class="nav-link">智能问答</router-link>
          <router-link to="/acupoint" class="nav-link">穴位信息</router-link>
          <router-link to="/knowledge-graph" class="nav-link">知识图谱</router-link>
        </template>
      </div>
      <div class="auth-links">
        <template v-if="!store.state.isLoggedIn">
          <router-link to="/login" class="auth-link">登录</router-link>
          <router-link to="/register" class="auth-link">注册</router-link>
        </template>
        <template v-else>
          <span class="welcome">欢迎使用</span>
          <a href="#" class="auth-link" @click.prevent="handleLogout">退出</a>
        </template>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import {api} from "@/api/index.js";
import logoSrc from '@/assets/logo.js'
const store = useStore()
const router = useRouter()

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (token==null) {
    onlyhandleLogout()
  }else {
    try{
      var status = await api.getLoginStatus()
      if (status.data == "1" && token) {
        store.commit('setToken', token)
        store.commit('setLoggedIn', true)
      }else {
        onlyhandleLogout()
      }
    }catch (error) {
      onlyhandleLogout()
    }
  }
})
const handleLogout = () => {
  store.commit('logout')
  router.push('/login')
}
const onlyhandleLogout = () => {
  localStorage.removeItem('token')
  store.commit('logout')
  router.push('/')
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.nav-bar {
  padding: 2.08vh 4.17vw;
  background-color: #fff;
  box-shadow: 0 0.42vh 2.50vh rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-links {
  display: flex;
  gap: 3.13vw;
  font-size: 0.8vw;
}

.auth-links {
  display: flex;
  gap: 2.08vw;
  align-items: center;
  font-size: 0.8vw;
}

.nav-link,
.auth-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  padding: 1.04vh 1.67vw;
  border-radius: 0.6vw;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-0.30vh);
    box-shadow: 0 0.3vw 0.63vw rgba(0, 0, 0, 0.10);
  }
}
.logo {
  display: flex;

}

.logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #111827;
  min-width: 13vw;
  max-width: 13vw;
  border-radius: 0.6vw;
  height: 5vh;
  transition: all 0.4s;
  &:hover {
    transform: translateY(-0.30vh);
    box-shadow: 0 0.3vw 0.63vw rgba(0, 0, 0, 0.10);
    background-color: #c8effd;
  }
}

.logo-img {
  height: 3.33vh;
  margin-right: 0.63vw;
}

.logo-text {
  font-weight: 600;
  font-size: 0.94vw;
}
.nav-link:hover,
.auth-link:hover {
  color: #42b983;
  background-color: rgba(66, 185, 131, 0.1);
}

.welcome {
  color: #666;
  margin-right: 2.08vw;
}

/* 为了避免导航栏遮挡内容 */
#app > :nth-child(2) {
  margin-top: 6.67vh;
  min-height: calc(100vh - 6.67vh);
}

@media (max-width: 768px) {
  .nav-bar {
    padding: 2.08vh;
    flex-direction: column;
    gap: 2.08vh;
  }

  .nav-links,
  .auth-links {
    width: 100%;
    justify-content: center;
  }
}

</style>
