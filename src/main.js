import './assets/main.css'
import '@/assets/styles/main.scss'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@fortawesome/fontawesome-free/css/all.css'
import 'github-markdown-css/github-markdown.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'echarts';
import ECharts from 'vue-echarts';

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)
app.component('v-chart', ECharts);
app.mount('#app')
