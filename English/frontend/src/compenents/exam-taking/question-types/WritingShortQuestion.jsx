const WritingShortQuestion = ({
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
        rows={8}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="question-textarea"
        placeholder="Nhập câu trả lời..."
      />

    </div>
  );
};

export default WritingShortQuestion;