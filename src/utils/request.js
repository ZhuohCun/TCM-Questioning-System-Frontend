import axios from 'axios'

// 创建axios实例
const service = axios.create({
  timeout: 5000000, // 请求超时时间
  withCredentials: false // 跨域请求不需要凭证
})

// 不需要token的白名单路径
const whiteList = ['/user/login', '/user/register']

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 获取请求路径
    const url = config.url
    // 判断是否在白名单中
    const isWhiteList = whiteList.some(path => url.includes(path))
    
    // 如果不在白名单中，才添加token
    if (!isWhiteList) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers['authorization'] = token
      }
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      // 处理错误
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    console.log('err' + error)
    return Promise.reject(error)
  }
)

export default service 