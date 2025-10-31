import React, { useState, useEffect } from 'react'
import { analyticsService } from '../../services/analyticsService'
import PerformanceChart from './PerformanceChart'
import TopicPerformance from './TopicPerformance'
import ProgressTracker from './ProgressTracker'
import LoadingSpinner from '../common/LoadingSpinner'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await analyticsService.getUserAnalytics()
      setAnalytics(response)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading your analytics..." />
  }

  if (!analytics) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <h4>Unable to load analytics</h4>
          <p>Please try again later.</p>
        </div>
      </div>
    )
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

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4 text-white">
            <i className="fas fa-chart-bar me-2 text-white"></i>
            Your Learning Analytics
          </h1>

          {/* Quick Stats */}
          <div className="row g-4 mb-5">
            <div className="col-md-3">
              <div className="analytics-card text-center p-4">
                <div className="text-primary mb-2">
                  <i className="fas fa-trophy fa-2x"></i>
                </div>
                <h3 className="text-primary">{analytics.stats.total_quizzes_taken}</h3>
                <p className="text-muted mb-0">Quizzes Taken</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="analytics-card text-center p-4">
                <div className="text-success mb-2">
                  <i className="fas fa-chart-line fa-2x"></i>
                </div>
                <h3 className="text-success">{analytics.stats.average_score}%</h3>
                <p className="text-muted mb-0">Average Score</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="analytics-card text-center p-4">
                <div className="text-info mb-2">
                  <i className="fas fa-clock fa-2x"></i>
                </div>
                <h3 className="text-info">
                  {formatTime(analytics.stats.total_time_spent)}
                </h3>
                <p className="text-muted mb-0">Time Learning</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="analytics-card text-center p-4">
                <div className="text-warning mb-2">
                  <i className="fas fa-star fa-2x"></i>
                </div>
                <h3 className="text-warning">{analytics.stats.best_score}%</h3>
                <p className="text-muted mb-0">Best Score</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4" style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9'
          }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                style={{
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.25rem',
                  margin: '0 0.25rem',
                  fontWeight: '500',
                  color: activeTab === 'overview' ? '#667eea' : '#64748b',
                  background: activeTab === 'overview' ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-home"></i>
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
                style={{
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.25rem',
                  margin: '0 0.25rem',
                  fontWeight: '500',
                  color: activeTab === 'performance' ? '#10b981' : '#64748b',
                  background: activeTab === 'performance' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-chart-line"></i>
                Performance Trends
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'topics' ? 'active' : ''}`}
                onClick={() => setActiveTab('topics')}
                style={{
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.25rem',
                  margin: '0 0.25rem',
                  fontWeight: '500',
                  color: activeTab === 'topics' ? '#f59e0b' : '#64748b',
                  background: activeTab === 'topics' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-tags"></i>
                Topic Analysis
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'progress' ? 'active' : ''}`}
                onClick={() => setActiveTab('progress')}
                style={{
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.25rem',
                  margin: '0 0.25rem',
                  fontWeight: '500',
                  color: activeTab === 'progress' ? '#8b5cf6' : '#64748b',
                  background: activeTab === 'progress' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-target"></i>
                Progress Tracking
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="row">
                <div className="col-md-8">
                  <PerformanceChart data={analytics.progress_over_time} />
                </div>
                <div className="col-md-4">
                  <TopicPerformance data={analytics.topic_performance} />
                </div>
                <div className="col-12 mt-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="fas fa-history me-2"></i>
                        Recent Quiz Results
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-hover">
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
                            {analytics.recent_results.map((result) => (
                              <tr key={result.id}>
                                <td>
                                  <strong>{result.quiz_title}</strong>
                                </td>
                                <td>
                                  <span className="badge bg-secondary">{result.topic}</span>
                                </td>
                                <td>
                                  <span className={`badge ${result.percentage >= 80 ? 'bg-success' :
                                      result.percentage >= 60 ? 'bg-warning' : 'bg-danger'
                                    }`}>
                                    {result.percentage}%
                                  </span>
                                  <br />
                                  <small className="text-muted">
                                    {result.score}/{result.total_questions}
                                  </small>
                                </td>
                                <td>
                                  {formatTime(result.time_taken)}
                                </td>
                                <td>
                                  {new Date(result.created_at).toLocaleDateString()}
                                  <br />
                                  <small className="text-muted">
                                    {new Date(result.created_at).toLocaleTimeString()}
                                  </small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Trends Tab */}
            {activeTab === 'performance' && (
              <div className="row">
                <div className="col-12">
                  <PerformanceChart
                    data={analytics.progress_over_time}
                    detailed={true}
                    streakData={analytics.streak_data}
                  />
                </div>
              </div>
            )}

            {/* Topic Analysis Tab */}
            {activeTab === 'topics' && (
              <div className="row">
                <div className="col-12">
                  <TopicPerformance
                    data={analytics.topic_performance}
                    detailed={true}
                  />
                </div>
              </div>
            )}

            {/* Progress Tracking Tab */}
            {activeTab === 'progress' && (
              <div className="row">
                <div className="col-12">
                  <ProgressTracker analytics={analytics} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics