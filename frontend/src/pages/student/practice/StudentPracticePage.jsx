import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PracticeQuestionCard from "./components/PracticeQuestionCard";
import FlashcardPractice from "./components/FlashcardPractice";
import "./StudentPracticePage.css";

function StudentPracticePage() {
  const navigate = useNavigate();
  const { courseId, lessonId, practiceType } = useParams();

  const API_BASE = "http://localhost:8080";

  const [practiceData, setPracticeData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  const practiceInfo = useMemo(() => {
    const map = {
      MULTIPLE_CHOICE: {
        title: "Trắc nghiệm",
        subtitle: "Chọn đáp án đúng nhất cho mỗi câu hỏi.",
        icon: "bi bi-ui-checks-grid",
      },
      LISTENING_CHOICE: {
        title: "Nghe chọn đáp án",
        subtitle: "Nghe audio và chọn đáp án phù hợp.",
        icon: "bi bi-headphones",
      },
      LISTENING_FILL_BLANK: {
        title: "Nghe điền từ",
        subtitle: "Nghe audio và điền từ còn thiếu.",
        icon: "bi bi-mic",
      },
      ARRANGE_SENTENCE: {
        title: "Sắp xếp câu",
        subtitle: "Sắp xếp các từ thành câu hoàn chỉnh.",
        icon: "bi bi-sort-alpha-down",
      },
      WRITING_SHORT: {
        title: "Viết ngắn",
        subtitle: "Nhập câu trả lời ngắn theo yêu cầu.",
        icon: "bi bi-pencil",
      },
      FLASHCARD: {
        title: "Flashcard",
        subtitle: "Ôn tập nhanh từ vựng bằng thẻ ghi nhớ.",
        icon: "bi bi-card-text",
      },
    };

    return (
      map[practiceType] || {
        title: practiceType,
        subtitle: "Làm bài ôn tập của lesson.",
        icon: "bi bi-question-circle",
      }
    );
  }, [practiceType]);

  const questions = practiceData?.questions || [];

  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      const value = answers[q.questionId];

      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return value !== undefined && value !== null;
    }).length;
  }, [answers, questions]);

  const progressPercent = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  useEffect(() => {
    loadPractice();
  }, [lessonId, practiceType]);

  const loadPractice = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      /*
        API gợi ý:
        GET /lessons/{lessonId}/practice/{practiceType}/student

        Response mẫu:
        {
          "lessonId": 2,
          "lessonTitle": "Daily Activities",
          "practiceType": "MULTIPLE_CHOICE",
          "questions": [
            {
              "questionId": 1,
              "questionType": "MULTIPLE_CHOICE",
              "content": "Choose the correct answer...",
              "mediaUrl": null,
              "correctText": null,
              "options": [
                { "optionId": 1, "optionText": "have" },
                { "optionId": 2, "optionText": "has" }
              ]
            }
          ]
        }
      */

      const response = await fetch(
        `${API_BASE}/practice-configs/${lessonId}/practice/${practiceType}/student`,
        {
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
        alert(result?.message || "Không thể tải bài ôn tập");
        return;
      }

      setPracticeData(result);
      setAnswers({});
      setCurrentIndex(0);
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống khi tải bài ôn tập");
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

    const el = document.getElementById(`question-${questions[index]?.questionId}`);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const buildSubmitPayload = () => {
    return {
      lessonId: Number(lessonId),
      practiceType,
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

      const response = await fetch(`${API_BASE}/practice-attempts/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildSubmitPayload()),
      });

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

      navigate(
        `/khoa-hoc/${courseId}/lessons/${lessonId}/practice-result/${result.attemptId}`
      );
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

  if (loading) {
    return (
      <div className="student-practice-page">
        <div className="practice-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải bài ôn tập...</p>
        </div>
      </div>
    );
  }

  if (practiceType === "FLASHCARD") {
    return (
      <FlashcardPractice
        API_BASE={API_BASE}
        lessonId={lessonId}
        courseId={courseId}
        getToken={getToken}
      />
    );
  }

  return (
    <div className="student-practice-page">
      <div className="student-practice-container">
        <button
          type="button"
          className="practice-back-link"
          onClick={() => navigate(`/khoa-hoc/${courseId}/lessons/${lessonId}`)}
        >
          <i className="bi bi-arrow-left"></i>
          Quay lại lesson
        </button>

        <div className="practice-header">
          <div>
            <div className="practice-type-pill">
              <i className={practiceInfo.icon}></i>
              {practiceInfo.title}
            </div>

            <h2>{practiceData?.lessonTitle || "Bài ôn tập"}</h2>
            <p>{practiceInfo.subtitle}</p>
          </div>

          <div className="practice-header-card">
            <span>Tiến độ bài làm</span>
            <strong>{answeredCount}/{questions.length}</strong>
            <div className="practice-progress-track">
              <div
                className="practice-progress-bar"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="practice-empty-state">
            <i className="bi bi-journal-x"></i>
            <h5>Chưa có câu hỏi ôn tập</h5>
            <p>Giáo viên chưa thêm câu hỏi cho dạng ôn tập này.</p>
          </div>
        ) : (
          <div className="practice-layout">
            <div className="practice-main">
              <div className="practice-instruction">
                <i className="bi bi-info-circle"></i>
                {practiceInfo.subtitle}
              </div>

              {questions.map((question, index) => (
                <PracticeQuestionCard
                  key={question.questionId}
                  API_BASE={API_BASE}
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
                  <strong>{answeredCount}/{questions.length}</strong>
                </div>

                <div className="sidebar-percent-row">
                  <span>Tiến độ</span>
                  <strong>{progressPercent}%</strong>
                </div>

                <div className="question-number-grid">
                  {questions.map((question, index) => {
                    const answerValue = answers[question.questionId];
                    const answered = Array.isArray(answerValue)
                      ? answerValue.length > 0
                      : typeof answerValue === "string"
                      ? answerValue.trim() !== ""
                      : answerValue !== undefined && answerValue !== null;

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

              <div className="practice-warning-card">
                <i className="bi bi-exclamation-circle"></i>
                <span>
                  Hãy trả lời đầy đủ các câu hỏi trước khi nộp bài. Bạn có thể làm
                  lại bài nếu muốn luyện tập thêm.
                </span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentPracticePage;