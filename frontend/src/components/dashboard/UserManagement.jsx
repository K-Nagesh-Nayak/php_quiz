import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../common/LoadingSpinner'

import '../../assets/user_management.css'

const UserManagement = ({ onViewUserActivity }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, active, inactive

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllUsers()
      setUsers(response.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatLastActivity = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return formatDate(dateString)
  }

  const getStatusBadge = (user) => {
    if (!user.last_activity) {
      return <span className="badge bg-secondary">Inactive</span>
    }
    
    const lastActivity = new Date(user.last_activity)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    if (lastActivity < thirtyDaysAgo) {
      return <span className="badge bg-warning">Inactive</span>
    }
    
    return <span className="badge bg-success">Active</span>
  }

  const getScoreColor = (score) => {
    if (!score) return 'text-muted'
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-danger'
  }

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && user.last_activity) ||
                         (filter === 'inactive' && !user.last_activity)
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <LoadingSpinner text="Loading users..." />
  }

  return (
  <div className="user-management-container">
  {/* Header */}
  <div className="management-header">
    <div className="header-content">
      <div className="header-icon">
        <i className="fas fa-users"></i>
      </div>
      <div>
        <h2>User Management</h2>
        <p>Manage and monitor user activities</p>
      </div>
    </div>
    <div className="user-count">
      <span className="count-badge">{filteredUsers.length}</span>
      <span>users</span>
    </div>
  </div>

  {/* Search and Filter */}
  <div className="search-filter-bar">
    <div className="search-box">
      <i className="fas fa-search"></i>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    <select
      className="filter-select"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="all">All Users</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>

  {/* Quick Stats */}
  <div className="quick-stats">
    <div className="stat-item">
      <div className="stat-icon total">
        <i className="fas fa-users"></i>
      </div>
      <div className="stat-info">
        <h3>{users.length}</h3>
        <span>Total Users</span>
      </div>
    </div>
    
    <div className="stat-item">
      <div className="stat-icon active">
        <i className="fas fa-user-check"></i>
      </div>
      <div className="stat-info">
        <h3>{users.filter(u => u.last_activity).length}</h3>
        <span>Active</span>
      </div>
    </div>
    
    <div className="stat-item">
      <div className="stat-icon takers">
        <i className="fas fa-question-circle"></i>
      </div>
      <div className="stat-info">
        <h3>{users.filter(u => u.total_attempts > 0).length}</h3>
        <span>Quiz Takers</span>
      </div>
    </div>
    
    <div className="stat-item">
      <div className="stat-icon performers">
        <i className="fas fa-trophy"></i>
      </div>
      <div className="stat-info">
        <h3>{users.filter(u => u.avg_score >= 80).length}</h3>
        <span>High Performers</span>
      </div>
    </div>
  </div>

  {/* Users List */}
  <div className="users-list-container">
    {filteredUsers.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">
          <i className="fas fa-users"></i>
        </div>
        <h3>No users found</h3>
        <p>
          {searchTerm || filter !== 'all' 
            ? 'Try adjusting your search or filter'
            : 'No users have registered yet'}
        </p>
      </div>
    ) : (
      <div className="users-grid">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-header">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-info">
                <h4 className="user-name">{user.name}</h4>
                <p className="user-email">{user.email}</p>
              </div>
              <div className="user-status">
                {getStatusBadge(user)}
              </div>
            </div>
            
            <div className="user-stats">
              <div className="stat">
                <div className="stat-label">Attempts</div>
                <div className={`stat-value ${user.total_attempts > 0 ? 'active' : 'inactive'}`}>
                  {user.total_attempts || 0}
                </div>
              </div>
              
              <div className="stat">
                <div className="stat-label">Avg Score</div>
                <div className={`stat-value score ${getScoreColor(user.avg_score)}`}>
                  {user.avg_score ? `${user.avg_score}%` : 'N/A'}
                </div>
              </div>
              
              <div className="stat">
                <div className="stat-label">Joined</div>
                <div className="stat-date">{formatDate(user.created_at)}</div>
              </div>
            </div>
            
            <div className="user-activity">
              <div className="last-activity">
                <i className="fas fa-clock"></i>
                {formatLastActivity(user.last_activity)}
              </div>
              <button
                className="activity-btn"
                onClick={() => onViewUserActivity(user)}
              >
                <i className="fas fa-chart-line"></i>
                View Activity
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
);

}

export default UserManagement