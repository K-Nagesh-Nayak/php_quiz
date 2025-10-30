import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { quizService } from '../../services/quizService'
import { analyticsService } from '../../services/analyticsService'
import LoadingSpinner from '../common/LoadingSpinner'

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
        <div className="container mt-4">
            {/* Hero Section */}
            <div className="hero-section text-center">
                <h1 className="display-4 fw-bold mb-3">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="lead mb-4">
                    Ready to challenge yourself with some intelligent quizzes?
                </p>
                <div className="row g-3 justify-content-center">
                    <div className="col-auto">
                        <Link to="/quizzes" className="btn btn-light btn-lg">
                            <i className="fas fa-play me-2"></i>
                            Take a Quiz
                        </Link>
                    </div>
                    <div className="col-auto">
                        <Link to="/generate-quiz" className="btn btn-outline-light btn-lg">
                            <i className="fas fa-robot me-2"></i>
                            Generate AI Quiz
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="analytics-card p-4 text-center">
                        <div className="text-primary mb-2">
                            <i className="fas fa-trophy fa-3x"></i>
                        </div>
                        <h3 className="text-primary">{stats.total_quizzes_taken}</h3>
                        <p className="text-muted mb-0">Quizzes Taken</p>
                        <small className="text-muted">{stats.total_attempts} attempts</small>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-card p-4 text-center">
                        <div className="text-success mb-2">
                            <i className="fas fa-chart-line fa-3x"></i>
                        </div>
                        <h3 className="text-success">{stats.average_score}%</h3>
                        <p className="text-muted mb-0">Average Score</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-card p-4 text-center">
                        <div className="text-info mb-2">
                            <i className="fas fa-clock fa-3x"></i>
                        </div>
                        <h3 className="text-info">
                            {formatTime(stats.total_time_spent)}
                        </h3>
                        <p className="text-muted mb-0">Time Learning</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="analytics-card p-4 text-center">
                        <div className="text-warning mb-2">
                            <i className="fas fa-star fa-3x"></i>
                        </div>
                        <h3 className="text-warning">{stats.best_score}%</h3>
                        <p className="text-muted mb-0">Best Score</p>
                    </div>
                </div>
            </div>


            {/* User's AI Quizzes Section */}
            {userQuizzes.length > 0 && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3>
                                <i className="fas fa-robot me-2 text-info"></i>
                                Your AI Generated Quizzes
                            </h3>
                            <Link to="/generate-quiz" className="btn btn-info">
                                <i className="fas fa-plus me-1"></i>
                                Generate New
                            </Link>
                        </div>
                        <div className="row g-4">
                            {userQuizzes.map(quiz => (
                                <div key={quiz.id} className="col-md-6 col-lg-4">
                                    <div className="quiz-card card h-100">
                                        <div className={`card-header text-white ${quiz.status === 'published' ? 'bg-success' :
                                                quiz.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                            }`}>
                                            <h5 className="card-title mb-1">{quiz.title}</h5>
                                            <small>
                                                {getStatusBadge(quiz.status)} • By {quiz.creator_name || 'You'}
                                            </small>
                                        </div>
                                        <div className="card-body">
                                            <p className="card-text">
                                                <strong>Topic:</strong> {quiz.topic}
                                            </p>
                                            <p className="card-text">
                                                <strong>Difficulty:</strong>
                                                <span className={`badge ms-1 ${quiz.difficulty === 'easy' ? 'bg-success' :
                                                        quiz.difficulty === 'medium' ? 'bg-warning' : 'bg-danger'
                                                    }`}>
                                                    {quiz.difficulty}
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
                                            {quiz.status === 'published' ? (
                                                <Link
                                                    to={`/quiz/${quiz.id}`}
                                                    className="btn btn-success w-100"
                                                >
                                                    <i className="fas fa-play me-1"></i>
                                                    Take Quiz
                                                </Link>
                                            ) : (
                                                <div className="text-center">
                                                    <button className="btn btn-outline-secondary w-100" disabled>
                                                        <i className="fas fa-clock me-1"></i>
                                                        {quiz.status === 'pending' ? 'Awaiting Approval' : 'Rejected'}
                                                    </button>
                                                    {quiz.status === 'pending' && (
                                                        <small className="text-muted mt-1 d-block">
                                                            Waiting for admin approval
                                                        </small>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Public Quizzes Section */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3>
                            <i className="fas fa-globe me-2 text-primary"></i>
                            Public Quizzes
                        </h3>
                        <Link to="/quizzes" className="btn btn-outline-primary">
                            View All
                        </Link>
                    </div>

                    {publicQuizzes.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-question-circle fa-4x text-muted mb-3"></i>
                            <h4 className="text-muted">No public quizzes available</h4>
                            <p className="text-muted">Check back later for new quizzes</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {publicQuizzes.slice(0, 3).map(quiz => (
                                <div key={quiz.id} className="col-md-4">
                                    <div className="quiz-card card h-100">
                                        <div className="quiz-header card-header text-white">
                                            <h5 className="card-title mb-0">{quiz.title}</h5>
                                            <small>By {quiz.creator_name}</small>
                                        </div>
                                        <div className="card-body">
                                            <p className="card-text">{quiz.topic}</p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className={`badge ${quiz.difficulty === 'easy' ? 'bg-success' :
                                                        quiz.difficulty === 'medium' ? 'bg-warning' : 'bg-danger'
                                                    }`}>
                                                    {quiz.difficulty}
                                                </span>
                                                <span className="badge bg-light text-dark">
                                                    <i className={`fas ${quiz.source === 'AI' ? 'fa-robot' : 'fa-edit'} me-1`}></i>
                                                    {quiz.source}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-footer bg-transparent">
                                            <Link
                                                to={`/quiz/${quiz.id}`}
                                                className="btn btn-primary w-100"
                                            >
                                                <i className="fas fa-play me-1"></i>
                                                Take Quiz
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

export default Dashboard