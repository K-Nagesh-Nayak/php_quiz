import React, { useState, useEffect } from 'react'
import { quizService } from '../../services/quizService'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../common/LoadingSpinner'
import UserManagement from './UserManagement'
import UserActivity from './UserActivity'

import '../../assets/performance.css'

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
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="fw-bold mb-4 d-flex align-items-center text-white">
            <i className="fas fa-cog me-2 text-white"></i>
            Admin Dashboard
          </h1>

          {/* Quick Stats */}
          <div className="row g-4 mb-5">
            {[
              {
                color: "primary",
                icon: "users",
                title: "Total Users",
                value: formatNumber(analytics.users.total_users),
                sub: `${analytics.users.active_users} active`,
              },
              {
                color: "success",
                icon: "question-circle",
                title: "Total Quizzes",
                value: formatNumber(analytics.quizzes.total_quizzes),
                sub: `${analytics.quizzes.pending_quizzes} pending`,
              },
              {
                color: "info",
                icon: "play-circle",
                title: "Quiz Attempts",
                value: formatNumber(analytics.attempts.total_attempts),
                sub: `${analytics.attempts.accuracy_rate}% accuracy`,
              },
              {
                color: "warning",
                icon: "chart-line",
                title: "Avg. Score",
                value: `${analytics.attempts.platform_avg_score}%`,
                sub: "Platform average",
              },
            ].map((item, i) => (
              <div className="col-md-3" key={i}>
                <div
                  className={`card border-0 shadow-sm bg-${item.color} text-white rounded-4 h-100`}
                >
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="fw-bold mb-0">{item.value}</h3>
                      <p className="mb-0">{item.title}</p>
                      <small className="opacity-75">{item.sub}</small>
                    </div>
                    <i
                      className={`fas fa-${item.icon} fa-2x opacity-50`}
                      style={{ fontSize: "2rem" }}
                    ></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-pills mb-4 bg-light p-2 rounded-4 shadow-sm">
            {[
              { id: "overview", icon: "chart-bar", label: "Overview" },
              { id: "users", icon: "users", label: "User Management" },
              {
                id: "pending",
                icon: "clock",
                label: "Pending Reviews",
                badge: pendingQuizzes.length,
              },
              { id: "quizzes", icon: "edit", label: "Quiz Management" },
            ].map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link d-flex align-items-center px-3 ${activeTab === tab.id
                    ? "active bg-primary text-white"
                    : "text-dark"
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`fas fa-${tab.icon} me-2`}></i>
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="badge bg-danger ms-2">{tab.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="card border-0 shadow-sm rounded-3 modern-platform-card">
                <div className="card-header bg-white py-3 px-4 border-0 modern-card-header">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="header-icon-wrapper me-3">
                        <i className="fas fa-chart-network"></i>
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold text-dark">Platform Analytics</h5>
                        <p className="mb-0 text-muted small">Real-time performance metrics</p>
                      </div>
                    </div>
                    <div className="active-users-badge">
                      <span className="badge bg-primary">
                        <i className="fas fa-users me-1"></i>
                        {formatNumber(analytics.users.active_users)} active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-body p-4">
                  {/* Compact Stats Grid */}
                  <div className="row g-3 mb-4">
                    <div className="col-xl-2 col-md-4 col-6">
                      <div className="compact-stat-card users">
                        <div className="stat-icon">
                          <i className="fas fa-users"></i>
                        </div>
                        <div className="stat-content">
                          <h4 className="stat-number">{formatNumber(analytics.users.total_users)}</h4>
                          <p className="stat-label">Total Users</p>
                          <small className="stat-change text-success">
                            +{formatNumber(analytics.users.new_users_week)} new
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-2 col-md-4 col-6">
                      <div className="compact-stat-card quizzes">
                        <div className="stat-icon">
                          <i className="fas fa-question-circle"></i>
                        </div>
                        <div className="stat-content">
                          <h4 className="stat-number">{formatNumber(analytics.quizzes.total_quizzes)}</h4>
                          <p className="stat-label">Total Quizzes</p>
                          <div className="d-flex gap-1 mt-1">
                            <small className="ai-badge">{formatNumber(analytics.quizzes.ai_quizzes)} AI</small>
                            <small className="manual-badge">{formatNumber(analytics.quizzes.manual_quizzes)} M</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-2 col-md-4 col-6">
                      <div className="compact-stat-card attempts">
                        <div className="stat-icon">
                          <i className="fas fa-play-circle"></i>
                        </div>
                        <div className="stat-content">
                          <h4 className="stat-number">{formatNumber(analytics.attempts.total_attempts)}</h4>
                          <p className="stat-label">Total Attempts</p>
                          <small className="stat-meta">
                            {formatNumber(analytics.attempts.unique_quizzes_taken)} unique
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-2 col-md-4 col-6">
                      <div className="compact-stat-card performance">
                        <div className="stat-icon">
                          <i className="fas fa-trophy"></i>
                        </div>
                        <div className="stat-content">
                          <h4 className="stat-number">{analytics.attempts.platform_avg_score}%</h4>
                          <p className="stat-label">Avg Score</p>
                          <div className="score-progress">
                            <div
                              className="progress-fill"
                              style={{ width: `${analytics.attempts.platform_avg_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-2 col-md-4 col-6">
                      <div className="compact-stat-card time">
                        <div className="stat-icon">
                          <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-content">
                          <h4 className="stat-number">{formatTime(analytics.attempts.total_time_spent)}</h4>
                          <p className="stat-label">Learning Time</p>
                          <small className="stat-meta">Total spent</small>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-2 col-md-4 col-6">
                      <div className="compact-stat-card engagement">
                        <div className="stat-icon">
                          <i className="fas fa-chart-line"></i>
                        </div>
                        <div className="stat-content">
                          <h4 className="stat-number">
                            {analytics.quizzes.total_quizzes > 0 ? Math.round((analytics.attempts.unique_quizzes_taken / analytics.quizzes.total_quizzes) * 100) : 0}%
                          </h4>
                          <p className="stat-label">Quiz Usage</p>
                          <small className="stat-meta">Coverage rate</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Combined Topics and Performers in single row */}
                  <div className="row g-4">
                    {/* Popular Topics - More Compact */}
                    <div className="col-lg-6">
                      <div className="section-card compact-section">
                        <div className="section-header compact-header">
                          <h6 className="section-title mb-0">
                            <i className="fas fa-tags me-2 text-primary"></i>
                            Popular Topics
                          </h6>
                          <span className="section-badge">{analytics.popular_topics.length} topics</span>
                        </div>

                        {analytics.popular_topics.length === 0 ? (
                          <div className="empty-state compact">
                            <i className="fas fa-inbox"></i>
                            <p>No topic data</p>
                          </div>
                        ) : (
                          <div className="compact-list">
                            {analytics.popular_topics.slice(0, 6).map((topic, index) => (
                              <div key={index} className="compact-item">
                                <div className="item-main">
                                  <div className="item-rank">#{index + 1}</div>
                                  <div className="item-content">
                                    <h6 className="item-title">{topic.topic}</h6>
                                    <div className="item-meta">
                                      <span className="meta-item">
                                        <i className="fas fa-star text-warning"></i>
                                        {topic.avg_score}%
                                      </span>
                                      <span className="meta-item">
                                        <i className="fas fa-puzzle-piece"></i>
                                        {topic.unique_quizzes}
                                      </span>
                                      <span className="meta-item">
                                        <i className="fas fa-play"></i>
                                        {topic.attempt_count}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="item-progress">
                                  <div
                                    className="progress-bar compact"
                                    style={{ width: `${topic.avg_score}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Performers - More Compact */}
                    <div className="col-lg-6">
                      <div className="section-card compact-section">
                        <div className="section-header compact-header">
                          <h6 className="section-title mb-0">
                            <i className="fas fa-crown me-2 text-warning"></i>
                            Top Performers
                          </h6>
                          <span className="section-badge">{analytics.top_users.length} users</span>
                        </div>

                        {analytics.top_users.length === 0 ? (
                          <div className="empty-state compact">
                            <i className="fas fa-users"></i>
                            <p>No user data</p>
                          </div>
                        ) : (
                          <div className="compact-list">
                            {analytics.top_users.slice(0, 6).map((user, index) => (
                              <div key={user.id} className={`compact-item performer ${index === 0 ? 'top-performer' : ''}`}>
                                <div className="item-main">
                                  <div className={`item-rank ${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''}`}>
                                    {index + 1}
                                  </div>
                                  <div className="performer-avatar">
                                    <i className="fas fa-user"></i>
                                  </div>
                                  <div className="item-content">
                                    <h6 className="item-title">{user.name}</h6>
                                    <div className="item-meta">
                                      <span className="meta-item">
                                        <i className="fas fa-star text-warning"></i>
                                        {user.avg_score}%
                                      </span>
                                      <span className="meta-item">
                                        <i className="fas fa-play"></i>
                                        {user.total_attempts}
                                      </span>
                                      <span className="meta-item">
                                        <i className="fas fa-clock"></i>
                                        {formatTime(user.total_time)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {index === 0 && (
                                  <div className="top-indicator">
                                    <i className="fas fa-crown text-warning"></i>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Management */}
            {activeTab === "users" && (
              <UserManagement onViewUserActivity={handleViewUserActivity} />
            )}

            {/* User Activity */}
            {activeTab === "user-activity" && selectedUser && (
              <UserActivity
                user={selectedUser}
                onBack={() => setActiveTab("users")}
              />
            )}

            {/* Pending Reviews */}
            {activeTab === "pending" && (
              <div className="card border-0 shadow-sm rounded-3 modern-pending-card">
                <div className="card-header bg-white py-3 px-4 border-0 d-flex justify-content-between align-items-center modern-card-header">
                  <div className="d-flex align-items-center">
                    <div className="header-icon-wrapper me-3">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">Pending AI Quiz Reviews</h5>
                      <p className="mb-0 text-muted small">Quizzes awaiting approval</p>
                    </div>
                  </div>
                  <span className="pending-count-badge">
                    {pendingQuizzes.length} awaiting review
                  </span>
                </div>

                <div className="card-body p-0">
                  {pendingQuizzes.length === 0 ? (
                    <div className="empty-state-compact">
                      <div className="empty-icon">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <h5>All Caught Up!</h5>
                      <p className="text-muted">No pending quizzes to review</p>
                    </div>
                  ) : (
                    <div className="pending-quizzes-list">
                      {pendingQuizzes.map((quiz) => (
                        <div key={quiz.id} className="pending-quiz-item">
                          <div className="quiz-main-info">
                            <div className="quiz-title-section">
                              <h6 className="quiz-title">{quiz.title}</h6>
                              <div className="quiz-meta">
                                <span className="creator">
                                  <i className="fas fa-user me-1"></i>
                                  {quiz.creator_name}
                                </span>
                                <span className="created-date">
                                  <i className="fas fa-calendar me-1"></i>
                                  {new Date(quiz.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="quiz-tags">
                              <span className={`difficulty-badge ${quiz.difficulty}`}>
                                <i className={`fas fa-signal me-1`}></i>
                                {quiz.difficulty}
                              </span>
                              <span className="topic-badge">
                                <i className="fas fa-tag me-1"></i>
                                {quiz.topic}
                              </span>
                            </div>
                          </div>

                          <div className="quiz-actions">
                            <button
                              className="btn btn-success btn-sm action-btn approve-btn"
                              onClick={() => handleQuizAction(quiz.id, "published")}
                              title="Approve Quiz"
                            >
                              <i className="fas fa-check"></i>
                              <span>Approve</span>
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm action-btn reject-btn"
                              onClick={() => handleQuizAction(quiz.id, "rejected")}
                              title="Reject Quiz"
                            >
                              <i className="fas fa-times"></i>
                              <span>Reject</span>
                            </button>
                            <button
                              className="btn btn-icon btn-sm delete-btn"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              title="Delete Quiz"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quiz Management */}
            {activeTab === "quizzes" && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white py-3 border-0 border-bottom">
                  <h5 className="mb-0 fw-semibold">
                    <i className="fas fa-edit me-2 text-primary"></i>Quiz Management
                  </h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info border-0 rounded-4 shadow-sm">
                    <i className="fas fa-info-circle me-2"></i>
                    Full quiz management features including editing existing quizzes will be
                    implemented in the next version.
                  </div>
                  <div className="row g-4">
                    {[
                      {
                        icon: "list",
                        color: "primary",
                        title: "View All Quizzes",
                        text: "Browse all created quizzes",
                        btn: "View Quizzes",
                        disabled: false,
                      },
                      {
                        icon: "edit",
                        color: "warning",
                        title: "Edit Quizzes",
                        text: "Modify existing quizzes",
                        btn: "Coming Soon",
                        disabled: true,
                      },
                      {
                        icon: "plus",
                        color: "success",
                        title: "Create Manual Quiz",
                        text: "Create new manual quizzes",
                        btn: "Create Quiz",
                        disabled: false,
                      },
                    ].map((card, i) => (
                      <div className="col-md-4" key={i}>
                        <div className="card text-center shadow-sm border-0 rounded-4 h-100">
                          <div className="card-body py-4">
                            <i
                              className={`fas fa-${card.icon} fa-3x text-${card.color} mb-3`}
                            ></i>
                            <h5 className="fw-semibold">{card.title}</h5>
                            <p className="text-muted">{card.text}</p>
                            <button
                              className={`btn btn-${card.color}`}
                              disabled={card.disabled}
                            >
                              {card.btn}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}

export default AdminDashboard