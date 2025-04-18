<template>
  <main class="home">
    <div class="hero">
      <h1>中医针灸问答系统</h1>
      <p class="subtitle">智能辅助诊疗，专业针灸知识查询</p>
      <div class="cta-buttons">
        <router-link 
          v-if="!store.state.isLoggedIn" 
          to="/login" 
          class="cta-button primary"
        >
          立即开始
        </router-link>
        <router-link 
          v-else 
          to="/chat" 
          class="cta-button primary"
        >
          开始问诊
        </router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <i class="fas fa-robot"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M6.867 5.543a1.58 1.58 0 0 0-2.155.576a1.57 1.57 0 0 0 .577 2.15l2.63 1.515a1 1 0 0 1 .5.866v3.536a1 1 0 0 1-.134.5l-2.408 4.162a1.57 1.57 0 0 0 .577 2.15a1.58 1.58 0 0 0 2.156-.576l3.258-5.629h.258l3.258 5.629a1.58 1.58 0 0 0 2.156.576a1.57 1.57 0 0 0 .577-2.15l-2.402-4.15a1 1 0 0 1-.135-.502V10.65a1 1 0 0 1 .501-.866l2.63-1.514a1.57 1.57 0 0 0 .577-2.15a1.58 1.58 0 0 0-2.155-.577l-3.636 2.094a3 3 0 0 1-2.994 0z"/><path d="M14.623 5.414a2.623 2.623 0 1 1-5.246 0a2.623 2.623 0 0 1 5.246 0"/></g></svg></i>
        <h3>智能问答</h3>
        <p>基于AI的智能诊疗助手，为您提供专业的健康咨询服务</p>
      </div>
      <div class="feature-card">
        <i class="fas fa-book-medical"></i>
        <h3>穴位查询</h3>
        <p>详细的穴位信息库，帮助您了解中医针灸知识</p>
      </div>
      <div class="feature-card">
        <i class="fas fa-history"></i>
        <h3>对话记录</h3>
        <p>完整保存您的问诊记录，方便随时查看和回顾</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useStore } from 'vuex'

const store = useStore()                                                            
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
  color: white;
  padding: 2rem;
  margin-top: 64px;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 3rem;

  h1 {
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  .subtitle {
    font-size: 1.4rem;
    opacity: 0.9;
    margin-bottom: 2.5rem;
  }
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;

  .cta-button {
    padding: 1rem 2.5rem;
    border-radius: 50px;
    font-size: 1.2rem;
    text-decoration: none;
    transition: all 0.3s ease;

    &.primary {
      background-color: white;
      color: #007AFF;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  .feature-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2.5rem 2rem;
    border-radius: 20px;
    text-align: center;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    i {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      color: white;
    }

    h3 {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: white;
    }

    p {
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      font-size: 1.1rem;
    }
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;

    h1 {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1.2rem;
    }
  }

  .features {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style>