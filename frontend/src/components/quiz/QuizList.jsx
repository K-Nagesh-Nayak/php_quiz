import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { quizService } from '../../services/quizService'
import LoadingSpinner from '../common/LoadingSpinner'
import '../../assets/quizList.css'
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
    <div className="quizzes-container">
      {/* Header */}
      <div className="quizzes-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-icon">
              <i className="fas fa-question-circle"></i>
            </div>
            <div>
              <h1>Available Quizzes</h1>
              <p>Test your knowledge with our curated collection</p>
            </div>
          </div>
          <Link to="/generate-quiz" className="generate-btn">
            <i className="fas fa-robot"></i>
            Generate AI Quiz
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search quizzes by title, topic, or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <select
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
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{filteredQuizzes.length}</span>
          <span className="stat-label">Showing</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{quizzes.length}</span>
          <span className="stat-label">Total Quizzes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{getUniqueTopics().length}</span>
          <span className="stat-label">Topics</span>
        </div>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-question-circle"></i>
          </div>
          <h3>No quizzes found</h3>
          <p>
            {quizzes.length === 0
              ? "No quizzes available at the moment. Check back later!"
              : "No quizzes match your search criteria."
            }
          </p>
          {quizzes.length === 0 && (
            <Link to="/generate-quiz" className="cta-btn">
              <i className="fas fa-robot"></i>
              Generate the First Quiz
            </Link>
          )}
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map(quiz => (
            <div key={quiz.id} className="quiz-card">
              <div className="quiz-card-header">
                <div className="quiz-meta">
                  <span className={`difficulty-badge ${quiz.difficulty}`}>
                    <i className="fas fa-signal"></i>
                    {quiz.difficulty}
                  </span>
                  <span className={`source-badge ${quiz.source.toLowerCase()}`}>
                    <i className={`fas ${quiz.source === 'AI' ? 'fa-robot' : 'fa-edit'}`}></i>
                    {quiz.source}
                  </span>
                </div>
                <h3 className="quiz-title">{quiz.title}</h3>
                <div className="creator-info">
                  <div className="creator-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <span>By {quiz.creator_name}</span>
                </div>
              </div>

              <div className="quiz-card-body">
                <div className="topic-section">
                  <i className="fas fa-tag"></i>
                  <span>{quiz.topic}</span>
                </div>
                <div className="quiz-date">
                  <i className="fas fa-calendar"></i>
                  Created {new Date(quiz.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="quiz-card-footer">
                <Link to={`/quiz/${quiz.id}`} className="start-quiz-btn">
                  <i className="fas fa-play"></i>
                  Start Quiz
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizList