import React, { useState, useEffect } from 'react'
import { quizService } from '../../services/quizService'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../common/LoadingSpinner'
import UserManagement from './UserManagement'
import UserActivity from './UserActivity'

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [pendingQuizzes, setPendingQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      const [pendingRes, analyticsRes] = await Promise.all([
        quizService.getPendingQuizzes(),
        adminService.getAdminAnalytics()
      ])

      setPendingQuizzes(pendingRes.quizzes || [])
      setAnalytics(analyticsRes)
      
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuizAction = async (quizId, action) => {
    try {
      await quizService.updateQuizStatus({
        quiz_id: quizId,
        status: action
      })
      
      fetchAdminData()
      alert(`Quiz ${action} successfully!`)
      
    } catch (error) {
      console.error('Error updating quiz status:', error)
      alert('Failed to update quiz status')
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await quizService.deleteQuiz(quizId)
        fetchAdminData()
        alert('Quiz deleted successfully!')
      } catch (error) {
        console.error('Error deleting quiz:', error)
        alert('Failed to delete quiz')
      }
    }
  }

  const handleViewUserActivity = (user) => {
    setSelectedUser(user)
    setActiveTab('user-activity')
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num)
  }

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />
  }

  if (!analytics) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          <h4>Failed to load admin dashboard</h4>
          <p>Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">
            <i className="fas fa-cog me-2 text-primary"></i>
            Admin Dashboard
          </h1>

          {/* Quick Stats */}
          <div className="row g-4 mb-5">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h3>{formatNumber(analytics.users.total_users)}</h3>
                      <p className="mb-0">Total Users</p>
                      <small>{analytics.users.active_users} active</small>
                    </div>
                    <i className="fas fa-users fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h3>{formatNumber(analytics.quizzes.total_quizzes)}</h3>
                      <p className="mb-0">Total Quizzes</p>
                      <small>{analytics.quizzes.pending_quizzes} pending</small>
                    </div>
                    <i className="fas fa-question-circle fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h3>{formatNumber(analytics.attempts.total_attempts)}</h3>
                      <p className="mb-0">Quiz Attempts</p>
                      <small>{analytics.attempts.accuracy_rate}% accuracy</small>
                    </div>
                    <i className="fas fa-play-circle fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h3>{analytics.attempts.platform_avg_score}%</h3>
                      <p className="mb-0">Avg. Score</p>
                      <small>Platform average</small>
                    </div>
                    <i className="fas fa-chart-line fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-chart-bar me-1"></i>
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="fas fa-users me-1"></i>
                User Management
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <i className="fas fa-clock me-1"></i>
                Pending Reviews
                {pendingQuizzes.length > 0 && (
                  <span className="badge bg-danger ms-1">
                    {pendingQuizzes.length}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'quizzes' ? 'active' : ''}`}
                onClick={() => setActiveTab('quizzes')}
              >
                <i className="fas fa-edit me-1"></i>
                Quiz Management
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="fas fa-chart-line me-2"></i>
                        Platform Overview
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h6>Platform Statistics</h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <tbody>
                                <tr>
                                  <td><strong>Total Users:</strong></td>
                                  <td>{formatNumber(analytics.users.total_users)}</td>
                                </tr>
                                <tr>
                                  <td><strong>Active Users (30 days):</strong></td>
                                  <td>{formatNumber(analytics.users.active_users)}</td>
                                </tr>
                                <tr>
                                  <td><strong>New Users (7 days):</strong></td>
                                  <td>{formatNumber(analytics.users.new_users_week)}</td>
                                </tr>
                                <tr>
                                  <td><strong>Total Quizzes:</strong></td>
                                  <td>{formatNumber(analytics.quizzes.total_quizzes)}</td>
                                </tr>
                                <tr>
                                  <td><strong>AI Quizzes:</strong></td>
                                  <td>{formatNumber(analytics.quizzes.ai_quizzes)}</td>
                                </tr>
                                <tr>
                                  <td><strong>Manual Quizzes:</strong></td>
                                  <td>{formatNumber(analytics.quizzes.manual_quizzes)}</td>
                                </tr>
                                <tr>
                                  <td><strong>Total Attempts:</strong></td>
                                  <td>{formatNumber(analytics.attempts.total_attempts)}</td>
                                </tr>
                                <tr>
                                  <td><strong>Unique Quizzes Taken:</strong></td>
                                  <td>{formatNumber(analytics.attempts.unique_quizzes_taken)}</td>
                                </tr>
                                <tr>
                                  <td><strong>Platform Average Score:</strong></td>
                                  <td>{analytics.attempts.platform_avg_score}%</td>
                                </tr>
                                <tr>
                                  <td><strong>Total Learning Time:</strong></td>
                                  <td>{formatTime(analytics.attempts.total_time_spent)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h6>Popular Topics</h6>
                          {analytics.popular_topics.length === 0 ? (
                            <p className="text-muted">No topic data available yet.</p>
                          ) : (
                            <div className="list-group">
                              {analytics.popular_topics.slice(0, 5).map((topic, index) => (
                                <div key={index} className="list-group-item">
                                  <div className="d-flex w-100 justify-content-between">
                                    <h6 className="mb-1">{topic.topic}</h6>
                                    <small>{topic.attempt_count} attempts</small>
                                  </div>
                                  <p className="mb-1">
                                    Avg. Score: <strong>{topic.avg_score}%</strong>
                                  </p>
                                  <small className="text-muted">
                                    {topic.unique_quizzes} unique quizzes
                                  </small>
                                </div>
                              ))}
                            </div>
                          )}

                          <h6 className="mt-4">Top Performers</h6>
                          {analytics.top_users.length === 0 ? (
                            <p className="text-muted">No user data available yet.</p>
                          ) : (
                            <div className="list-group">
                              {analytics.top_users.slice(0, 5).map((user, index) => (
                                <div key={user.id} className="list-group-item">
                                  <div className="d-flex w-100 justify-content-between">
                                    <h6 className="mb-1">{user.name}</h6>
                                    <small>#{index + 1}</small>
                                  </div>
                                  <p className="mb-1">
                                    Avg. Score: <strong>{user.avg_score}%</strong>
                                  </p>
                                  <small className="text-muted">
                                    {user.total_attempts} attempts • {formatTime(user.total_time)}
                                  </small>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <UserManagement onViewUserActivity={handleViewUserActivity} />
            )}

            {/* User Activity Tab */}
            {activeTab === 'user-activity' && selectedUser && (
              <UserActivity 
                user={selectedUser} 
                onBack={() => setActiveTab('users')} 
              />
            )}

            {/* Pending Reviews Tab */}
            {activeTab === 'pending' && (
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="fas fa-clock me-2"></i>
                        Pending AI Quiz Reviews
                      </h5>
                      <span className="badge bg-warning">
                        {pendingQuizzes.length} quizzes awaiting review
                      </span>
                    </div>
                    <div className="card-body">
                      {pendingQuizzes.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
                          <h4 className="text-success">All Caught Up!</h4>
                          <p className="text-muted">
                            There are no pending quizzes to review at the moment.
                          </p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Topic</th>
                                <th>Creator</th>
                                <th>Difficulty</th>
                                <th>Created</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingQuizzes.map(quiz => (
                                <tr key={quiz.id}>
                                  <td>
                                    <strong>{quiz.title}</strong>
                                  </td>
                                  <td>
                                    <span className="badge bg-secondary">
                                      {quiz.topic}
                                    </span>
                                  </td>
                                  <td>{quiz.creator_name}</td>
                                  <td>
                                    <span className={`badge ${
                                      quiz.difficulty === 'easy' ? 'bg-success' :
                                      quiz.difficulty === 'medium' ? 'bg-warning' : 'bg-danger'
                                    }`}>
                                      {quiz.difficulty}
                                    </span>
                                  </td>
                                  <td>
                                    {new Date(quiz.created_at).toLocaleDateString()}
                                  </td>
                                  <td>
                                    <div className="btn-group btn-group-sm">
                                      <button
                                        className="btn btn-success"
                                        onClick={() => handleQuizAction(quiz.id, 'published')}
                                        title="Publish Quiz"
                                      >
                                        <i className="fas fa-check me-1"></i>
                                        Approve
                                      </button>
                                      <button
                                        className="btn btn-danger"
                                        onClick={() => handleQuizAction(quiz.id, 'rejected')}
                                        title="Reject Quiz"
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                      <button
                                        className="btn btn-outline-danger"
                                        onClick={() => handleDeleteQuiz(quiz.id)}
                                        title="Delete Quiz"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
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
              </div>
            )}

            {/* Quiz Management Tab */}
            {activeTab === 'quizzes' && (
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="fas fa-edit me-2"></i>
                        Quiz Management
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        Full quiz management features including editing existing quizzes 
                        will be implemented in the next version.
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="card text-center">
                            <div className="card-body">
                              <i className="fas fa-list fa-3x text-primary mb-3"></i>
                              <h5>View All Quizzes</h5>
                              <p className="text-muted">Browse all created quizzes</p>
                              <button className="btn btn-primary">
                                View Quizzes
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card text-center">
                            <div className="card-body">
                              <i className="fas fa-edit fa-3x text-warning mb-3"></i>
                              <h5>Edit Quizzes</h5>
                              <p className="text-muted">Modify existing quizzes</p>
                              <button className="btn btn-warning" disabled>
                                Coming Soon
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card text-center">
                            <div className="card-body">
                              <i className="fas fa-plus fa-3x text-success mb-3"></i>
                              <h5>Create Manual Quiz</h5>
                              <p className="text-muted">Create new manual quizzes</p>
                              <button className="btn btn-success">
                                Create Quiz
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard