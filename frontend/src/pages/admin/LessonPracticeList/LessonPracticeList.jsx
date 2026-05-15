import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LessonPracticeList.css";

function LessonPracticeList() {
  const navigate = useNavigate();
  const { courseId, lessonId, practiceType } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [lessonId, practiceType]);

  // Tải câu hỏi theo loại ôn tập cụ thể
  const loadQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/lesson/${courseId}/admin/lessons/${lessonId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();
      const lessonData = data.result || data.data || data;

      setQuestions(
        (lessonData.questions || []).filter((q) => q.questionType === practiceType)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPracticeLabel = (type) => {
    const map = {
      MULTIPLE_CHOICE: "Trắc nghiệm",
      LISTENING_CHOICE: "Nghe chọn đáp án",
      LISTENING_FILL_BLANK: "Nghe điền từ",
      ARRANGE_SENTENCE: "Sắp xếp câu",
      WRITING_SHORT: "Viết ngắn",
    };
    return map[type] || type;
  };

  return (
    <div className="lesson-practice-list-page">
      {/* Header */}
      <div className="mb-4">
        <button
          className="btn btn-light btn-sm mb-2"
          onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/practice`)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Quay lại quản lý ôn tập
        </button>
        <h4 className="fw-bold mb-1" style={{ color: "#0f3c9c" }}>
          Danh sách câu hỏi: {getPracticeLabel(practiceType)}
        </h4>
        <p className="text-muted mb-0">
          Hiển thị các câu hỏi thuộc dạng ôn tập đã chọn.
        </p>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="card border-0 shadow-sm rounded-4 p-3">
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-3 d-block mb-2"></i>
            Dạng ôn tập này chưa có câu hỏi.
          </div>
        )}

        {!loading && questions.map((question, idx) => (
          <div
            key={question.questionId}
            className="card border-0 bg-light rounded-3 p-3 mb-3"
          >
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge rounded-pill text-bg-primary">
                    Câu {idx + 1}
                  </span>
                  <span className="badge rounded-pill bg-secondary-subtle text-secondary small">
                    {question.questionType}
                  </span>
                </div>
                <h6 className="fw-semibold mb-1">{question.content}</h6>
                <div className="text-muted small">
                  Số đáp án: <strong>{question.optionCount || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LessonPracticeList;
