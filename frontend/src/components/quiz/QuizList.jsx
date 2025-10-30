import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { quizService } from '../../services/quizService'
import LoadingSpinner from '../common/LoadingSpinner'

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([])
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTopic, setFilterTopic] = useState('')

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    filterQuizzes()
  }, [quizzes, searchTerm, filterTopic])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await quizService.getPublicQuizzes()
      setQuizzes(response.quizzes || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterQuizzes = () => {
    let filtered = quizzes

    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.creator_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterTopic) {
      filtered = filtered.filter(quiz =>
        quiz.topic.toLowerCase() === filterTopic.toLowerCase()
      )
    }

    setFilteredQuizzes(filtered)
  }

  const getUniqueTopics = () => {
    const topics = quizzes.map(quiz => quiz.topic)
    return [...new Set(topics)]
  }

  if (loading) {
    return <LoadingSpinner text="Loading quizzes..." />
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <i className="fas fa-question-circle me-2 text-primary"></i>
              Available Quizzes
            </h1>
            <Link to="/generate-quiz" className="btn btn-primary">
              <i className="fas fa-robot me-1"></i>
              Generate AI Quiz
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search quizzes by title, topic, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
              >
                <option value="">All Topics</option>
                {getUniqueTopics().map(topic => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quizzes Grid */}
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-question-circle fa-4x text-muted mb-3"></i>
              <h3 className="text-muted">No quizzes found</h3>
              <p className="text-muted">
                {quizzes.length === 0 
                  ? "No quizzes available at the moment. Check back later!"
                  : "No quizzes match your search criteria."
                }
              </p>
              {quizzes.length === 0 && (
                <Link to="/generate-quiz" className="btn btn-primary mt-3">
                  <i className="fas fa-robot me-1"></i>
                  Generate the First Quiz
                </Link>
              )}
            </div>
          ) : (
            <div className="row g-4">
              {filteredQuizzes.map(quiz => (
                <div key={quiz.id} className="col-md-6 col-lg-4">
                  <div className="quiz-card card h-100">
                    <div className="quiz-header card-header text-white d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="card-title mb-1">{quiz.title}</h5>
                        <small>By {quiz.creator_name}</small>
                      </div>
                      <span className={`badge ${
                        quiz.difficulty === 'easy' ? 'bg-success' :
                        quiz.difficulty === 'medium' ? 'bg-warning' : 'bg-danger'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                    <div className="card-body">
                      <p className="card-text">
                        <strong>Topic:</strong> {quiz.topic}
                      </p>
                      <p className="card-text">
                        <strong>Source:</strong> 
                        <span className={`badge ms-1 ${
                          quiz.source === 'AI' ? 'bg-info' : 'bg-secondary'
                        }`}>
                          {quiz.source}
                        </span>
                      </p>
                      <div className="mt-3">
                        <small className="text-muted">
                          <i className="fas fa-calendar me-1"></i>
                          Created: {new Date(quiz.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <div className="card-footer bg-transparent">
                      <Link 
                        to={`/quiz/${quiz.id}`}
                        className="btn btn-primary w-100"
                      >
                        <i className="fas fa-play me-1"></i>
                        Start Quiz
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizList