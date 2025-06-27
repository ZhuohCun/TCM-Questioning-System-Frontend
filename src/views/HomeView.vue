<template>
  <div class="page-container">
    <div class="hero-container">
      <div class="content-wrapper">
        <h1>TCM中医针灸问答系统</h1>
        <p class="subtitle">智能辅助诊疗，专业针灸知识查询</p>
        <router-link 
          :to="store.state.isLoggedIn ? '/chat' : '/login'" 
          class="start-btn"
        >
          开始问诊
        </router-link>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="features-section">
        <div class="feature-card">
          <div class="icon-box">
            <el-icon><ChatRound /></el-icon>
          </div>
          <h3>智能问答</h3>
          <p>基于AI的智能诊疗助手，为您提供专业的健康咨询服务</p>
        </div>
        <div class="feature-card">
          <div class="icon-box">
            <el-icon><Search /></el-icon>
          </div>
          <h3>穴位查询</h3>
          <p>详细的穴位信息库，帮助您了解中医针灸知识</p>
        </div>
        <div class="feature-card">
          <div class="icon-box">
            <el-icon><Document /></el-icon>
          </div>
          <h3>对话记录</h3>
          <p>完整保存您的问诊记录，方便随时查看和回顾</p>
        </div>
      </div>

      <div class="timeline-section">
        <h2>系统发展历程</h2>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-point"></div>
            <div class="timeline-content">
              <span class="date">2025年5月</span>
              <h3>穴位查询功能优化</h3>
              <p>优化中医穴位查询功能，提供详细的穴位信息和专业知识库及更好的交互体验</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-point"></div>
            <div class="timeline-content">
              <span class="date">2025年4月</span>
              <h3>对话记录保存优化</h3>
              <p>优化对话保存的交互体验</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-point"></div>
            <div class="timeline-content">
              <span class="date">2025年3月</span>
              <h3>智能agent上线</h3>
              <p>全新升级为「自研AI对话模型」，提供更准确的中医诊疗咨询服务</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-point"></div>
            <div class="timeline-content">
              <span class="date">2024年11月</span>
              <h3>项目启动</h3>
              <p>「TCM」中医针灸问答系统前后端正式开启</p>
            </div>
          </div>
        </div>
      </div>

      <div class="disclaimer-section">
        <div class="disclaimer-card">
          <div class="icon-box">
            <el-icon><Warning /></el-icon>
          </div>
          <h3>免责声明</h3>
          <div class="disclaimer-content">
            <p>本系统仅供参考学习使用，不构成医疗建议。如有健康问题，请务必在专业医生指导下进行诊疗。</p>
            <ul>
              <li>系统提供的信息仅供参考，不能替代专业医生的诊断和建议</li>
              <li>针灸治疗应在专业中医师指导下进行，请勿自行尝试</li>
              <li>如遇紧急情况，请立即就医</li>
            </ul>
            <div class="kaisha">株式会社　ティーシーエム</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { ChatRound, Search, Document, Warning } from '@element-plus/icons-vue'

const store = useStore()
</script>

<style scoped lang="scss">
.page-container {
  min-height: 200vh;
  margin-top: 5.78vh;
  background: #f5f7fa;
}

.hero-container {
  background: #007AFF;
  padding: 23.44vh 0;
  text-align: center;
  color: white;
  border-radius: 0.7vw;
}

.content-wrapper {
  width: 62.50vw;
  margin: 0 auto;
}

h1 {
  font-size: 2.50vw;
  font-weight: bold;
  margin-bottom: 1.25vw;
}

.subtitle {
  font-size: 1.04vw;
  opacity: 0.9;
  margin-bottom: 2.50vw;
}

.start-btn {
  display: inline-block;
  padding: 0.83vw 3.13vw;
  background: white;
  color: #007AFF;
  border-radius: 1.56vw;
  font-size: 1.04vw;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 0.21vw 0.63vw rgba(0, 0, 0, 0.1);
}

.start-btn:hover {
  transform: translateY(-0.3vh);
  box-shadow: 0 0.31vw 0.83vw rgba(0, 0, 0, 0.15);
}

.features-section {
  display: flex;
  justify-content: space-between;
  margin: -2.08vw auto 3.13vw;
  gap: 1.56vw;
}

.feature-card {
  flex: 1;
  background: white;
  border-radius: 1.04vw;
  padding: 2.08vw;
  transition: all 0.4s;
  text-align: center;
  box-shadow: 0 0.21vw 0.63vw rgba(0, 0, 0, 0.1);
  &:hover {
    transform: translateY(-0.80vh);
    box-shadow: 0 0.4vw 0.73vw rgba(0, 0, 0, 0.15);
  }
}

