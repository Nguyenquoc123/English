function WritingShortQuestion({ question, value, onChange }) {
  return (
    <div className="question-body">
      <h5>{question.content}</h5>

      <div className="answer-input-box">
        <label>Câu trả lời của bạn</label>

        <textarea
          className="form-control writing-textarea"
          rows="5"
          value={value || ""}
          onChange={(e) => onChange(question.questionId, e.target.value)}
          placeholder="Nhập câu trả lời ngắn của bạn..."
        ></textarea>
      </div>
    </div>
  );
}

export default WritingShortQuestion;