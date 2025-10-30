import api from './api'

export const analyticsService = {
  async getUserAnalytics() {
    const response = await api.get('/analytics?action=user')
    return response.data
  },

  async getAdminAnalytics() {
    const response = await api.get('/analytics?action=admin')
    return response.data
  }
}