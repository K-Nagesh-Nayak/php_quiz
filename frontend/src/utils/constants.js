export const DIFFICULTY_LEVELS = {
  easy: { label: 'Easy', color: 'success' },
  medium: { label: 'Medium', color: 'warning' },
  hard: { label: 'Hard', color: 'danger' }
}

export const QUIZ_STATUS = {
  pending: { label: 'Pending Review', color: 'warning' },
  published: { label: 'Published', color: 'success' },
  rejected: { label: 'Rejected', color: 'danger' }
}

export const QUIZ_SOURCE = {
  AI: { label: 'AI Generated', color: 'info' },
  manual: { label: 'Manual', color: 'secondary' }
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth?action=login',
    REGISTER: '/auth?action=register',
    PROFILE: '/auth?action=profile'
  },
  QUIZ: {
    PUBLIC: '/quiz?action=public',
    USER: '/quiz?action=user',
    PENDING: '/quiz?action=pending',
    QUESTIONS: '/quiz?action=questions',
    SUBMIT: '/quiz?action=submit',
    UPDATE_STATUS: '/quiz?action=update-status',
    DELETE: '/quiz'
  },
  AI: {
    GENERATE: '/ai?action=generate'
  },
  ANALYTICS: {
    USER: '/analytics?action=user',
    ADMIN: '/analytics?action=admin'
  }
}