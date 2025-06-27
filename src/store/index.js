import { createStore } from 'vuex'

export default createStore({
  state: {
    isLoggedIn: !!localStorage.getItem('token'),
    token: localStorage.getItem('token') || ''
  },
  mutations: {
    setLoggedIn(state, status) {
      state.isLoggedIn = status
    },
    setToken(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    logout(state) {
      state.isLoggedIn = false
      state.token = ''
      localStorage.removeItem('token')
    }
  }
}) 