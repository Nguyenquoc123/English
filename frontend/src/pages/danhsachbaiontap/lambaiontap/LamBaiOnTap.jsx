import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LamBaiOnTap.css";

function LamBaiOnTap() {
  const navigate = useNavigate();

  // Ví dụ route: /personal-practices/:personalPracticeId
  const { personalPracticeId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  const practiceInfo = {
    title: "Ôn tập cá nhân",
    subtitle: "Trả lời các câu hỏi được hệ thống gợi ý riêng cho bạn.",
    icon: "bi bi-person-check",
  };

  useEffect(() => {
    layBaiOnTapCaNhan();
  }, [personalPracticeId]);

  const answeredCount = useMemo(() => {
    return questions.filter((question) => {
      const value = answers[question.questionId];

      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";

      return value !== undefined && value !== null;
    }).length;
  }, [answers, questions]);

  const progressPercent = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const layBaiOnTapCaNhan = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE}/personal-practices/${personalPracticeId}`,
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

      const result = data?.result || data?.data || data;

      if (!response.ok) {
        alert(result?.message || "Không thể tải bài ôn tập cá nhân");
        return;
      }

      // API của bạn trả về trực tiếp một mảng câu hỏi
      setQuestions(Array.isArray(result) ? result : []);
      setAnswers({});
      setCurrentIndex(0);
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống khi tải bài ôn tập cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleGoQuestion = (index) => {
    setCurrentIndex(index);

    const question = questions[index];

    if (!question) return;

    const el = document.getElementById(`question-${question.questionId}`);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const buildSubmitPayload = () => {
    return {
      personalPracticeId: Number(personalPracticeId),
      answers: questions.map((question) => {
        const answerValue = answers[question.questionId];

        if (
          question.questionType === "MULTIPLE_CHOICE" ||
          question.questionType === "LISTENING_CHOICE"
        ) {
          return {
            questionId: question.questionId,
            selectedOptionId: answerValue || null,
            answerText: null,
          };
        }

        if (question.questionType === "ARRANGE_SENTENCE") {
          return {
            questionId: question.questionId,
            selectedOptionId: null,
            answerText: Array.isArray(answerValue)
              ? answerValue.join(" ")
              : answerValue || "",
          };
        }

        return {
          questionId: question.questionId,
          selectedOptionId: null,
          answerText: answerValue || "",
        };
      }),
    };
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;

    const unanswered = questions.length - answeredCount;

    if (unanswered > 0) {
      const ok = window.confirm(
        `Bạn còn ${unanswered} câu chưa trả lời. Bạn vẫn muốn nộp bài?`
      );

      if (!ok) return;
    }

    try {
      setSubmitting(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE}/personal-practices/${personalPracticeId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(buildSubmitPayload()),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const result = data?.result || data?.data || data;

      if (!response.ok) {
        alert(result?.message || "Nộp bài thất bại");
        return;
      }

      alert("Nộp bài thành công");

      // Nếu backend trả attemptId thì chuyển sang trang chi tiết kết quả
      if (result?.attemptId) {
        navigate(`/attempts/${result.attemptId}`);
        return;
      }

      navigate("/attempts");
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống khi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    const ok = window.confirm("Bạn có chắc muốn làm lại toàn bộ bài ôn tập?");

    if (!ok) return;

    setAnswers({});
    setCurrentIndex(0);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const isAnswered = (question) => {
    const value = answers[question.questionId];

    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";

    return value !== undefined && value !== null;
  };

  if (loading) {
    return (
      <div className="student-practice-page">
        <div className="practice-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải bài ôn tập cá nhân...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-practice-page">
      <div className="student-practice-container">
        <div className="practice-breadcrumb">
          <span
            className="practice-breadcrumb-item"
            onClick={() => navigate("/")}
          >
            Trang chủ
          </span>

          <i className="bi bi-chevron-right practice-breadcrumb-separator"></i>

          <span className="practice-breadcrumb-item active">
            Ôn tập cá nhân
          </span>
        </div>

        

        {questions.length === 0 ? (
          <div className="practice-empty-state">
            <i className="bi bi-journal-x"></i>
            <h5>Chưa có câu hỏi ôn tập cá nhân</h5>
            <p>Hệ thống chưa tạo câu hỏi ôn tập cho bạn.</p>
          </div>
        ) : (
          <div className="practice-layout">
            <div className="practice-main">
             

              {questions.map((question, index) => (
                <PersonalPracticeQuestionCard
                  key={question.questionId}
                  question={question}
                  index={index}
                  value={answers[question.questionId]}
                  onChange={handleAnswerChange}
                />
              ))}
            </div>

            <aside className="practice-sidebar">
              <div className="practice-sidebar-card">
                <div className="sidebar-progress-row">
                  <span>Đã trả lời</span>
                  <strong>
                    {answeredCount}/{questions.length}
                  </strong>
                </div>

                <div className="sidebar-percent-row">
                  <span>Tiến độ</span>
                  <strong>{progressPercent}%</strong>
                </div>

                <div className="question-number-grid">
                  {questions.map((question, index) => {
                    const answered = isAnswered(question);

                    return (
                      <button
                        type="button"
                        key={question.questionId}
                        className={[
                          "question-number-btn",
                          answered ? "answered" : "",
                          currentIndex === index ? "current" : "",
                        ].join(" ")}
                        onClick={() => handleGoQuestion(index)}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100 submit-practice-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang nộp...
                    </>
                  ) : (
                    "Nộp bài"
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-light w-100 mt-2 reset-practice-btn"
                  onClick={handleReset}
                  disabled={submitting}
                >
                  Làm lại
                </button>
              </div>

              
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function PersonalPracticeQuestionCard({ question, index, value, onChange }) {
  const renderMultipleChoice = () => {
    return (
      <div className="practice-option-list">
        {question.options?.map((option) => {
          const checked = Number(value) === Number(option.optionId);

          return (
            <label
              key={option.optionId}
              className={[
                "practice-option-item",
                checked ? "selected" : "",
              ].join(" ")}
            >
              <input
                type="radio"
                name={`question-${question.questionId}`}
                value={option.optionId}
                checked={checked}
                onChange={() => onChange(question.questionId, option.optionId)}
              />

              <span>{option.optionText}</span>
            </label>
          );
        })}
      </div>
    );
  };

  const renderTextAnswer = () => {
    return (
      <textarea
        className="form-control"
        rows="4"
        placeholder="Nhập câu trả lời của bạn..."
        value={value || ""}
        onChange={(e) => onChange(question.questionId, e.target.value)}
      ></textarea>
    );
  };

  const renderArrangeSentence = () => {
    const words = question.words || [];

    return (
      <div>
        <div className="alert alert-light border">
          Dạng sắp xếp câu cần component riêng. Tạm thời nhập câu trả lời của bạn
          vào ô bên dưới.
        </div>

        {words.length > 0 && (
          <div className="mb-3">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="badge bg-light text-dark border me-2 mb-2">
                {word}
              </span>
            ))}
          </div>
        )}

        {renderTextAnswer()}
      </div>
    );
  };

  const renderAnswerArea = () => {
    if (
      question.questionType === "MULTIPLE_CHOICE" ||
      question.questionType === "LISTENING_CHOICE"
    ) {
      return renderMultipleChoice();
    }

    if (question.questionType === "ARRANGE_SENTENCE") {
      return renderArrangeSentence();
    }

    return renderTextAnswer();
  };

  return (
    <div
      id={`question-${question.questionId}`}
      className="practice-question-card"
    >
      <div className="practice-question-header">
        <div className="practice-question-number">
          Câu {index + 1}
        </div>

        <div className="practice-question-point">
          {question.defaultPoint || 1} điểm
        </div>
      </div>

      <div className="practice-question-content">
        <h5>{question.content}</h5>
      </div>

      {question.mediaUrl && (
        <div className="practice-question-media">
          {question.questionType?.includes("LISTENING") ? (
            <audio controls src={question.mediaUrl} className="w-100">
              Trình duyệt không hỗ trợ phát audio.
            </audio>
          ) : (
            <img
              src={question.mediaUrl}
              alt="question"
              className="img-fluid rounded border"
            />
          )}
        </div>
      )}

      {renderAnswerArea()}
    </div>
  );
}

export default LamBaiOnTap;