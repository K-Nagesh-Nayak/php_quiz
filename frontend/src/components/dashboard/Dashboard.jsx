import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { quizService } from '../../services/quizService'
import { analyticsService } from '../../services/analyticsService'
import LoadingSpinner from '../common/LoadingSpinner'
import '../../assets/dashboard.css'


const Dashboard = () => {
    const [stats, setStats] = useState({
        total_quizzes_taken: 0,
        average_score: 0,
        total_time_spent: 0,
        best_score: 0,
        quizzes_this_week: 0
    })
    const [publicQuizzes, setPublicQuizzes] = useState([])
    const [userQuizzes, setUserQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            const [publicQuizzesRes, userQuizzesRes, analyticsRes] = await Promise.all([
                quizService.getPublicQuizzes(),
                quizService.getUserQuizzes(),
                analyticsService.getUserAnalytics()
            ])

            setPublicQuizzes(publicQuizzesRes.quizzes || [])
            setUserQuizzes(userQuizzesRes.quizzes || [])

            if (analyticsRes.stats) {
                setStats(analyticsRes.stats)
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            published: { class: 'bg-success', text: 'Published' },
            pending: { class: 'bg-warning', text: 'Pending' },
            rejected: { class: 'bg-danger', text: 'Rejected' }
        }

        const config = statusConfig[status] || { class: 'bg-secondary', text: status }
        return <span className={`badge ${config.class}`}>{config.text}</span>
    }

    if (loading) {
        return <LoadingSpinner text="Loading your dashboard..." />
    }

    return (
        <div className="dashboard-container">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <i className="fas fa-sparkle"></i>
                        Welcome back
                    </div>
                    <h1 className="hero-title">{user?.name}! 👋</h1>
                    <p className="hero-subtitle">Ready to challenge yourself with some intelligent quizzes?</p>
                    <div className="hero-actions">
                        <Link to="/quizzes" className="btn btn-primary">
                            <i className="fas fa-play"></i>
                            Take a Quiz
                        </Link>
                        <Link to="/generate-quiz" className="btn btn-secondary">
                            <i className="fas fa-robot"></i>
                            Generate AI Quiz
                        </Link>
                    </div>
                </div>
                <div className="hero-graphic">
                    <div className="graphic-element"></div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon trophy">
                            <i className="fas fa-trophy"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total_quizzes_taken}</h3>
                            <p>Quizzes Taken</p>
                            <span className="stat-sub">{stats.total_attempts} attempts</span>
                        </div>
                        <div className="stat-graph">
                            <div className="graph-bar" style={{ height: '70%' }}></div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon score">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.average_score}%</h3>
                            <p>Average Score</p>
                            <div className="progress-ring">
                                <div className="ring-bg"></div>
                                <div
                                    className="ring-progress"
                                    style={{ transform: `rotate(${stats.average_score * 3.6}deg)` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon time">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{formatTime(stats.total_time_spent)}</h3>
                            <p>Time Learning</p>
                            <span className="stat-sub">Total invested</span>
                        </div>
                        <div className="time-graph">
                            <div className="time-bar"></div>
                            <div className="time-bar"></div>
                            <div className="time-bar"></div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon best">
                            <i className="fas fa-star"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.best_score}%</h3>
                            <p>Best Score</p>
                            <span className="stat-sub">Personal record</span>
                        </div>
                        <div className="achievement-badge">
                            <i className="fas fa-crown"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* User's AI Quizzes */}
            {userQuizzes.length > 0 && (
                <div className="section">
                    <div className="section-header d-flex justify-content-between align-items-center">
                        <div className="section-title">
                            <div className="title-icon ai">
                                <i className="fas fa-robot"></i>
                            </div>
                            <div>
                                <h2>Your AI Quizzes</h2>
                                <p>Quizzes generated by AI</p>
                            </div>
                        </div>
                        <Link to="/generate-quiz" className="btn-generate">
                            <i className="fas fa-plus"></i>
                            Generate New
                        </Link>
                    </div>

                    <div className="quizzes-grid">
                        {userQuizzes.map((quiz) => (
                            <div key={quiz.id} className={`quiz-card ${quiz.status}`}>
                                <div className="quiz-header">
                                    <div className="quiz-status">
                                        <span className={`status-badge ${quiz.status}`}>
                                            {quiz.status === 'published' ? 'Live' : quiz.status === 'pending' ? 'Pending' : 'Rejected'}
                                        </span>
                                    </div>
                                    <h3 className="quiz-title">{quiz.title}</h3>
                                    <p className="quiz-creator">By {quiz.creator_name || "You"}</p>
                                </div>

                                <div className="quiz-body">
                                    <div className="quiz-meta">
                                        <div className="meta-item">
                                            <i className="fas fa-tag"></i>
                                            {quiz.topic}
                                        </div>
                                        <div className="meta-item">
                                            <i className="fas fa-signal"></i>
                                            <span className={`difficulty ${quiz.difficulty}`}>
                                                {quiz.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="quiz-date">
                                        <i className="fas fa-calendar"></i>
                                        Created {new Date(quiz.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="quiz-footer">
                                    {quiz.status === "published" ? (
                                        <Link to={`/quiz/${quiz.id}`} className="btn-take-quiz">
                                            <i className="fas fa-play"></i>
                                            Take Quiz
                                        </Link>
                                    ) : (
                                        <div className="quiz-pending">
                                            <div className="pending-state">
                                                <i className="fas fa-clock"></i>
                                                {quiz.status === "pending" ? "Awaiting Approval" : "Rejected"}
                                            </div>
                                            {quiz.status === "pending" && (
                                                <small>Waiting for admin approval</small>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Public Quizzes */}
            <div className="section">
                <div className="section-header d-flex justify-content-between align-items-center">
                    <div className="section-title">
                        <div className="title-icon public">
                            <i className="fas fa-globe"></i>
                        </div>
                        <div>
                            <h2>Public Quizzes</h2>
                            <p>Explore community quizzes</p>
                        </div>
                    </div>
                    <Link to="/quizzes" className="btn-view-all">
                        View All
                        <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>

                {publicQuizzes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-question-circle"></i>
                        </div>
                        <h3>No public quizzes available</h3>
                        <p>Check back later for new quizzes</p>
                    </div>
                ) : (
                    <div className="quizzes-grid public">
                        {publicQuizzes.slice(0, 6).map((quiz) => (
                            <div key={quiz.id} className="quiz-card public">
                                <div className="quiz-badge">
                                    <i className={`fas ${quiz.source === "AI" ? "fa-robot" : "fa-edit"}`}></i>
                                    {quiz.source}
                                </div>
                                <div className="quiz-header">
                                    <h3 className="quiz-title">{quiz.title}</h3>
                                    <p className="quiz-creator">By {quiz.creator_name}</p>
                                </div>

                                <div className="quiz-body">
                                    <div className="quiz-meta">
                                        <div className="meta-item">
                                            <i className="fas fa-tag"></i>
                                            {quiz.topic}
                                        </div>
                                        <div className="meta-item">
                                            <i className="fas fa-signal"></i>
                                            <span className={`difficulty ${quiz.difficulty}`}>
                                                {quiz.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="quiz-footer">
                                    <Link to={`/quiz/${quiz.id}`} className="btn-take-quiz primary">
                                        <i className="fas fa-play"></i>
                                        Take Quiz
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

}

export default Dashboard