import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const TopicPerformance = ({ data, detailed = false }) => {
  const chartData = {
    labels: data.map(item => item.topic),
    datasets: [
      {
        label: 'Average Score (%)',
        data: data.map(item => item.avg_score),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Best Score (%)',
        data: data.map(item => item.best_score),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
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
        text: 'Performance by Topic',
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
    },
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-tags me-2"></i>
          Topic Performance
        </h5>
      </div>
      <div className="card-body">
        <Bar data={chartData} options={options} />
        
        {detailed && (
          <div className="mt-4">
            <h6>Detailed Topic Analysis</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Attempts</th>
                    <th>Avg Score</th>
                    <th>Best Score</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((topic, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{topic.topic}</strong>
                      </td>
                      <td>{topic.attempts}</td>
                      <td>
                        <span className={`badge ${
                          topic.avg_score >= 80 ? 'bg-success' :
                          topic.avg_score >= 60 ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {topic.avg_score}%
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {topic.best_score}%
                        </span>
                      </td>
                      <td>
                        <div className="progress" style={{ height: '6px' }}>
                          <div 
                            className={`progress-bar ${
                              topic.avg_score >= 80 ? 'bg-success' :
                              topic.avg_score >= 60 ? 'bg-warning' : 'bg-danger'
                            }`}
                            style={{ width: `${topic.avg_score}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopicPerformance