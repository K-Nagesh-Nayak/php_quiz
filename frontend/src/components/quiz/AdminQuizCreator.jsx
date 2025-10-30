import React, { useState } from 'react'
import { quizService } from '../../services/quizService'

const AdminQuizCreator = () => {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    difficulty: 'medium',
    questions: [
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: ''
      }
    ]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleQuizChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[index][field] = value
    setFormData({
      ...formData,
      questions: updatedQuestions
    })
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setFormData({
      ...formData,
      questions: updatedQuestions
    })
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question_text: '',
          options: ['', '', '', ''],
          correct_answer: ''
        }
      ]
    })
  }

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = formData.questions.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        questions: updatedQuestions
      })
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Quiz title is required')
      return false
    }
    if (!formData.topic.trim()) {
      setError('Quiz topic is required')
      return false
    }
    
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i]
      if (!question.question_text.trim()) {
        setError(`Question ${i + 1} text is required`)
        return false
      }
      if (question.options.some(opt => !opt.trim())) {
        setError(`All options for question ${i + 1} are required`)
        return false
      }
      if (!question.correct_answer.trim()) {
        setError(`Correct answer for question ${i + 1} is required`)
        return false
      }
      if (!question.options.includes(question.correct_answer)) {
        setError(`Correct answer for question ${i + 1} must match one of the options`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const result = await quizService.createManualQuiz(formData)
      setSuccess('Quiz created successfully!')
      
      // Reset form
      setFormData({
        title: '',
        topic: '',
        difficulty: 'medium',
        questions: [
          {
            question_text: '',
            options: ['', '', '', ''],
            correct_answer: ''
          }
        ]
      })
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>
                Create Manual Quiz
              </h3>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Quiz Basic Info */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Quiz Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleQuizChange}
                        placeholder="Enter quiz title"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Topic *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="topic"
                        value={formData.topic}
                        onChange={handleQuizChange}
                        placeholder="Enter topic"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="mb-3">
                      <label className="form-label">Difficulty</label>
                      <select
                        className="form-select"
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleQuizChange}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Questions</h5>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={addQuestion}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Add Question
                    </button>
                  </div>

                  {formData.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="card mb-3">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Question {questionIndex + 1}</h6>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeQuestion(questionIndex)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                      <div className="card-body">
                        {/* Question Text */}
                        <div className="mb-3">
                          <label className="form-label">Question Text *</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(questionIndex, 'question_text', e.target.value)}
                            placeholder="Enter the question"
                            required
                          />
                        </div>

                        {/* Options */}
                        <div className="mb-3">
                          <label className="form-label">Options *</label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="input-group mb-2">
                              <span className="input-group-text">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                value={option}
                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                required
                              />
                            </div>
                          ))}
                        </div>

                        {/* Correct Answer */}
                        <div className="mb-3">
                          <label className="form-label">Correct Answer *</label>
                          <select
                            className="form-select"
                            value={question.correct_answer}
                            onChange={(e) => handleQuestionChange(questionIndex, 'correct_answer', e.target.value)}
                            required
                          >
                            <option value="">Select correct answer</option>
                            {question.options.map((option, index) => (
                              <option 
                                key={index} 
                                value={option}
                                disabled={!option.trim()}
                              >
                                {option || `Option ${String.fromCharCode(65 + index)}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Quiz...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Create Quiz
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminQuizCreator