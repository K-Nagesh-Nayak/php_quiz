import api from './api'

export const quizService = {
  async getPublicQuizzes() {
    const response = await api.get('/quiz?action=public')
    return response.data
  },

  async getUserQuizzes() {
    const response = await api.get('/quiz?action=user')
    return response.data
  },

  async getPendingQuizzes() {
    const response = await api.get('/quiz?action=pending')
    return response.data
  },

  async getQuizQuestions(quizId) {
    const response = await api.get(`/quiz?action=questions&quiz_id=${quizId}`)
    return response.data
  },

  async submitQuizResult(quizData) {
    const response = await api.post('/quiz?action=submit', quizData)
    return response.data
  },

  async generateAIQuiz(quizData) {
    const response = await api.post('/ai?action=generate', quizData)
    return response.data
  },

  async updateQuizStatus(quizData) {
    const response = await api.post('/quiz?action=update-status', quizData)
    return response.data
  },

  async deleteQuiz(quizId) {
    const response = await api.delete(`/quiz?quiz_id=${quizId}`)
    return response.data
  },
  async createManualQuiz(quizData) {
    const response = await api.post('/quiz?action=create', quizData)
    return response.data
  },
  async createManualQuiz(quizData) {
    console.log("Sending quiz data to backend:", quizData);
    try {
      const response = await api.post('/quiz?action=create', quizData);
      console.log("Backend response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating quiz:", error);
      console.error("Error response:", error.response);
      throw error;
    }
  }
}