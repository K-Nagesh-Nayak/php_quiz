import api from './api'

export const authService = {
  async register(userData) {
    const response = await api.post('/auth?action=register', userData)
    return response.data
  },

  async login(credentials) {
    const response = await api.post('/auth?action=login', credentials)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/auth?action=profile')
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getToken() {
    return localStorage.getItem('token')
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  }
}