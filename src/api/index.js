import request from '../utils/request'

// 修改基础URL以使用代理
const BASE_URL = '/api'  // 之前是 'http://47.108.218.205:8089'

// 创建 FormData 辅助函数
const createFormData = (data) => {
  const formData = new FormData()
  Object.keys(data).forEach(key => {
    formData.append(key, data[key])
  })
  return formData
}

export const api = {
  // 用户登录
  login: (data) => {
    const formData = createFormData({
      username: data.username,
      password: data.password
    })
    return request({
      url: `${BASE_URL}/user/login`,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 用户注册
  register: (data) => {
    const formData = createFormData({
      username: data.username,
      password: data.password
    })
    return request({
      url: `${BASE_URL}/user/register`,
      method: 'post',
      data: formData,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 发送问题 (非流式)
  sendQuestion: (data) => {
    return request({
      url: `${BASE_URL}/user/chatO`,
      method: 'get',
      params: {
        question: data.question
      },
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  },

  // 发送问题 (流式)
  sendQuestionStream: (data) => {
    const token = localStorage.getItem('token');
    return fetch(`${BASE_URL}/user/chatFlux?question=${encodeURIComponent(data.question)}`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });
  },

  // 新建对话
  newDialogue: () => {
    return request({
      url: `${BASE_URL}/user/newDialogue`,
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data',
        authorization: localStorage.getItem('token')
      }
    })
  },

  // 获取历史消息列表
  getHistoryList: (data) => {
    return request({
      url: `${BASE_URL}/HistoricalDialogueInfo/getList`,
      method: 'get',
      params: {
        pageId: data.pageId,
        count: data.count
      },
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  },

  // 获取历史对话详情
  getHistoryDetail: (data) => {
    const formData = createFormData({
      sequenceId: data.sequenceId
    })
    return request({
      url: `${BASE_URL}/HistoricalDialogueInfo/getHistroy`,
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        authorization: localStorage.getItem('token')
      }
    })
  },

  // 获取穴位信息
  getMeridianInfo: (data) => {
    return request({
      url: `${BASE_URL}/Meridians/GetMeridianInfoByName`,
      method: 'get',
      params: {
        MeridianName: data.MeridianName || ''
      },
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  },

  // 获取历史对话列表
  getHistoryDialogs: () => request.get('/api/chat/history'),

  // 获取特定历史对话内容
  getHistoryDialog: (id) => request.get(`/api/chat/history/${id}`),

  // 获取所有穴位列表
  getMeridianList: () => {
    return request({
      url: `${BASE_URL}/Meridians/GetMeridianList`,
      method: 'get',
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  }
} 