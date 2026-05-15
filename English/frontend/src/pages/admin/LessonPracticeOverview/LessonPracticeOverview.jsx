import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LessonPracticeOverview.css";

const PRACTICE_TYPES = [
  { type: "MULTIPLE_CHOICE", label: "Trắc nghiệm", icon: "bi-ui-checks-grid", color: "primary" },
  { type: "LISTENING_CHOICE", label: "Nghe chọn đáp án", icon: "bi-volume-up", color: "success" },
  { type: "LISTENING_FILL_BLANK", label: "Nghe điền từ", icon: "bi-soundwave", color: "info" },
  { type: "ARRANGE_SENTENCE", label: "Sắp xếp câu", icon: "bi-shuffle", color: "warning" },
  { type: "WRITING_SHORT", label: "Viết ngắn", icon: "bi-pencil-square", color: "danger" },
];

function LessonPracticeOverview() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [configs, setConfigs] = useState([]);

  useEffect(() => {
    loadPracticeData();
  }, [lessonId]);

  // Tải dữ liệu ôn tập từ API bài học admin
  const loadPracticeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/lesson/${courseId}/admin/lessons/${lessonId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();
      const lessonData = data.result || data.data || data;

      setQuestions(lessonData.questions || []);
      setConfigs(lessonData.practiceConfigs || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Tổng hợp số câu hỏi và trạng thái theo từng loại ôn tập
  const practiceRows = useMemo(() => {
    return PRACTICE_TYPES.map((item) => {
      const count = questions.filter((q) => q.questionType === item.type).length;
      const config = configs.find((c) => c.practiceType === item.type);
      return {
        ...item,
        questionCount: count,
        isEnabled: config ? config.isEnabled : count > 0,
      };
    });
  }, [questions, configs]);

  return (
    <div className="lesson-practice-overview-page">
      {/* Header */}
      <div className="mb-4">
        <button
          className="btn btn-light btn-sm mb-2"
          onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/review`)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Quay lại chi tiết bài học
        </button>
        <h4 className="fw-bold mb-1" style={{ color: "#0f3c9c" }}>
          Quản lý ôn tập
        </h4>
        <p className="text-muted mb-0">
          Các dạng ôn tập của bài học, số câu hỏi và trạng thái hiển thị.
        </p>
      </div>

      {/* Thẻ các dạng ôn tập */}
      <div className="row g-3">
        {practiceRows.map((row) => (
          <div className="col-lg-4 col-md-6" key={row.type}>
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
              <div className="d-flex align-items-start gap-3">
                <div className={`practice-icon bg-${row.color}-subtle text-${row.color}`}>
                  <i className={`bi ${row.icon}`}></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-0">{row.label}</h6>
                  <div className="text-muted small">{row.type}</div>
                </div>
                <span
                  className={
                    row.isEnabled
                      ? "badge rounded-pill text-bg-success"
                      : "badge rounded-pill text-bg-secondary"
                  }
                >
                  {row.isEnabled ? "Đang hiện" : "Đang ẩn"}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-muted small">Số câu hỏi</div>
                <h4 className="fw-bold mb-0">{row.questionCount}</h4>
              </div>

              <div className="mt-3">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    navigate(
                      `/admin/courses/${courseId}/lessons/${lessonId}/practice/${row.type}`
                    )
                  }
                >
                  <i className="bi bi-eye me-1"></i>Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LessonPracticeOverview;
