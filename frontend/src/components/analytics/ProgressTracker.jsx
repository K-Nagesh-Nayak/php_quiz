import React from 'react'
import '../../assets/performance.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const PerformanceChart = ({ data, detailed = false, streakData }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No performance data yet</h4>
          <p className="text-muted">Take some quizzes to see your progress!</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Average Score (%)',
        data: data.map(item => item.average_score),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
      },
      {
        label: 'Daily Attempts',
        data: data.map(item => item.attempts),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  }

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Score (%)'
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Attempts'
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: detailed ? 'Your Performance Trend Over Time' : 'Recent Performance',
      },
    },
  }

  return (
  <div className="platform-overview">
    {/* Header Section */}
    <div className="overview-header">
      <div className="header-content">
        <h1 className="page-title">Platform Overview</h1>
        <p className="page-subtitle">Complete analytics and performance insights</p>
      </div>
      <div className="header-badge">
        <i className="fas fa-chart-network"></i>
        Live Analytics
      </div>
    </div>

    {/* Main Statistics Grid */}
    <div className="stats-grid-main">
      <div className="stat-card-main primary">
        <div className="stat-icon">
          <i className="fas fa-users"></i>
        </div>
        <div className="stat-content">
          <h3 className="stat-value">5</h3>
          <p className="stat-label">Total Users</p>
          <div className="stat-breakdown">
            <span className="breakdown-item active">
              <span className="indicator"></span>
              2 active (30d)
            </span>
            <span className="breakdown-item new">
              <span className="indicator"></span>
              5 new (7d)
            </span>
          </div>
        </div>
      </div>

      <div className="stat-card-main success">
        <div className="stat-icon">
          <i className="fas fa-question-circle"></i>
        </div>
        <div className="stat-content">
          <h3 className="stat-value">10</h3>
          <p className="stat-label">Total Quizzes</p>
          <div className="stat-breakdown">
            <span className="breakdown-item">
              <i className="fas fa-robot"></i>
              4 AI Generated
            </span>
            <span className="breakdown-item">
              <i className="fas fa-edit"></i>
              6 Manual
            </span>
          </div>
        </div>
      </div>

      <div className="stat-card-main info">
        <div className="stat-icon">
          <i className="fas fa-chart-line"></i>
        </div>
        <div className="stat-content">
          <h3 className="stat-value">29</h3>
          <p className="stat-label">Total Attempts</p>
          <div className="stat-breakdown">
            <span className="breakdown-item">
              <i className="fas fa-star"></i>
              9 unique quizzes
            </span>
          </div>
        </div>
      </div>

      <div className="stat-card-main warning">
        <div className="stat-icon">
          <i className="fas fa-trophy"></i>
        </div>
        <div className="stat-content">
          <h3 className="stat-value">81.4%</h3>
          <p className="stat-label">Avg. Score</p>
          <div className="stat-breakdown">
            <span className="breakdown-item">
              <i className="fas fa-clock"></i>
              1h 38m learning
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Two Column Layout for Topics and Top Performers */}
    <div className="content-columns">
      {/* Popular Topics Section */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-tags me-2"></i>
            Popular Topics
          </h3>
        </div>
        <div className="topics-list">
          <div className="topic-item">
            <div className="topic-header">
              <span className="topic-name">Programming</span>
              <span className="topic-score">76%</span>
            </div>
            <div className="topic-meta">
              <span className="topic-quizzes">
                <i className="fas fa-puzzle-piece"></i>
                3 unique quizzes
              </span>
            </div>
            <div className="topic-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '76%' }}></div>
              </div>
            </div>
          </div>

          <div className="topic-item">
            <div className="topic-header">
              <span className="topic-name">General Knowledge</span>
              <span className="topic-score">82.9%</span>
            </div>
            <div className="topic-meta">
              <span className="topic-quizzes">
                <i className="fas fa-puzzle-piece"></i>
                1 unique quiz
              </span>
            </div>
            <div className="topic-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '82.9%' }}></div>
              </div>
            </div>
          </div>

          <div className="topic-item">
            <div className="topic-header">
              <span className="topic-name">Geography</span>
              <span className="topic-score">80%</span>
            </div>
            <div className="topic-meta">
              <span className="topic-quizzes">
                <i className="fas fa-puzzle-piece"></i>
                1 unique quiz
              </span>
            </div>
            <div className="topic-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>

          <div className="topic-item">
            <div className="topic-header">
              <span className="topic-name">History</span>
              <span className="topic-score">86.7%</span>
            </div>
            <div className="topic-meta">
              <span className="topic-quizzes">
                <i className="fas fa-puzzle-piece"></i>
                1 unique quiz
              </span>
            </div>
            <div className="topic-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '86.7%' }}></div>
              </div>
            </div>
          </div>

          <div className="topic-item">
            <div className="topic-header">
              <span className="topic-name">Science</span>
              <span className="topic-score">86.7%</span>
            </div>
            <div className="topic-meta">
              <span className="topic-quizzes">
                <i className="fas fa-puzzle-piece"></i>
                1 unique quiz
              </span>
            </div>
            <div className="topic-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '86.7%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-crown me-2"></i>
            Top Performers
          </h3>
        </div>
        <div className="performers-list">
          <div className="performer-item featured">
            <div className="performer-rank">
              <div className="rank-badge">1</div>
            </div>
            <div className="performer-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="performer-info">
              <h4 className="performer-name">K Nagesh Nayak</h4>
              <p className="performer-title">Top Contributor</p>
            </div>
            <div className="performer-stats">
              <div className="stat-badge">
                <i className="fas fa-trophy"></i>
                Leading
              </div>
            </div>
          </div>
          
          {/* Placeholder for more performers - you can add more as needed */}
          <div className="empty-state">
            <i className="fas fa-user-plus"></i>
            <p>More users joining soon!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}

export default PerformanceChart