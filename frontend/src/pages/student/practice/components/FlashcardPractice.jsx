import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function FlashcardPractice({ API_BASE, lessonId, courseId, getToken }) {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    loadFlashcards();
  }, [lessonId]);

  const progressPercent = useMemo(() => {
    if (!cards.length) return 0;
    return Math.round(((currentIndex + 1) / cards.length) * 100);
  }, [cards, currentIndex]);

  const getFileUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return API_BASE + url;

    return `${API_BASE}/${url}`;
  };

  const shuffleArray = (arr) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  const loadFlashcards = async () => {
    try {
      setLoading(true);

      const token = getToken();

      /*
        Có thể dùng luôn vocabulary làm flashcard:
        GET /vocabularies/{lessonId}/lessons
      */

      const response = await fetch(
        `${API_BASE}/vocabularies/${lessonId}/lessons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      const result = data.result || data.data || data || [];

      if (!response.ok) {
        setCards([]);
        return;
      }

      setCards(shuffleArray(result));
      setCurrentIndex(0);
      setShowMeaning(false);
    } catch (error) {
      console.error(error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (!currentCard?.audioUrl) return;

    const audio = new Audio(getFileUrl(currentCard.audioUrl));
    audio.play();
  };

  const goNext = () => {
    if (currentIndex >= cards.length - 1) {
      alert("Bạn đã hoàn thành bộ flashcard này");
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setShowMeaning(false);
  };

  const handleKnown = () => {
    goNext();
  };

  const handleUnknown = () => {
    if (!currentCard) return;

    const insertIndex = currentIndex + 4;

    const newCards = cards.filter((_, i) => i !== currentIndex);

    if (insertIndex >= newCards.length) {
      newCards.push(currentCard);
    } else {
      newCards.splice(insertIndex, 0, currentCard);
    }

    setCards(newCards);

    if (currentIndex >= newCards.length) {
      setCurrentIndex(Math.max(newCards.length - 1, 0));
    }

    setShowMeaning(false);
  };

  if (loading) {
    return (
      <div className="student-practice-page">
        <div className="practice-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải flashcard...</p>
        </div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="student-practice-page">
        <div className="student-practice-container">
          <button
            type="button"
            className="practice-back-link"
            onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại lesson
          </button>

          <div className="practice-empty-state">
            <i className="bi bi-card-text"></i>
            <h5>Chưa có flashcard</h5>
            <p>Bài học chưa có từ vựng để tạo flashcard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-practice-page">
      <div className="student-practice-container">
        <button
          type="button"
          className="practice-back-link"
          onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
        >
          <i className="bi bi-arrow-left"></i>
          Quay lại lesson
        </button>

        <div className="flashcard-header">
          <div>
            <div className="practice-type-pill">
              <i className="bi bi-card-text"></i>
              Flashcard
            </div>

            <h2>Ôn tập từ vựng</h2>
            <p>Nhìn từ vựng, đoán nghĩa, sau đó chọn Biết rồi hoặc Chưa biết.</p>
          </div>

          <div className="practice-header-card">
            <span>Tiến độ</span>
            <strong>{currentIndex + 1}/{cards.length}</strong>
            <div className="practice-progress-track">
              <div
                className="practice-progress-bar"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flashcard-layout">
          <div className="flashcard-card">
            {currentCard.imageUrl && (
              <div className="flashcard-image">
                <img src={getFileUrl(currentCard.imageUrl)} alt={currentCard.word} />
              </div>
            )}

            <div className="flashcard-main-word">
              <span>Từ vựng</span>
              <h1>{currentCard.word}</h1>
              <p>{currentCard.pronunciation}</p>

              {currentCard.audioUrl && (
                <button type="button" className="flashcard-audio-btn" onClick={playAudio}>
                  <i className="bi bi-volume-up"></i>
                  Nghe phát âm
                </button>
              )}
            </div>

            {showMeaning ? (
              <div className="flashcard-meaning-box">
                <span>Nghĩa</span>
                <h4>{currentCard.meaning}</h4>

                {currentCard.exampleSentence && (
                  <p>{currentCard.exampleSentence}</p>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline-primary show-meaning-btn"
                onClick={() => setShowMeaning(true)}
              >
                Hiện nghĩa
              </button>
            )}

            <div className="flashcard-actions">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleUnknown}
              >
                Chưa biết
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleKnown}
              >
                Biết rồi
              </button>
            </div>
          </div>

          <div className="flashcard-side-note">
            <i className="bi bi-lightbulb"></i>
            <p>
              Nếu chọn “Chưa biết”, từ này sẽ được chèn lại sau vài thẻ để bạn
              gặp lại và ghi nhớ tốt hơn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlashcardPractice;