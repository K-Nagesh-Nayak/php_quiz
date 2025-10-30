export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const calculatePercentage = (score, total) => {
  return total > 0 ? Math.round((score / total) * 100) : 0
}

export const getPerformanceColor = (percentage) => {
  if (percentage >= 90) return 'success'
  if (percentage >= 80) return 'primary'
  if (percentage >= 70) return 'info'
  if (percentage >= 60) return 'warning'
  return 'danger'
}

export const getPerformanceMessage = (percentage) => {
  if (percentage >= 90) return "Outstanding! You're an expert!"
  if (percentage >= 80) return "Excellent work! You know your stuff!"
  if (percentage >= 70) return "Good job! Solid understanding."
  if (percentage >= 60) return "Not bad! Keep practicing."
  if (percentage >= 50) return "You passed! Room for improvement."
  return "Keep learning! You'll get better."
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}