import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import store from '../store'
import KnowledgeGraphView from '../views/KnowledgeGraphView.vue'
import {api} from "@/api/index.js";
import {ElMessage} from "element-plus";

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '首页' }
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue'),
    meta: { 
      requiresAuth: true,
      title: '智能问答'
    }
  },
  {
    path: '/acupoint',
    name: 'acupoint',
    component: () => import('../views/AcupointView.vue'),
    meta: { 
      requiresAuth: true,
      title: '穴位信息'
    }
  },
  {
    path: '/knowledge-graph',
    name: 'knowledgeGraph',
    component: KnowledgeGraphView,
    meta: {
      title: '知识图谱'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: '注册' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  let isLoggedIn=false
  if (localStorage.token) {
    try{
      var status = await api.getLoginStatus()
    }catch (error) {
      status.data="-1";
    }
    if (status.data=="1") {
      isLoggedIn=true
    }else {
      isLoggedIn=false
    }
  }else {
    isLoggedIn=false
  }
  if (to.path != "/login" && to.path != "/register" && to.path != "/") {
    if (!isLoggedIn) {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: {redirect: to.fullPath}
      })
    } else {
      next()
    }
  } else {
    // 已登录用户访问登录/注册页面时重定向到首页
    if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
      next({path: '/'})
    } else {
      next()
    }
  }
})

export default router

