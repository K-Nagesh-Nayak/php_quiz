import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { quizService } from '../../services/quizService'

const QuizResult = ({ quiz, userAnswers, questions, timeTaken }) => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    calculateResult()
  }, [])

  const calculateResult = async () => {
    try {
      // Calculate score locally first for immediate feedback
      let score = 0
      const questionResults = questions.map(question => {
        const userAnswer = userAnswers[question.id]
        const isCorrect = userAnswer === question.correct_answer
        if (isCorrect) score++
        
        return {
          ...question,
          userAnswer,
          isCorrect
        }
      })

      const percentage = Math.round((score / questions.length) * 100)
      
      const localResult = {
        score,
        total_questions: questions.length,
        percentage,
        time_taken: timeTaken,
        questionResults
      }

      setResult(localResult)

      // Submit to server
      const serverResult = await quizService.submitQuizResult({
        quiz_id: quiz.id,
        answers: userAnswers,
        time_taken: timeTaken
      })

      // Update with server response if different
      setResult(prev => ({
        ...prev,
        ...serverResult
      }))

    } catch (error) {
      console.error('Error submitting result:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return "Outstanding! You're an expert!"
    if (percentage >= 80) return "Excellent work! You know your stuff!"
    if (percentage >= 70) return "Good job! Solid understanding."
    if (percentage >= 60) return "Not bad! Keep practicing."
    if (percentage >= 50) return "You passed! Room for improvement."
    return "Keep learning! You'll get better."
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return "success"
    if (percentage >= 70) return "primary"
    if (percentage >= 50) return "warning"
    return "danger"
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins > 0 ? `${mins}m ` : ''}${secs}s`
  }

  if (loading || !result) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3"></div>
          <h4>Calculating your results...</h4>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Result Summary */}
          <div className="card shadow-lg mb-4">
            <div className="card-header bg-success text-white text-center py-4">
              <h1 className="display-4 fw-bold mb-3">
                <i className="fas fa-trophy me-3"></i>
                Quiz Completed!
              </h1>
              <h3>{quiz.title}</h3>
            </div>
            <div className="card-body p-5 text-center">
              <div className="row justify-content-center mb-4">
                <div className="col-md-8">
                  <div className={`alert alert-${getPerformanceColor(result.percentage)}`}>
                    <h4 className="alert-heading">
                      {getPerformanceMessage(result.percentage)}
                    </h4>
                    <p className="mb-0">
                      You scored {result.score} out of {result.total_questions} questions correctly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <h1 className={`text-${getPerformanceColor(result.percentage)}`}>
                        {result.percentage}%
                      </h1>
                      <p className="text-muted mb-0">Overall Score</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <h1 className="text-primary">{result.score}/{result.total_questions}</h1>
                      <p className="text-muted mb-0">Correct Answers</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <h1 className="text-info">
                        {formatTime(result.time_taken)}
                      </h1>
                      <p className="text-muted mb-0">Time Taken</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 justify-content-center">
                <div className="col-auto">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/quizzes')}
                  >
                    <i className="fas fa-play me-2"></i>
                    Take Another Quiz
                  </button>
                </div>
                <div className="col-auto">
                  <button 
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate('/analytics')}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    View Analytics
                  </button>
                </div>
                <div className="col-auto">
                  <button 
                    className="btn btn-outline-info btn-lg"
                    onClick={() => navigate('/generate-quiz')}
                  >
                    <i className="fas fa-robot me-2"></i>
                    Generate Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="card">
            <div className="card-header bg-light">
              <h4 className="mb-0">
                <i className="fas fa-list-ol me-2"></i>
                Detailed Results
              </h4>
            </div>
            <div className="card-body">
              {result.questionResults.map((question, index) => (
                <div key={question.id} className="mb-4 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="mb-0">Question {index + 1}</h5>
                    <span className={`badge bg-${question.isCorrect ? 'success' : 'danger'}`}>
                      {question.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <p className="fw-bold mb-3">{question.question_text}</p>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className={`p-3 rounded ${
                        question.isCorrect ? 'bg-success text-white' : 'bg-danger text-white'
                      }`}>
                        <strong>Your Answer:</strong><br />
                        {question.userAnswer || 'Not answered'}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded bg-light">
                        <strong>Correct Answer:</strong><br />
                        {question.correct_answer}
                      </div>
                    </div>
                  </div>

                  {!question.isCorrect && question.userAnswer && (
                    <div className="mt-3 p-2 bg-warning rounded">
                      <small>
                        <i className="fas fa-lightbulb me-1"></i>
                        <strong>Learning Tip:</strong> Review this concept to improve your understanding.
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizResult