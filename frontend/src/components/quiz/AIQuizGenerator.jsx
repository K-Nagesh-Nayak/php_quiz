import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { quizService } from '../../services/quizService'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

const AIQuizGenerator = () => {
    const [formData, setFormData] = useState({
        title: '',
        topic: '',
        difficulty: 'medium',
        question_count: 5
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [generatedQuiz, setGeneratedQuiz] = useState(null)

    const navigate = useNavigate()
    const { user } = useAuth()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')
        setGeneratedQuiz(null)

        try {
            const result = await quizService.generateAIQuiz(formData)
            setGeneratedQuiz(result)

            if (user.role === 'admin') {
                setSuccess(`Quiz generated and published successfully! You can now take the quiz.`)
            } else {
                setSuccess(`Quiz generated successfully! It's been sent for admin approval. You'll be notified when it's approved.`)
            }

            setFormData({
                title: '',
                topic: '',
                difficulty: 'medium',
                question_count: 5
            })

        } catch (error) {
            setError(error.response?.data?.error || 'Failed to generate quiz')
        } finally {
            setLoading(false)
        }
    }

    const handleTakeQuiz = () => {
        if (generatedQuiz && generatedQuiz.quiz_id) {
            navigate(`/quiz/${generatedQuiz.quiz_id}`)
        }
    }

    const handleCreateAnother = () => {
        setGeneratedQuiz(null)
        setSuccess('')
    }

    const suggestedTopics = [
        'Programming',
        'Science',
        'History',
        'Geography',
        'Mathematics',
        'Literature',
        'Art',
        'Music',
        'Sports',
        'Technology',
        'Business',
        'Psychology',
        'Biology',
        'Chemistry',
        'Physics',
        'World History',
        'Computer Science',
        'Artificial Intelligence'
    ]

    // 🆕 Select a suggested topic
    const handleSuggestedClick = (topic) => {
        setFormData({ ...formData, topic })
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg">
                        <div className="card-header bg-info text-white text-center py-4">
                            <h2 className="mb-0">
                                <i className="fas fa-robot me-2"></i>
                                AI Quiz Generator
                            </h2>
                            <p className="mb-0 mt-2">
                                Create custom quizzes powered by AI
                            </p>
                        </div>
                        <div className="card-body p-4">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {success && generatedQuiz && (
                                <div className="alert alert-success">
                                    <i className="fas fa-check-circle fa-2x mb-3"></i>
                                    <h4>{success}</h4>
                                    <p className="mb-0">
                                        Generated <strong>{generatedQuiz.questions_count}</strong> questions about <strong>{formData.topic}</strong>
                                    </p>
                                    {generatedQuiz.ai_used !== undefined && (
                                        <p className="mb-0">
                                            AI Mode: <span className={`badge ${generatedQuiz.ai_used ? 'bg-success' : 'bg-warning'}`}>
                                                {generatedQuiz.ai_used ? 'Real AI' : 'Demo Mode'}
                                            </span>
                                        </p>
                                    )}
                                    {generatedQuiz.status === 'published' && (
                                        <p className="mb-0">Status: <span className="badge bg-success">Published</span></p>
                                    )}
                                    {generatedQuiz.status === 'pending' && (
                                        <p className="mb-0">Status: <span className="badge bg-warning">Pending Approval</span></p>
                                    )}
                                    {generatedQuiz.fallback && (
                                        <p className="mb-0 mt-2">
                                            <small className="text-warning">
                                                <i className="fas fa-exclamation-triangle me-1"></i>
                                                Using demo data. Add Gemini API key for real AI questions.
                                            </small>
                                        </p>
                                    )}
                                </div>
                            )}

                            {!generatedQuiz ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">
                                            <i className="fas fa-heading me-1"></i>
                                            Quiz Title
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter a descriptive title for your quiz"
                                        />
                                    </div>

                                    {/* 🆕 Topic Section: Suggested + Custom Input */}
                                    <div className="mb-3">
                                        <label htmlFor="topic" className="form-label">
                                            <i className="fas fa-tag me-1"></i>
                                            Topic *
                                        </label>

                                        {/* Suggested Topics as Quick Buttons */}
                                        <div className="d-flex flex-wrap gap-2 mb-2">
                                            {suggestedTopics.map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    className={`btn btn-sm ${formData.topic === t ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => handleSuggestedClick(t)}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Topic Input */}
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="topic"
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleChange}
                                            required
                                            placeholder="Or type a custom topic (e.g., Space Exploration)"
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="difficulty" className="form-label">
                                                    <i className="fas fa-chart-line me-1"></i>
                                                    Difficulty Level
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="difficulty"
                                                    name="difficulty"
                                                    value={formData.difficulty}
                                                    onChange={handleChange}
                                                >
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="question_count" className="form-label">
                                                    <i className="fas fa-list-ol me-1"></i>
                                                    Number of Questions
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="question_count"
                                                    name="question_count"
                                                    value={formData.question_count}
                                                    onChange={handleChange}
                                                >
                                                    <option value="3">3 Questions</option>
                                                    <option value="5">5 Questions</option>
                                                    <option value="10">10 Questions</option>
                                                    <option value="15">15 Questions</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`alert ${user.role === 'admin' ? 'alert-success' : 'alert-warning'}`}>
                                        <i className="fas fa-info-circle me-2"></i>
                                        {user.role === 'admin'
                                            ? "As an admin, your quizzes will be published immediately."
                                            : "Your AI-generated quizzes require admin approval before they become publicly available."
                                        }
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-info w-100 py-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Generating Quiz...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-magic me-2"></i>
                                                Generate AI Quiz
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <div className="alert alert-success">
                                        <i className="fas fa-check-circle fa-2x mb-3"></i>
                                        <h4>{success}</h4>
                                        <p className="mb-0">
                                            Generated <strong>{generatedQuiz.questions_count}</strong> questions about <strong>{formData.topic}</strong>
                                        </p>
                                        {generatedQuiz.status === 'published' && (
                                            <p className="mb-0">Status: <span className="badge bg-success">Published</span></p>
                                        )}
                                        {generatedQuiz.status === 'pending' && (
                                            <p className="mb-0">Status: <span className="badge bg-warning">Pending Approval</span></p>
                                        )}
                                    </div>

                                    <div className="row g-2">
                                        {generatedQuiz.status === 'published' && (
                                            <div className="col-6">
                                                <button
                                                    className="btn btn-success w-100"
                                                    onClick={handleTakeQuiz}
                                                >
                                                    <i className="fas fa-play me-2"></i>
                                                    Take Quiz Now
                                                </button>
                                            </div>
                                        )}
                                        <div className={generatedQuiz.status === 'published' ? 'col-6' : 'col-12'}>
                                            <button
                                                className="btn btn-outline-primary w-100"
                                                onClick={handleCreateAnother}
                                            >
                                                <i className="fas fa-plus me-2"></i>
                                                Create Another
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 text-center">
                                <small className="text-muted">
                                    <i className="fas fa-lightbulb me-1"></i>
                                    Powered by AI • Questions are automatically generated
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIQuizGenerator
