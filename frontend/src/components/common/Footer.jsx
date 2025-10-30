import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5 className="fw-bold">
              <i className="fas fa-brain me-2"></i>
              Intelligent Quiz Platform
            </h5>
            <p className="mb-0">
              "Learn smarter, not harder — AI-crafted quizzes with real-time insights."
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">
              &copy; 2024 Intelligent Quiz Platform. All rights reserved.
            </p>
            <small>
              Built with React, PHP, and Gemini AI
            </small>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer