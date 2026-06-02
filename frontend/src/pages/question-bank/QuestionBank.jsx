import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./QuestionBank.css";
import Page from "../../compenents/phantrang/page.jsx";
import { getFileUrl } from "../../utils/fileurl.js";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

const questionTypeLabels = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  LISTENING_CHOICE: "Nghe chọn đáp án",
  LISTENING_FILL_BLANK: "Nghe điền từ",
  ARRANGE_SENTENCE: "Sắp xếp câu",
  WRITING_SHORT: "Viết ngắn",
};

const statusLabels = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã xuất bản",
  HIDDEN: "Đã ẩn",
};

function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [levels, setLevels] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [levelId, setLevelId] = useState("");

  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [loading, setLoading] = useState(false);
  const [levelLoading, setLevelLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const detailAudioRef = useRef(null);

  useEffect(() => {
    loadLevels();
    loadQuestions(0);
  }, []);

  const loadLevels = async () => {
    try {
      setLevelLoading(true);

      const response = await fetch(`${API_BASE_URL}/level/all-level`);
      const data = await response.json();

      if (!response.ok) {
        setLevels([]);
        return;
      }

      const result = data.result || data.data || data;
      setLevels(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setLevels([]);
    } finally {
      setLevelLoading(false);
    }
  };

  const loadQuestions = async (pageValue = page) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (questionType) {
        params.append("questionType", questionType);
      }

      if (keyword.trim()) {
        params.append("keyword", keyword.trim());
      }

      if (levelId) {
        params.append("levelId", levelId);
      }

      params.append("page", pageValue);
      params.append("size", size);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/questions/my-bank-page?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }
      

      if (!response.ok) {
        setError(data?.message || "Không thể tải ngân hàng câu hỏi.");
        setQuestions([]);
        return;
      }

      const content = data.content || [];
      console.log(content);
      
      setQuestions(content);
      setPage(data.number || 0);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadQuestions(0);
  };

  const handleReset = () => {
    setKeyword("");
    setQuestionType("");
    setLevelId("");
    setPage(0);

    setTimeout(() => {
      loadQuestions(0);
    }, 0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadQuestions(newPage);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "status-published";
      case "DRAFT":
        return "status-draft";
      case "HIDDEN":
        return "status-hidden";
      default:
        return "status-default";
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "type-multiple";
      case "LISTENING_CHOICE":
      case "LISTENING_FILL_BLANK":
        return "type-listening";
      case "ARRANGE_SENTENCE":
        return "type-arrange";
      case "WRITING_SHORT":
        return "type-writing";
      default:
        return "type-default";
    }
  };

  const getCorrectAnswerText = (question) => {
    if (question.correctText) {
      return question.correctText;
    }

    const correctOptions = question.options?.filter((option) => option.isCorrect);

    if (correctOptions && correctOptions.length > 0) {
      return correctOptions.map((option) => option.optionText).join(", ");
    }

    return "Chưa có đáp án đúng";
  };

  const openDetail = (question) => {
    setSelectedQuestion(question);
  };

  const closeDetail = () => {
    setSelectedQuestion(null);
  };

  const playDetailAudio = () => {
    if (detailAudioRef.current) {
      detailAudioRef.current.play();
    }
  };

  return (
    <div className="question-bank-page">
      <main className="question-bank-container">
        

        <section className="question-filter-box">
          <form className="question-filter-form" onSubmit={handleSearch}>
            <div className="filter-field keyword-field">
              <label>Từ khóa</label>
              <input
                type="text"
                placeholder="Tìm theo nội dung, đáp án, giải thích..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label>Loại câu hỏi</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option value="">Tất cả loại câu hỏi</option>
                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                <option value="LISTENING_CHOICE">Nghe chọn đáp án</option>
                <option value="LISTENING_FILL_BLANK">Nghe điền từ</option>
                <option value="ARRANGE_SENTENCE">Sắp xếp câu</option>
                <option value="WRITING_SHORT">Viết ngắn</option>
              </select>
            </div>

            <div className="filter-field">
              <label>Cấp độ</label>
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                disabled={levelLoading}
              >
                <option value="">
                  {levelLoading ? "Đang tải..." : "Tất cả cấp độ"}
                </option>

                {levels.map((level) => (
                  <option key={level.levelId} value={level.levelId}>
                    {level.levelName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="question-search-btn">
              <i className="bi bi-search"></i>
              Tìm kiếm
            </button>

            <button type="button" className="create-question-btn" onClick={() => navigate("/teacher/questions-bank/create")}>
            <i className="bi bi-plus-lg"></i>
            Thêm câu hỏi
          </button>
          </form>
        </section>

        

        {loading && (
          <div className="question-status-box">
            <div className="spinner-border spinner-border-sm me-2"></div>
            Đang tải danh sách câu hỏi...
          </div>
        )}

        {error && <div className="question-error-box">{error}</div>}

        {!loading && !error && questions.length === 0 && (
          <div className="question-empty-box">
            <div className="empty-icon">
              <i className="bi bi-journal-x"></i>
            </div>
            <h4>Không tìm thấy câu hỏi</h4>
            <p>Thử đổi từ khóa, loại câu hỏi hoặc cấp độ để tìm lại.</p>
          </div>
        )}

        {!loading && !error && questions.length > 0 && (
          <section className="question-list">
            {questions.map((question, index) => (
              <article className="question-card" key={question.questionId}>
                

                <div className="question-card-main">
                  <div className="question-card-top">
                    <div className="question-badges">
                      <span className={`question-type ${getTypeClass(question.questionType)}`}>
                        {questionTypeLabels[question.questionType] || question.questionType}
                      </span>

                      

                      <span className="question-level">
                        {question.levelName || "Chưa có cấp độ"}
                      </span>
                    </div>

                    {question.mediaUrl && (
                      <button
                        type="button"
                        className="mini-audio-btn"
                        title="Câu hỏi có audio"
                        onClick={() => openDetail(question)}
                      >
                        <i className="bi bi-volume-up-fill"></i>
                      </button>
                    )}
                  </div>

                  <h3 className="question-title">
                    {question.content}
                  </h3>

                  <div className="question-preview-answer">
                    <span>Đáp án:</span>
                    <p>{getCorrectAnswerText(question)}</p>
                  </div>

                  <div className="question-card-footer">
                    <div className="question-meta">
                      <span>
                        <i className="bi bi-star-fill"></i>
                        {question.defaultPoint ?? 1} điểm
                      </span>

                      <span>
                        <i className="bi bi-person-badge"></i>
                        {question.sourceType || "TEACHER"}
                      </span>
                    </div>

                    <div className="question-actions">
                      <button
                        type="button"
                        className="view-question-btn"
                        onClick={() => openDetail(question)}
                      >
                        <i className="bi bi-eye"></i>
                        Xem chi tiết
                      </button>

                      <button type="button" className="edit-question-btn">
                        <i className="bi bi-pencil-square"></i>
                        Sửa
                      </button>

                      <button type="button" className="delete-question-btn">
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {!loading && !error && questions.length > 0 && (
          <Page
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {selectedQuestion && (
        <div className="question-detail-overlay" onClick={closeDetail}>
          <div
            className="question-detail-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-header">
              <div>
                <span className={`question-type ${getTypeClass(selectedQuestion.questionType)}`}>
                  {questionTypeLabels[selectedQuestion.questionType] ||
                    selectedQuestion.questionType}
                </span>

                <h2>Chi tiết câu hỏi</h2>
              </div>

              <button type="button" className="detail-close-btn" onClick={closeDetail}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="detail-body">
              <div className="detail-question-box">
                <div className="detail-section-title">
                  <i className="bi bi-patch-question-fill"></i>
                  Nội dung câu hỏi
                </div>

                <p>{selectedQuestion.content}</p>
              </div>

              {selectedQuestion.mediaUrl && (
                <div className="detail-audio-box">
                  <button type="button" className="audio-speaker-btn" onClick={playDetailAudio}>
                    <i className="bi bi-volume-up-fill"></i>
                  </button>

                  <div>
                    <strong>Audio câu hỏi</strong>
                    <p>Nhấn vào biểu tượng loa để nghe audio.</p>
                  </div>

                  <audio
                    ref={detailAudioRef}
                    src={getFileUrl(selectedQuestion.mediaUrl)}
                    preload="metadata"
                  />
                </div>
              )}

              {selectedQuestion.options?.length > 0 && (
                <div className="detail-section">
                  <div className="detail-section-title">
                    <i className="bi bi-list-check"></i>
                    Danh sách đáp án
                  </div>

                  <div className="answer-grid">
                    {selectedQuestion.options.map((option, index) => (
                      <div
                        key={option.optionId}
                        className={`answer-option-card ${
                          option.isCorrect ? "answer-correct" : ""
                        }`}
                      >
                        <div className="answer-letter">
                          {String.fromCharCode(65 + index)}
                        </div>

                        <div className="answer-content">
                          <p>{option.optionText}</p>

                          {option.isCorrect && (
                            <span>
                              <i className="bi bi-check-circle-fill"></i>
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <div className="detail-section-title">
                  <i className="bi bi-check2-circle"></i>
                  Đáp án đúng
                </div>

                <div className="correct-answer-box">
                  {getCorrectAnswerText(selectedQuestion)}
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-section-title">
                  <i className="bi bi-lightbulb-fill"></i>
                  Giải thích
                </div>

                <div className="explanation-box">
                  {selectedQuestion.explanation?.trim()
                    ? selectedQuestion.explanation
                    : "Chưa có giải thích cho câu hỏi này."}
                </div>
              </div>

              <div className="detail-info-grid">
                <div>
                  <span>Cấp độ</span>
                  <strong>{selectedQuestion.levelName || "Chưa có cấp độ"}</strong>
                </div>

                <div>
                  <span>Điểm mặc định</span>
                  <strong>{selectedQuestion.defaultPoint ?? 1}</strong>
                </div>

                <div>
                  <span>Trạng thái</span>
                  <strong>{statusLabels[selectedQuestion.status] || selectedQuestion.status}</strong>
                </div>

                <div>
                  <span>Nguồn</span>
                  <strong>{selectedQuestion.sourceType || "TEACHER"}</strong>
                </div>
              </div>
            </div>

            <div className="detail-footer">
              <button type="button" className="detail-secondary-btn" onClick={closeDetail}>
                Đóng
              </button>

              <button type="button" className="detail-primary-btn">
                <i className="bi bi-pencil-square"></i>
                Chỉnh sửa câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionBank;