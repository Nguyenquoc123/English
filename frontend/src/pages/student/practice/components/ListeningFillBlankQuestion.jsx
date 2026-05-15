function ListeningFillBlankQuestion({ API_BASE, question, value, onChange }) {
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

      <div className="answer-input-box">
        <label>Câu trả lời của bạn</label>
        <input
          type="text"
          className="form-control"
          value={value || ""}
          onChange={(e) => onChange(question.questionId, e.target.value)}
          placeholder="Nhập từ/cụm từ còn thiếu..."
        />
      </div>
    </div>
  );
}

export default ListeningFillBlankQuestion;