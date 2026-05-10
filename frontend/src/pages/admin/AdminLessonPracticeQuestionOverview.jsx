import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AdminLessonPracticeQuestionOverview() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const PRACTICE_TYPES = [
    { type: "MULTIPLE_CHOICE", label: "Trắc nghiệm", icon: "bi-ui-checks-grid" },
    { type: "LISTENING_CHOICE", label: "Nghe chọn đáp án", icon: "bi-volume-up" },
    { type: "LISTENING_FILL_BLANK", label: "Nghe điền từ", icon: "bi-soundwave" },
    { type: "ARRANGE_SENTENCE", label: "Sắp xếp câu", icon: "bi-shuffle" },
    { type: "WRITING_SHORT", label: "Viết ngắn", icon: "bi-pencil-square" },
  ];

  const [questions, setQuestions] = useState([]);
  const [configs, setConfigs] = useState([]);

  useEffect(() => {
    loadPracticeData();
  }, [lessonId]);

  const loadPracticeData = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/lesson/${courseId}/admin/lessons/${lessonId}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    const data = await response.json();
    const lessonData = data.result || data.data || data;

    setQuestions(lessonData.questions || []);
    setConfigs(lessonData.practiceConfigs || []);
  };

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

  const handleToggle = async (practiceType, currentEnabled) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/teacher/lessons/${lessonId}/practice-configs/${practiceType}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            isEnabled: !currentEnabled,
          }),
        }
      );

      if (!response.ok) {
        alert("Cập nhật trạng thái ôn tập thất bại");
        return;
      }

      loadPracticeData();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống");
    }
  };

  return (
    <div className="teacher-lesson-detail-page">
      <div className="lesson-detail-heading">
        <div>
          <button
            className="lesson-detail-back"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}`)}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại chi tiết bài học
          </button>

          <h2>Quản lý ôn tập</h2>
          <p>Quản lý các dạng ôn tập của lesson, số câu hỏi và trạng thái ẩn/hiện.</p>
        </div>

        
      </div>

      <div className="row g-3">
        {practiceRows.map((row) => (
          <div className="col-lg-4 col-md-6" key={row.type}>
            <div className="info-card h-100">
              <div className="d-flex align-items-start gap-3">
                <div className="summary-icon bg-blue">
                  <i className={`bi ${row.icon}`}></i>
                </div>

                <div className="flex-grow-1">
                  <h5 className="mb-1">{row.label}</h5>
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

              <div className="mt-4">
                <span className="text-muted">Số câu hỏi</span>
                <h3 className="fw-bold">{row.questionCount}</h3>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    navigate(
                      `/admin/courses/${courseId}/lessons/${lessonId}/practice/${row.type}`
                    )
                  }
                >
                  Xem chi tiết
                </button>

                
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminLessonPracticeQuestionOverview;