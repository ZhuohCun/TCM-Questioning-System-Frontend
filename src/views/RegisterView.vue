<template>
  <div class="register-container">
    <div class="register-box">
      <h2>注册</h2>
      <form @submit.prevent="handleRegister" class="register-form">
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
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <p class="login-link">
          已有账号？
          <router-link to="/login">立即登录</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'

const router = useRouter()
const loading = ref(false)
const formData = ref({
  username: '',
  password: ''
})

const handleRegister = async () => {
  try {
    loading.value = true
    const res = await api.register(formData.value)
    console.log('注册成功:', res)
    alert('注册成功！')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
    alert(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-container {
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

.register-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 4.17vh;
  border-radius: 2.08vh;
  box-shadow: 0 1.67vh 6.25vh rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 20.83vw;
  margin-top: 12.50vh;
}

.register-box h2 {
  text-align: center;
  color: #333;
  margin-bottom: 4.17vh;
}

.register-form .form-group {
  margin-bottom: 3.13vh;
}

.register-form .form-group label {
  display: block;
  margin-bottom: 1.04vh;
  color: #666;
  font-size: 1.88vh;
}

.register-form .form-group input {
  width: 100%;
  padding: 1.67vh;
  border: 0.21vh solid #ddd;
  border-radius: 1.25vh;
  font-size: 2.08vh;
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 0 0.9vw rgba(0, 0, 0, 0.10);
  }
}

.register-form .form-group input:focus {
  outline: none;
  border-color: #007AFF;
}

.submit-btn {
  width: 100%;
  padding: 1.67vh;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 1.25vh;
  font-size: 2.08vh;
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

.login-link {
  text-align: center;
  margin-top: 2.08vh;
  color: #666;
}

.login-link a {
  color: #007AFF;
  text-decoration: none;
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 0 0.63vw rgba(0, 0, 0, 0.10);
  }
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-box {
    margin: 2.60vw;
    margin-top: 10.42vh;
  }
}

</style> 