.feature-card .icon-box {
  width: 4.17vw;
  height: 4.17vw;
  margin: 0 auto 1.25vw;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-card .icon-box .el-icon {
  font-size: 2.08vw;
  color: #007AFF;
}

.feature-card h3 {
  font-size: 1.25vw;
  font-weight: 600;
  margin-bottom: 1.04vw;
  color: #333;
}

.feature-card p {
  font-size: 0.83vw;
  line-height: 1.6;
  color: #666;
}

.disclaimer-card {
  background: white;
  border-radius: 1.04vw;
  padding: 2.08vw;
  box-shadow: 0 0.21vw 0.63vw rgba(0, 0, 0, 0.1);
}

.disclaimer-card .icon-box {
  width: 3.13vw;
  height: 3.13vw;
  margin: 0 auto 1.04vw;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  &:hover {
    transform: scale(1.5);
    box-shadow: 0 0.4vw 0.73vw rgba(0, 0, 0, 0.15);
  }
}

.disclaimer-card .icon-box .el-icon {
  font-size: 1.56vw;
  color: #FFD700;
}

.disclaimer-card h3 {
  font-size: 1.25vw;
  font-weight: 600;
  margin-bottom: 1.04vw;
  color: #333;
  text-align: center;
}

.disclaimer-card .disclaimer-content {
  text-align: left;
}

.disclaimer-card .disclaimer-content p {
  font-size: 0.83vw;
  line-height: 1.6;
  color: #666;
  margin-bottom: 1.04vw;
}

.disclaimer-card .disclaimer-content ul {
  list-style-type: disc;
  padding-left: 1.04vw;
  margin-bottom: 0;
}

.disclaimer-card .disclaimer-content ul li {
  font-size: 0.73vw;
  line-height: 1.8;
  color: #666;
  margin-bottom: 0.42vw;
}

.disclaimer-card .disclaimer-content ul li:last-child {
  margin-bottom: 0;
}

.timeline-section {
  margin: 4.17vh 0;
  padding: 3.13vh;
  background: white;
  border-radius: 1.04vw;
  box-shadow: 0 0.21vw 0.63vw rgba(0, 0, 0, 0.1);
}

.timeline-section h2 {
  text-align: center;
  font-size: 1.67vw;
  color: #333;
  margin-bottom: 3.13vh;
}

.timeline {
  position: relative;
  padding: 1.04vh 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0.10vw;
  height: 100%;
  background: #007AFF;
}

.timeline-item {
  position: relative;
  margin-bottom: 3.13vh;
  width: 50%;
  padding-right: 2.60vw;
}

.timeline-item:nth-child(even) {
  margin-left: auto;
  padding-right: 0;
  padding-left: 2.60vw;
}

.timeline-item:nth-child(even) .timeline-content {
  text-align: left;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-point {
  position: absolute;
  right: -0.47vw;
  top: 0;
  width: 1.04vw;
  height: 1.04vw;
  border-radius: 50%;
  background: #007AFF;
  border: 0.21vw solid white;
  box-shadow: 0 0 0 0.10vw #007AFF;
  transition: all 0.1s;
  &:hover {
    transform: scale(1.5);
    box-shadow: 0 0.25vw 0.73vw rgba(0, 0, 0, 0.15);
  }
}

.timeline-item:nth-child(even) .timeline-point {
  right: auto;
  left: -0.57vw;
}

.timeline-content {
  background: #f2f2f2;
  padding: 1.56vw;
  border-radius: 0.52vw;
  box-shadow: 0 0.10vw 0.42vw rgba(0, 0, 0, 0.05);
  transition: all 0.4s;
  &:hover {
    transform: translateY(-0.70vh);
    box-shadow: 0 0.3vw 0.63vw rgba(0, 0, 0, 0.10);
  }
}

.timeline-content .date {
  display: inline-block;
  padding: 0.21vw 0.63vw;
  background: #007AFF;
  color: white;
  border-radius: 0.78vw;
  font-size: 0.73vw;
  margin-bottom: 0.78vw;
}

.timeline-content h3 {
  color: #333;
  font-size: 1.04vw;
  margin-bottom: 0.52vw;
}

.timeline-content p {
  color: #666;
  font-size: 0.83vw;
  line-height: 1.6;
  margin: 0;
}
.kaisha{
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.83vw;
}

</style>