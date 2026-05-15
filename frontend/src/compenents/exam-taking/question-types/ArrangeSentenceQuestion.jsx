const ArrangeSentenceQuestion = ({
  question,
  value,
  onChange,
}) => {

  return (
    <div className="question-card">

      <div className="question-content">
        {question.content}
      </div>

      <textarea
        rows={4}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="question-textarea"
        placeholder="Nhập câu hoàn chỉnh..."
      />

    </div>
  );
};

export default ArrangeSentenceQuestion;