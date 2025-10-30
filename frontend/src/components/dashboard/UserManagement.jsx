import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import LoadingSpinner from '../common/LoadingSpinner'

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
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-users me-2"></i>
              User Management
            </h5>
            <span className="badge bg-primary">
              {filteredUsers.length} users
            </span>
          </div>
          <div className="card-body">
            {/* Search and Filter */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users</option>
                  <option value="inactive">Inactive Users</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-users fa-4x text-muted mb-3"></i>
                <h4 className="text-muted">No users found</h4>
                <p className="text-muted">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No users have registered yet'
                  }
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Status</th>
                      <th>Quiz Attempts</th>
                      <th>Avg. Score</th>
                      <th>Joined</th>
                      <th>Last Activity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div>
                            <strong>{user.name}</strong>
                            <br />
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(user)}
                        </td>
                        <td>
                          <span className={user.total_attempts > 0 ? 'text-primary' : 'text-muted'}>
                            {user.total_attempts || 0}
                          </span>
                        </td>
                        <td>
                          <span className={getScoreColor(user.avg_score)}>
                            {user.avg_score ? `${user.avg_score}%` : 'N/A'}
                          </span>
                        </td>
                        <td>
                          {formatDate(user.created_at)}
                        </td>
                        <td>
                          {formatLastActivity(user.last_activity)}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => onViewUserActivity(user)}
                              title="View Activity"
                            >
                              <i className="fas fa-chart-line me-1"></i>
                              Activity
                            </button>
                            <button
                              className="btn btn-outline-info"
                              onClick={() => onViewUserActivity(user)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary Stats */}
            <div className="row mt-4">
              <div className="col-md-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="text-primary">{users.length}</h5>
                    <small className="text-muted">Total Users</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="text-success">
                      {users.filter(u => u.last_activity).length}
                    </h5>
                    <small className="text-muted">Active Users</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="text-warning">
                      {users.filter(u => u.total_attempts > 0).length}
                    </h5>
                    <small className="text-muted">Quiz Takers</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="text-info">
                      {users.filter(u => u.avg_score >= 80).length}
                    </h5>
                    <small className="text-muted">High Performers</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement