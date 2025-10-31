import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../common/LoadingSpinner'
import '../../assets/performance.css'

const UserActivity = ({ user, onBack }) => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserActivity()
  }, [user])

  const fetchUserActivity = async () => {
    try {
      setLoading(true)
      const response = await adminService.getUserActivity(user.id)
      setUserData(response)
    } catch (error) {
      console.error('Error fetching user activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds) => {
    if (!seconds) return '0m'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-success'
    if (percentage >= 60) return 'text-warning'
    return 'text-danger'
  }

  if (loading) {
    return <LoadingSpinner text="Loading user activity..." />
  }

  if (!userData) {
    return (
      <div className="alert alert-danger">
        Failed to load user activity data.
      </div>
    )
  }

  const { user: userInfo, stats, attempts, topics } = userData

 return (
  <div className="container-fluid py-3">
    {/* Header */}
    <div className="user-header-card">
      <div className="header-content">
        <button className="back-btn" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        
        <div className="user-info">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="user-details">
            <h2 className="user-name">{userInfo.name}</h2>
            <p className="user-email">{userInfo.email}</p>
          </div>
        </div>
      </div>

      <div className="header-meta">
        <span className="join-date">
          <i className="far fa-calendar-alt"></i>
          Joined: {formatDate(userInfo.created_at)}
        </span>
      </div>
    </div>

    {/* Stats Overview */}
    <div className="stats-grid">
      <div className="stat-card attempts">
        <div className="stat-icon">
          <i className="fas fa-list-check"></i>
        </div>
        <div className="stat-content">
          <h3>{stats.total_attempts}</h3>
          <p>Total Attempts</p>
          <span className="stat-sub">{stats.unique_quizzes} unique quizzes</span>
        </div>
      </div>

      <div className="stat-card score">
        <div className="stat-icon">
          <i className="fas fa-bullseye"></i>
        </div>
        <div className="stat-content">
          <h3>{stats.avg_score}%</h3>
          <p>Average Score</p>
          <span className="stat-sub">Best: {stats.best_score}%</span>
        </div>
        <div className="score-progress">
          <div className="progress-bar" style={{width: `${stats.avg_score}%`}}></div>
        </div>
      </div>

      <div className="stat-card time">
        <div className="stat-icon">
          <i className="fas fa-clock"></i>
        </div>
        <div className="stat-content">
          <h3>{formatTime(stats.total_time)}</h3>
          <p>Learning Time</p>
          <span className="stat-sub">Total duration</span>
        </div>
      </div>

      <div className="stat-card activity">
        <div className="stat-icon">
          <i className="fas fa-calendar-alt"></i>
        </div>
        <div className="stat-content">
          <h3>{stats.first_activity ? formatDate(stats.first_activity, true) : 'Never'}</h3>
          <p>First Activity</p>
          <span className="stat-sub">Last: {stats.last_activity ? formatDate(stats.last_activity, true) : 'Never'}</span>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="content-grid">
      {/* Recent Attempts */}
      <div className="content-card main-content p-2">
        <div className="card-header">
          <div className="header-title mx-2">
            <i className="fas fa-history"></i>
            Recent Quiz Attempts
          </div>
          <span className="attempts-count mx-2">{attempts.length} attempts</span>
        </div>
        
        <div className="card-body">
          {attempts.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-question-circle"></i>
              <h4>No quiz attempts yet</h4>
              <p>This user hasn't taken any quizzes.</p>
            </div>
          ) : (
            <div className="attempts-list">
              {attempts.map(a => (
                <div key={a.id} className="attempt-item">
                  <div className="attempt-main">
                    <h4 className="quiz-title">{a.quiz_title}</h4>
                    <div className="attempt-meta">
                      <span className="topic-badge">{a.topic}</span>
                      <span className="date">{formatDate(a.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="attempt-stats">
                    <div className="score-display">
                      <span className={`score ${getScoreColor(a.percentage)}`}>
                        {a.percentage}%
                      </span>
                      <small>{a.score}/{a.total_questions}</small>
                    </div>
                    <div className="time-display">
                      <i className="fas fa-clock"></i>
                      {formatTime(a.time_taken)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Topic Performance */}
        <div className="content-card p-2">
          <div className="card-header">
            <div className="header-title">
              <i className="fas fa-tags"></i>
              Topic Performance
            </div>
          </div>
          
          <div className="card-body">
            {topics.length === 0 ? (
              <p className="no-data">No topic data available.</p>
            ) : (
              <div className="topics-list">
                {topics.map((t, i) => (
                  <div key={i} className="topic-item">
                    <div className="topic-info">
                      <span className="topic-name">{t.topic}</span>
                      <span className="attempt-count">{t.attempts} attempt{t.attempts !== 1 ? 's' : ''}</span>
                    </div>
                    <span className={`topic-score ${getScoreColor(t.avg_score)}`}>
                      {t.avg_score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="content-card p-2">
          <div className="card-header">
            <div className="header-title">
              <i className="fas fa-chart-pie"></i>
              Performance Summary
            </div>
          </div>
          
          <div className="card-body">
            <div className="summary-item">
              <div className="summary-header">
                <span>Accuracy Rate</span>
                <strong>{stats.avg_score}%</strong>
              </div>
              <div className="progress-container">
                <div 
                  className="progress-fill" 
                  style={{width: `${stats.avg_score}%`}}
                ></div>
              </div>
            </div>

            <div className="summary-item">
              <div className="summary-header">
                <span>Activity Level</span>
              </div>
              <div className="level-badge">
                {stats.total_attempts === 0 ? (
                  <span className="badge new">New User</span>
                ) : stats.total_attempts < 5 ? (
                  <span className="badge casual">Casual Learner</span>
                ) : stats.total_attempts < 15 ? (
                  <span className="badge active">Active Learner</span>
                ) : (
                  <span className="badge dedicated">Dedicated Learner</span>
                )}
              </div>
            </div>

            <div className="summary-item">
              <div className="summary-header">
                <span>Performance Tier</span>
              </div>
              <div className="level-badge">
                {stats.avg_score >= 90 ? (
                  <span className="badge expert">Expert</span>
                ) : stats.avg_score >= 75 ? (
                  <span className="badge advanced">Advanced</span>
                ) : stats.avg_score >= 60 ? (
                  <span className="badge intermediate">Intermediate</span>
                ) : stats.avg_score > 0 ? (
                  <span className="badge beginner">Beginner</span>
                ) : (
                  <span className="badge not-rated">Not Rated</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

export default UserActivity