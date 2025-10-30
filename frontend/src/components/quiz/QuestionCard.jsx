import React from 'react'

const QuestionCard = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect 
}) => {
  const options = question.options || []

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index) // A, B, C, D, etc.
  }

  return (
    <div className="question-card card">
      <div className="card-header bg-light">
        <h5 className="mb-0">
          Question {questionNumber} of {totalQuestions}
        </h5>
      </div>
      <div className="card-body">
        <h4 className="card-title mb-4">{question.question_text}</h4>
        
        <div className="options-container">
          {options.map((option, index) => {
            const optionLetter = getOptionLetter(index)
            const isSelected = selectedAnswer === option
            
            return (
              <button
                key={index}
                className={`option-btn btn w-100 text-start p-3 mb-3 ${
                  isSelected ? 'selected' : ''
                }`}
                onClick={() => onAnswerSelect(option)}
              >
                <div className="d-flex align-items-center">
                  <span className="option-letter badge bg-secondary me-3">
                    {optionLetter}
                  </span>
                  <span className="option-text flex-grow-1">{option}</span>
                  {isSelected && (
                    <span className="selected-indicator">
                      <i className="fas fa-check text-white"></i>
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {selectedAnswer && (
          <div className="mt-4 p-3 bg-light rounded">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              You have selected an answer. Click "Next" to continue or select a different answer.
            </small>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionCard