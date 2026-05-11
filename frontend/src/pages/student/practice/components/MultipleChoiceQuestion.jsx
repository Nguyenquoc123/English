function MultipleChoiceQuestion({ question, value, onChange }) {
  return (
    <div className="question-body">
      <h5>{question.content}</h5>

      <div className="option-grid">
        {(question.options || []).map((option, index) => (
          <label
            key={option.optionId}
            className={
              value === option.optionId
                ? "option-item selected"
                : "option-item"
            }
          >
            <input
              type="radio"
              name={`question-${question.questionId}`}
              checked={value === option.optionId}
              onChange={() => onChange(question.questionId, option.optionId)}
            />

            <span className="option-prefix">
              {String.fromCharCode(65 + index)}
            </span>

            <span>{option.optionText}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default MultipleChoiceQuestion;