const ListeningFillBlankQuestion = ({
  question,
  value,
  onChange,
}) => {

  return (
    <div className="question-card">

      <div className="question-content">
        {question.content}
      </div>

      <audio
        controls
        src={question.mediaUrl}
        className="question-audio"
      />

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Nhập đáp án..."
        className="question-input"
      />

    </div>
  );
};

export default ListeningFillBlankQuestion;