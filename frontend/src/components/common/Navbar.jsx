import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

import '../../assets/navbar.css'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
   <nav className="navbar navbar-expand-lg navbar-custom">
  <div className="container">
    {/* Brand */}
    <Link className="navbar-brand" to="/">
      <div className="brand-content">
        <i className="fas fa-brain brand-icon"></i>
        <span className="brand-text">QuizMaster</span>
      </div>
    </Link>
    
    {/* Mobile Toggle */}
    <button 
      className="navbar-toggler" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#navbarNav"
    >
      <span className="navbar-toggler-icon">
        <i className="fas fa-bars"></i>
      </span>
    </button>
    
    {/* Navigation */}
    <div className="collapse navbar-collapse" id="navbarNav">
      {/* Left Navigation */}
      <ul className="navbar-nav me-auto">
        {isAuthenticated && (
          <>
            <li className="nav-item">
              <Link className="nav-link nav-item-custom" to="/dashboard">
                <i className="fas fa-home nav-icon"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link nav-item-custom" to="/quizzes">
                <i className="fas fa-question-circle nav-icon"></i>
                <span>Quizzes</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link nav-item-custom" to="/generate-quiz">
                <i className="fas fa-robot nav-icon"></i>
                <span>AI Generator</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link nav-item-custom" to="/analytics">
                <i className="fas fa-chart-bar nav-icon"></i>
                <span>Analytics</span>
              </Link>
            </li>
            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link nav-item-custom admin-nav-item" to="/admin">
                  <i className="fas fa-cog nav-icon"></i>
                  <span>Admin</span>
                </Link>
              </li>
            )}
          </>
        )}
      </ul>
      
      {/* Right Navigation */}
      <ul className="navbar-nav">
        {isAuthenticated ? (
          <li className="nav-item dropdown">
            <a 
              className="nav-link dropdown-toggle user-dropdown-toggle" 
              href="#" 
              role="button" 
              data-bs-toggle="dropdown"
            >
              <div className="user-avatar-sm">
                <i className="fas fa-user"></i>
              </div>
              <span className="user-name">{user?.name}</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-custom">
              <li>
                <div className="dropdown-header-custom">
                  <div className="user-avatar-md">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="user-info d-flex flex-column align-items-start gap-0">
                    <div className="user-name-lg">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item dropdown-item-custom" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </li>
            </ul>
          </li>
        ) : (
          <>
            <li className="nav-item">
              <Link className="nav-link auth-link login-link" to="/login">
                <i className="fas fa-sign-in-alt"></i>
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link auth-link register-link" to="/register">
                <i className="fas fa-user-plus"></i>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  </div>
</nav>
  )
}

export default Navbar