import React from 'react'
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
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
      {
        label: 'Daily Attempts',
        data: data.map(item => item.attempts),
        borderColor: 'rgb(245, 101, 101)',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 2,
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
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
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
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: true,
        text: detailed ? 'Your Performance Trend Over Time' : 'Recent Performance',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  }

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-header bg-white py-3 border-0">
        <h5 className="mb-0 fw-semibold">
          <i className="fas fa-chart-line me-2 text-primary"></i>
          Performance Chart
        </h5>
      </div>
      <div className="card-body">
        <Line data={chartData} options={options} />
        
        {detailed && streakData && (
          <div className="mt-4">
            <div className="row text-center">
              <div className="col-md-3">
                <div className="border rounded p-3">
                  <h6 className="text-primary">Current Streak</h6>
                  <h4 className="text-primary">{streakData.current_streak}</h4>
                  <small className="text-muted">Days in a row</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3">
                  <h6 className="text-success">Longest Streak</h6>
                  <h4 className="text-success">{streakData.longest_streak}</h4>
                  <small className="text-muted">Best streak</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3">
                  <h6 className="text-info">Total Days</h6>
                  <h4 className="text-info">{data.length}</h4>
                  <small className="text-muted">Active days</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3">
                  <h6 className="text-warning">Avg. Daily</h6>
                  <h4 className="text-warning">
                    {(data.reduce((sum, day) => sum + day.attempts, 0) / data.length).toFixed(1)}
                  </h4>
                  <small className="text-muted">Quizzes per day</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerformanceChart