import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudentPracticeResultPage.css";

function StudentPracticeResultPage() {
  const navigate = useNavigate();
  const { courseId, lessonId, attemptId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  useEffect(() => {
    loadPracticeResult();
  }, [attemptId]);

  const loadPracticeResult = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE}/practice-attempts/${attemptId}/result`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const body = data?.result || data?.data || data;

      if (!response.ok) {
        setError(body?.message || "Không thể tải kết quả bài ôn tập");
        return;
      }

      setResult(body);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const getPracticeName = (type) => {
    const map = {
      MULTIPLE_CHOICE: "Trắc nghiệm",
      LISTENING_CHOICE: "Nghe chọn đáp án",
      LISTENING_FILL_BLANK: "Nghe điền từ",
      ARRANGE_SENTENCE: "Sắp xếp câu",
      WRITING_SHORT: "Viết ngắn",
      FLASHCARD: "Flashcard",
    };

    return map[type] || type || "Ôn tập";
  };

  const formatDateTime = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return "0";

    const num = Number(score);

    if (Number.isNaN(num)) return score;

    return Number.isInteger(num) ? String(num) : num.toFixed(1);
  };

  const percent = useMemo(() => {
    if (!result?.totalQuestions) return 0;

    return Math.round((result.totalCorrect / result.totalQuestions) * 100);
  }, [result]);

  const wrongCount = useMemo(() => {
    if (!result?.totalQuestions) return 0;

    return result.totalQuestions - (result.totalCorrect || 0);
  }, [result]);

  const getAnswerDisplay = (detail) => {
    if (detail.selectedOptionText) {
      return detail.selectedOptionText;
    }

    if (detail.answerText) {
      return detail.answerText;
    }

    return "Chưa trả lời";
  };

  if (loading) {
    return (
      <div className="practice-result-page">
        <div className="practice-result-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải kết quả bài làm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="practice-result-page">
        <div className="practice-result-container">
          <button
            type="button"
            className="result-back-link"
            onClick={() => navigate(`/khoa-hoc/${courseId}/lessons/${lessonId}`)}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại lesson
          </button>

          <div className="alert alert-danger mt-3">{error}</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="practice-result-page">
        <div className="practice-result-container">
          <div className="alert alert-warning">Không tìm thấy kết quả bài làm.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-result-page">
      <div className="practice-result-container">
        <div className="result-topbar">
          <div>
            <button
              type="button"
              className="result-back-link"
              onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
            >
              <i className="bi bi-arrow-left"></i>
              Quay lại lesson
            </button>

            <h2>Kết quả ôn tập</h2>
            <p>Xem tổng quan kết quả và chi tiết câu trả lời của bạn.</p>
          </div>

          <div className="result-action-group">
            <button
              type="button"
              className="btn btn-light result-action-btn"
              onClick={() =>
                navigate(
                  `/khoa-hoc/${courseId}/lessons/${lessonId}/practice/${result.practiceType}`
                )
              }
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Làm lại
            </button>

            <button
              type="button"
              className="btn btn-primary result-action-btn"
              onClick={() => navigate(`/khoa-hoc/${courseId}/lessons/${lessonId}`)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại lesson
            </button>
          </div>
        </div>

        <div className="result-summary-grid">
          <div className="result-info-card">
            <div className="summary-card-title">
              <i className="bi bi-info-circle"></i>
              Thông tin bài làm
            </div>

            <div className="result-info-list">
              <div>
                <span>Lesson</span>
                <strong>{result.lessonTitle || "--"}</strong>
              </div>

              <div>
                <span>Dạng ôn tập</span>
                <strong>{getPracticeName(result.practiceType)}</strong>
              </div>

              <div>
                <span>Trạng thái</span>
                <strong>{result.resultStatus || "--"}</strong>
              </div>

              <div>
                <span>Thời gian nộp</span>
                <strong>{formatDateTime(result.submittedAt)}</strong>
              </div>
            </div>
          </div>

          <div className="score-card">
            <div className="score-content">
              <span>Điểm số của bạn</span>

              <div className="score-number">
                {formatScore(result.score)}
                <small>/ {result.totalQuestions || 0}</small>
              </div>

              <div className="score-percent-row">
                <span>Tỷ lệ đúng</span>
                <strong>{percent}%</strong>
              </div>

              <div className="score-progress-track">
                <div
                  className="score-progress-bar"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <p>
                Bạn đã trả lời đúng {result.totalCorrect || 0}/
                {result.totalQuestions || 0} câu hỏi.
              </p>
            </div>

            <div className="score-icon">
              <i className="bi bi-trophy-fill"></i>
            </div>
          </div>
        </div>

        <div className="answer-detail-card">
          <div className="answer-detail-header">
            <div>
              <h4>Chi tiết câu trả lời</h4>
              <p>Xem từng câu hỏi, đáp án của bạn và đáp án đúng.</p>
            </div>

            <div className="answer-stats">
              <span className="stat-correct">{result.totalCorrect || 0} đúng</span>
              <span className="stat-wrong">{wrongCount} sai</span>
            </div>
          </div>

          {result.details && result.details.length > 0 ? (
            <div className="answer-list">
              {result.details.map((detail, index) => (
                <div
                  className={
                    detail.isCorrect
                      ? "answer-item correct"
                      : "answer-item wrong"
                  }
                  key={detail.attemptDetailId || detail.questionId}
                >
                  <div className="answer-item-header">
                    <div className="question-index">
                      <span>{index + 1}</span>
                    </div>

                    <div className="question-title-area">
                      <div className="answer-status-row">
                        <span
                          className={
                            detail.isCorrect
                              ? "answer-status correct"
                              : "answer-status wrong"
                          }
                        >
                          {detail.isCorrect ? "Đúng" : "Sai"}
                        </span>

                        <span className="question-point">
                          {formatScore(detail.earnedPoint)} điểm
                        </span>
                      </div>

                      <h5>{detail.content}</h5>
                    </div>
                  </div>

                  <div className="answer-compare-grid">
                    <div
                      className={
                        detail.isCorrect
                          ? "answer-box user-answer correct"
                          : "answer-box user-answer wrong"
                      }
                    >
                      <span>Đáp án của bạn</span>
                      <strong>{getAnswerDisplay(detail)}</strong>
                    </div>

                    <div className="answer-box correct-answer">
                      <span>Đáp án đúng</span>
                      <strong>{detail.correctAnswer || "--"}</strong>
                    </div>
                  </div>

                  {detail.explanation && (
                    <div className="explanation-box">
                      <i className="bi bi-lightbulb"></i>

                      <div>
                        <strong>Giải thích</strong>
                        <p>{detail.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-result-box">
              <i className="bi bi-journal-x"></i>
              <h5>Không có chi tiết câu trả lời</h5>
              <p>Hệ thống chưa ghi nhận chi tiết bài làm.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentPracticeResultPage;