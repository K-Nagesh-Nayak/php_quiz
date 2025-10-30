import api from './api'

export const adminService = {
  async getAdminAnalytics() {
    const response = await api.get('/analytics?action=admin')
    return response.data
  },

  async getAllUsers() {
    const response = await api.get('/admin?action=users')
    return response.data
  },

  async getUserActivity(userId) {
    const response = await api.get(`/admin?action=user-activity&user_id=${userId}`)
    return response.data
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin?action=delete-user&user_id=${userId}`)
    return response.data
  }
}