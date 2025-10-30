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

const PerformanceChart = ({ data, detailed = false }) => {
  // Prepare chart data
  const chartData = {
    labels: data.map((_, index) => `Quiz ${index + 1}`),
    datasets: [
      {
        label: 'Quiz Scores (%)',
        data: data.map(result => 
          Math.round((result.score / result.total_questions) * 100)
        ),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: detailed ? 'Your Performance Trend Over Time' : 'Recent Performance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Quiz Attempts'
        }
      }
    },
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-chart-line me-2"></i>
          Performance Chart
        </h5>
      </div>
      <div className="card-body">
        <Line data={chartData} options={options} />
        
        {detailed && (
          <div className="mt-4">
            <div className="row text-center">
              <div className="col-md-3">
                <div className="border rounded p-3">
                  <h6 className="text-primary">Current Streak</h6>
                  <h4 className="text-primary">3</h4>
                  <small className="text-muted">Quizzes in a row ≥80%</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3">
                  <h6 className="text-success">Best Score</h6>
                  <h4 className="text-success">100%</h4>
                  <small className="text-muted">Perfect quiz</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3">
                  <h6 className="text-info">Improvement</h6>
                  <h4 className="text-info">+15%</h4>
                  <small className="text-muted">Since last week</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3">
                  <h6 className="text-warning">Consistency</h6>
                  <h4 className="text-warning">85%</h4>
                  <small className="text-muted">Score stability</small>
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