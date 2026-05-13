function ListeningChoiceQuestion({ API_BASE, question, value, onChange }) {
  const getFileUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return API_BASE + url;

    return `${API_BASE}/${url}`;
  };

  return (
    <div className="question-body">
      <h5>{question.content}</h5>

      {question.mediaUrl && (
        <div className="audio-player-box">
          <i className="bi bi-headphones"></i>
          <audio controls src={getFileUrl(question.mediaUrl)}></audio>
        </div>
      )}

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

export default ListeningChoiceQuestion;