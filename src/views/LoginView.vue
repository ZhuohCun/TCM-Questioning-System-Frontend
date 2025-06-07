<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username"
            v-model="formData.username"
            required
            placeholder="请输入用户名"
          >
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password"
            v-model="formData.password"
            required
            placeholder="请输入密码"
          >
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { api } from '@/api'

const router = useRouter()
const route = useRoute()
const store = useStore()
const loading = ref(false)
const formData = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    loading.value = true
    const res = await api.login(formData.value);
    store.commit('setToken', res.data)
    store.commit('setLoggedIn', true)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    alert(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 4.17vh;
  border-radius: 0.52vw;
  box-shadow: 0 1.67vh 6.25vh rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 20.83vw;
  margin-top: 3.13vh;
}

.login-box h2 {
  text-align: center;
  color: #333;
  margin-bottom: 4.17vh;
}

.login-form .form-group {
  margin-bottom: 3.13vh;
}

.login-form .form-group label {
  display: block;
  margin-bottom: 1.04vh;
  color: #666;
  font-size: 0.94vw;
}

.login-form .form-group input {
  width: 100%;
  padding: 1.67vh;
  border: 0.10vw solid #ddd;
  border-radius: 0.31vw;
  font-size: 1.04vw;
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 0 0.9vw rgba(0, 0, 0, 0.10);
  }
}

.login-form .form-group input:focus {
  outline: none;
  border-color: #007AFF;
}

.submit-btn {
  width: 100%;
  padding: 1.67vh;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 0.31vw;
  font-size: 1.04vw;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-0.30vh);
    box-shadow: 0 0.3vw 0.63vw rgba(0, 0, 0, 0.10);
  }
}

.submit-btn:hover {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 2.08vh;
  color: #666;
}

.register-link a {
  color: #007AFF;
  text-decoration: none;
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 0 0.63vw rgba(0, 0, 0, 0.10);
  }
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-box {
    margin: 2.60vw;
    margin-top: 4.17vh;
  }
}

</style> 