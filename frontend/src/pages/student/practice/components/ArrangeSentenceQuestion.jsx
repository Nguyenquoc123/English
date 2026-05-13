import { useEffect, useState } from "react";

function ArrangeSentenceQuestion({ question, value, onChange }) {
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);

  useEffect(() => {
    const words = buildWords();

    setAvailableWords(words);
    setSelectedWords([]);
  }, [question.questionId]);

  useEffect(() => {
    if (Array.isArray(value)) {
      setSelectedWords(value);
    }
  }, []);

  const buildWords = () => {
    if (question.words && Array.isArray(question.words)) {
      return shuffleArray(question.words);
    }

    if (question.correctText) {
      return shuffleArray(question.correctText.split(" ").filter(Boolean));
    }

    return shuffleArray((question.content || "").split(" ").filter(Boolean));
  };

  const shuffleArray = (arr) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  const handlePickWord = (word, index) => {
    const newAvailable = availableWords.filter((_, i) => i !== index);
    const newSelected = [...selectedWords, word];

    setAvailableWords(newAvailable);
    setSelectedWords(newSelected);

    onChange(question.questionId, newSelected);
  };

  const handleRemoveWord = (word, index) => {
    const newSelected = selectedWords.filter((_, i) => i !== index);
    const newAvailable = [...availableWords, word];

    setSelectedWords(newSelected);
    setAvailableWords(newAvailable);

    onChange(question.questionId, newSelected);
  };

  const handleReset = () => {
    const words = buildWords();

    setAvailableWords(words);
    setSelectedWords([]);

    onChange(question.questionId, []);
  };

  return (
    <div className="question-body">
      <h5>{question.content}</h5>

      <div className="arrange-answer-box">
        <label>Câu đã sắp xếp</label>

        <div className="selected-word-area">
          {selectedWords.length === 0 ? (
            <span className="empty-selected-text">
              Chọn các từ bên dưới để tạo thành câu hoàn chỉnh...
            </span>
          ) : (
            selectedWords.map((word, index) => (
              <button
                type="button"
                key={`${word}-${index}`}
                className="selected-word"
                onClick={() => handleRemoveWord(word, index)}
              >
                {word}
                <i className="bi bi-x"></i>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="word-bank-box">
        <label>Ngân hàng từ</label>

        <div className="word-bank">
          {availableWords.map((word, index) => (
            <button
              type="button"
              key={`${word}-${index}`}
              className="word-chip"
              onClick={() => handlePickWord(word, index)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="btn btn-light mt-3" onClick={handleReset}>
        <i className="bi bi-arrow-counterclockwise me-2"></i>
        Làm lại câu này
      </button>
    </div>
  );
}

export default ArrangeSentenceQuestion;