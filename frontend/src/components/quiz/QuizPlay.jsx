import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quizService } from '../../services/quizService'
import QuestionCard from './QuestionCard'
import QuizResult from './QuizResult'
import LoadingSpinner from '../common/LoadingSpinner'

const QuizPlay = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQuizData()
  }, [id])

  useEffect(() => {
    let timer
    if (quizStarted && !quizCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [quizStarted, quizCompleted])

  const fetchQuizData = async () => {
    try {
      setLoading(true)
      const response = await quizService.getQuizQuestions(id)
      setQuiz(response.quiz)
      setQuestions(response.questions || [])
    } catch (error) {
      setError('Failed to load quiz. Please try again.')
      console.error('Error fetching quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setTimeElapsed(0)
  }

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }
const completeQuiz = async () => {
  try {
    setQuizCompleted(true)
    
    const result = await quizService.submitQuizResult({
      quiz_id: parseInt(id),
      answers: userAnswers,
      time_taken: timeElapsed
    })

    // Check if this was a duplicate submission
    if (result.duplicate_prevention) {
      alert('You have already submitted this quiz recently. Using your previous result.');
      // You might want to fetch the previous result here
    }
    
  } catch (error) {
    if (error.response?.data?.duplicate_prevention) {
      alert('You have already submitted this quiz recently. Please wait before trying again.');
    } else {
      console.error('Error submitting quiz:', error)
      alert('Failed to submit quiz. Please try again.');
    }
  }
}
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      completeQuiz()
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index)
  }

//   const completeQuiz = async () => {
//     try {
//       setQuizCompleted(true)
      
//       const result = await quizService.submitQuizResult({
//         quiz_id: parseInt(id),
//         answers: userAnswers,
//         time_taken: timeElapsed
//       })

//       // Pass result to QuizResult component via state
//       // This will be handled by the QuizResult component
//     } catch (error) {
//       console.error('Error submitting quiz:', error)
//     }
//   }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <LoadingSpinner text="Loading quiz..." />
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h4>{error}</h4>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/quizzes')}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <h4>Quiz not found</h4>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/quizzes')}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    return (
      <QuizResult 
        quiz={quiz}
        userAnswers={userAnswers}
        questions={questions}
        timeTaken={timeElapsed}
      />
    )
  }

  if (!quizStarted) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center py-4">
                <h1 className="display-5 fw-bold mb-3">{quiz.title}</h1>
                <div className="row justify-content-center">
                  <div className="col-auto">
                    <span className="badge bg-light text-dark fs-6">
                      <i className="fas fa-tag me-1"></i>
                      {quiz.topic}
                    </span>
                  </div>
                  <div className="col-auto">
                    <span className={`badge fs-6 ${
                      quiz.difficulty === 'easy' ? 'bg-success' :
                      quiz.difficulty === 'medium' ? 'bg-warning' : 'bg-danger'
                    }`}>
                      <i className="fas fa-chart-line me-1"></i>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <div className="col-auto">
                    <span className="badge bg-info fs-6">
                      <i className="fas fa-list-ol me-1"></i>
                      {questions.length} questions
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <i className="fas fa-brain fa-4x text-primary mb-3"></i>
                  <h3>Ready to Test Your Knowledge?</h3>
                  <p className="lead text-muted">
                    This quiz contains {questions.length} questions about {quiz.topic}. 
                    You'll have unlimited time, but your completion time will be recorded.
                  </p>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <i className="fas fa-clock text-primary fa-2x mb-2"></i>
                        <h5>Timed</h5>
                        <p className="text-muted mb-0">Your time will be recorded</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <i className="fas fa-check-circle text-success fa-2x mb-2"></i>
                        <h5>Instant Results</h5>
                        <p className="text-muted mb-0">Get your score immediately</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-lg px-5 py-3"
                  onClick={startQuiz}
                >
                  <i className="fas fa-play me-2"></i>
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="container mt-4">
      {/* Quiz Header */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h4 className="mb-1">{quiz.title}</h4>
              <p className="text-muted mb-0">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="timer mb-2">
                <i className="fas fa-clock me-2"></i>
                {formatTime(timeElapsed)}
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`btn btn-sm ${
                  index === currentQuestionIndex 
                    ? 'btn-primary' 
                    : userAnswers[questions[index].id] 
                    ? 'btn-success' 
                    : 'btn-outline-secondary'
                }`}
                onClick={() => goToQuestion(index)}
                style={{ width: '40px', height: '40px' }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={userAnswers[currentQuestion.id]}
          onAnswerSelect={(answer) => handleAnswerSelect(currentQuestion.id, answer)}
        />
      )}

      {/* Navigation Buttons */}
      <div className="row mt-4">
        <div className="col-6">
          <button
            className="btn btn-outline-primary"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Previous
          </button>
        </div>
        <div className="col-6 text-end">
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              className="btn btn-success"
              onClick={completeQuiz}
            >
              Submit Quiz
              <i className="fas fa-check ms-2"></i>
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={goToNextQuestion}
              disabled={!userAnswers[currentQuestion.id]}
            >
              Next
              <i className="fas fa-arrow-right ms-2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizPlay