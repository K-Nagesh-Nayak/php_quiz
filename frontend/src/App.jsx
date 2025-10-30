import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './components/dashboard/Dashboard'
import QuizList from './components/quiz/QuizList'
import QuizPlay from './components/quiz/QuizPlay'
import AIQuizGenerator from './components/quiz/AIQuizGenerator'
import Analytics from './components/analytics/Analytics'
import AdminDashboard from './components/dashboard/AdminDashboard'
import './App.css'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <div className="app-container d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quizzes" 
              element={
                <ProtectedRoute>
                  <QuizList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz/:id" 
              element={
                <ProtectedRoute>
                  <QuizPlay />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/generate-quiz" 
              element={
                <ProtectedRoute>
                  <AIQuizGenerator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App