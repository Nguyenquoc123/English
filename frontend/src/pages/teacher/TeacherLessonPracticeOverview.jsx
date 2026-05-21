import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherLessonPracticeQuestionList from "./TeacherLessonPracticeQuestionList";

function TeacherLessonPracticeOverview({
  embedded = false,
  courseId: courseIdProp,
  lessonId: lessonIdProp,
}) {
  const navigate = useNavigate();
  const params = useParams();

  const [selectedPractice, setSelectedPractice] = useState(null);

  const courseId = courseIdProp || params.courseId;
  const lessonId = lessonIdProp || params.lessonId;

  const API_BASE = "http://localhost:8080";

  const PRACTICE_TYPES = [
    {
      type: "MULTIPLE_CHOICE",
      label: "Trắc nghiệm",
      icon: "bi-ui-checks-grid",
    },
    {
      type: "LISTENING_CHOICE",
      label: "Nghe chọn đáp án",
      icon: "bi-volume-up",
    },
    {
      type: "LISTENING_FILL_BLANK",
      label: "Nghe điền từ",
      icon: "bi-soundwave",
    },
    {
      type: "ARRANGE_SENTENCE",
      label: "Sắp xếp câu",
      icon: "bi-shuffle",
    },
    {
      type: "WRITING_SHORT",
      label: "Viết ngắn",
      icon: "bi-pencil-square",
    },
  ];

  const [questions, setQuestions] = useState([]);
  const [configs, setConfigs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [togglingType, setTogglingType] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (courseId && lessonId) {
      loadPracticeData();
    }
  }, [courseId, lessonId]);

  const loadPracticeData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/lesson/${courseId}/teacher/lessons/${lessonId}`,
        {
          method: "GET",
          headers: {
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
        setError(data?.message || "Không thể tải dữ liệu ôn tập");
        return;
      }

      const lessonData = data?.result || data?.data || data;

      setQuestions(Array.isArray(lessonData.questions) ? lessonData.questions : []);
      setConfigs(
        Array.isArray(lessonData.practiceConfigs)
          ? lessonData.practiceConfigs
          : []
      );
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const practiceRows = useMemo(() => {
    return PRACTICE_TYPES.map((item) => {
      const questionCount = questions.filter(
        (question) => question.questionType === item.type
      ).length;

      const config = configs.find(
        (configItem) => configItem.practiceType === item.type
      );

      return {
        ...item,
        questionCount,
        isEnabled: config ? config.isEnabled : questionCount > 0,
      };
    });
  }, [questions, configs]);

  const handleCreateQuestion = () => {
    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/questions/create`);
  };

  const handleViewPracticeType = (practiceType) => {
    const practice = PRACTICE_TYPES.find((item) => item.type === practiceType);
    setSelectedPractice(practice || { type: practiceType, label: practiceType });
  };

  const handleToggle = async (practiceType, currentEnabled) => {
    try {
      setTogglingType(practiceType);

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

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Cập nhật trạng thái ôn tập thất bại");
        return;
      }

      loadPracticeData();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống");
    } finally {
      setTogglingType(null);
    }
  };

  return (
    <div className={embedded ? "p-3" : "teacher-lesson-detail-page"}>
      {!embedded && (
        <div className="lesson-detail-heading">
          <div>
            <button
              type="button"
              className="lesson-detail-back"
              onClick={() =>
                navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
              }
            >
              <i className="bi bi-arrow-left"></i>
              Quay lại chi tiết bài học
            </button>

            <h2>Quản lý ôn tập</h2>
            <p>
              Quản lý các dạng ôn tập của lesson, số câu hỏi và trạng thái
              ẩn/hiện.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateQuestion}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm câu hỏi
          </button>
        </div>
      )}

      {embedded && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Ôn tập bài học</h5>
            <div className="text-muted small">
              Quản lý các dạng câu hỏi ôn tập trong bài học này.
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateQuestion}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm câu hỏi
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-muted py-4">
          <div className="spinner-border spinner-border-sm text-primary me-2"></div>
          Đang tải dữ liệu ôn tập...
        </div>
      )}

      

      {!loading && !error && (
        <div className="row g-3">
          {practiceRows.map((row) => (
            <div className="col-lg-4 col-md-6" key={row.type}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="rounded-circle bg-light border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 44, height: 44 }}
                    >
                      <i className={`bi ${row.icon} text-primary fs-5`}></i>
                    </div>

                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1">{row.label}</h6>
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
                    <div className="text-muted small">Số câu hỏi</div>
                    <div className="display-6 fw-bold mb-0">
                      {row.questionCount}
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => handleViewPracticeType(row.type)}
                    >
                      Xem chi tiết
                    </button>

                    <button
                      type="button"
                      className={
                        row.isEnabled
                          ? "btn btn-sm btn-outline-danger"
                          : "btn btn-sm btn-outline-success"
                      }
                      onClick={() => handleToggle(row.type, row.isEnabled)}
                      disabled={togglingType === row.type}
                    >
                      {togglingType === row.type ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : row.isEnabled ? (
                        "Ẩn"
                      ) : (
                        "Hiện"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {practiceRows.length === 0 && (
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center text-muted py-4">
                  Không có dữ liệu ôn tập.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedPractice && (
  <div
    className="modal fade show"
    style={{
      display: "block",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    }}
    tabIndex="-1"
  >
    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h5 className="modal-title mb-0">
              Danh sách câu hỏi: {selectedPractice.label}
            </h5>
            <small className="text-muted">{selectedPractice.type}</small>
          </div>

          <button
            type="button"
            className="btn-close"
            onClick={() => setSelectedPractice(null)}
          ></button>
        </div>

        <div className="modal-body">
          <TeacherLessonPracticeQuestionList
            embedded={true}
            courseId={courseId}
            lessonId={lessonId}
            practiceType={selectedPractice.type}
            practiceLabel={selectedPractice.label}
            onBack={() => setSelectedPractice(null)}
          />
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default TeacherLessonPracticeOverview;