import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../common/LoadingSpinner'

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
    <div className="row">
      <div className="col-12">
        {/* Header with Back Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button 
              className="btn btn-outline-secondary btn-sm me-3"
              onClick={onBack}
            >
              <i className="fas fa-arrow-left me-1"></i>
              Back to Users
            </button>
            <h4 className="mb-0">
              <i className="fas fa-chart-line me-2 text-primary"></i>
              User Activity: {userInfo.name}
            </h4>
            <small className="text-muted">{userInfo.email}</small>
          </div>
          <div className="text-end">
            <div className="badge bg-primary">
              Joined: {formatDate(userInfo.created_at)}
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h3>{stats.total_attempts}</h3>
                <p className="mb-0">Total Attempts</p>
                <small>{stats.unique_quizzes} unique quizzes</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h3>{stats.avg_score}%</h3>
                <p className="mb-0">Average Score</p>
                <small>Best: {stats.best_score}%</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h3>{formatTime(stats.total_time)}</h3>
                <p className="mb-0">Total Time</p>
                <small>Learning duration</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h3>
                  {stats.first_activity ? formatDate(stats.first_activity) : 'Never'}
                </h3>
                <p className="mb-0">First Activity</p>
                <small>Last: {stats.last_activity ? formatDate(stats.last_activity) : 'Never'}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Recent Activity */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Recent Quiz Attempts
                </h5>
              </div>
              <div className="card-body">
                {attempts.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No quiz attempts yet</h5>
                    <p className="text-muted">This user hasn't taken any quizzes.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Quiz</th>
                          <th>Topic</th>
                          <th>Score</th>
                          <th>Time</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map(attempt => (
                          <tr key={attempt.id}>
                            <td>
                              <strong>{attempt.quiz_title}</strong>
                            </td>
                            <td>
                              <span className="badge bg-secondary">{attempt.topic}</span>
                            </td>
                            <td>
                              <span className={getScoreColor(attempt.percentage)}>
                                {attempt.percentage}%
                              </span>
                              <br />
                              <small className="text-muted">
                                {attempt.score}/{attempt.total_questions}
                              </small>
                            </td>
                            <td>
                              {formatTime(attempt.time_taken)}
                            </td>
                            <td>
                              {formatDate(attempt.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Topic Performance */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-tags me-2"></i>
                  Topic Performance
                </h5>
              </div>
              <div className="card-body">
                {topics.length === 0 ? (
                  <p className="text-muted">No topic data available.</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {topics.map((topic, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{topic.topic}</strong>
                          <br />
                          <small className="text-muted">
                            {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}
                          </small>
                        </div>
                        <span className={getScoreColor(topic.avg_score)}>
                          {topic.avg_score}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Summary */}
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-chart-pie me-2"></i>
                  Performance Summary
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>Accuracy Rate:</strong>
                  <div className="progress mt-1" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${stats.avg_score}%` }}
                    >
                      {stats.avg_score}%
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <strong>Activity Level:</strong>
                  <div className="mt-1">
                    {stats.total_attempts === 0 ? (
                      <span className="badge bg-secondary">New User</span>
                    ) : stats.total_attempts < 5 ? (
                      <span className="badge bg-info">Casual Learner</span>
                    ) : stats.total_attempts < 15 ? (
                      <span className="badge bg-primary">Active Learner</span>
                    ) : (
                      <span className="badge bg-success">Dedicated Learner</span>
                    )}
                  </div>
                </div>

                <div>
                  <strong>Performance Tier:</strong>
                  <div className="mt-1">
                    {stats.avg_score >= 90 ? (
                      <span className="badge bg-success">Expert</span>
                    ) : stats.avg_score >= 75 ? (
                      <span className="badge bg-primary">Advanced</span>
                    ) : stats.avg_score >= 60 ? (
                      <span className="badge bg-warning">Intermediate</span>
                    ) : stats.avg_score > 0 ? (
                      <span className="badge bg-info">Beginner</span>
                    ) : (
                      <span className="badge bg-secondary">Not Rated</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserActivity