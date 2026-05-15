import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LessonReviewDetail.css";

function LessonReviewDetail() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [videos, setVideos] = useState([]);
  const [vocabularies, setVocabularies] = useState([]);
  const [grammars, setGrammars] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLessonDetail();
  }, [courseId, lessonId]);

  // Tải chi tiết bài học cho admin review
  const loadLessonDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/lesson/${courseId}/admin/lessons/${lessonId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      let data = null;
      try { data = await response.json(); } catch { data = null; }

      if (!response.ok) {
        setError(data?.message || "Không thể tải chi tiết bài học");
        return;
      }

      const lessonData = data.result || data.data || data;
      setLesson(lessonData);
      setVideos(lessonData.videos || []);
      setVocabularies(lessonData.vocabularies || []);
      setGrammars(lessonData.grammars || []);
      setQuestions(lessonData.questions || []);
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Published: "badge rounded-pill text-bg-success",
      Draft: "badge rounded-pill text-bg-secondary",
      Hidden: "badge rounded-pill text-bg-danger",
      Pending: "badge rounded-pill text-bg-warning",
    };
    return map[status] || "badge rounded-pill text-bg-light";
  };

  // Đếm câu hỏi theo loại
  const countQuestionType = (type) => questions.filter((q) => q.questionType === type).length;

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Đang tải chi tiết bài học...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle"></i>
        <span>{error}</span>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="alert alert-warning">Không tìm thấy bài học.</div>
    );
  }

  return (
    <div className="lesson-review-detail-page">
      {/* Header */}
      <div className="mb-4">
        <button
          className="btn btn-light btn-sm mb-2"
          onClick={() => navigate(`/admin/courses/${courseId}/lessons`)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Quay lại danh sách bài học
        </button>
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge bg-primary-subtle text-primary rounded-pill">
            <i className="bi bi-journal-bookmark me-1"></i>
            {lesson.courseTitle || "Khóa học"}
          </span>
        </div>
        <h4 className="fw-bold mb-1" style={{ color: "#0f3c9c" }}>
          Review Lesson {lesson.lessonOrder}: {lesson.title}
        </h4>
        <p className="text-muted mb-0">
          {lesson.description || "Bài học chưa có mô tả."}
        </p>
      </div>

      {/* Thẻ thống kê nội dung */}
      <div className="row g-3 mb-4">
        {[
          { label: "Video", count: videos.length, icon: "bi-camera-video", color: "primary", path: "videos" },
          { label: "Từ vựng", count: vocabularies.length, icon: "bi-card-text", color: "success", path: "vocabularies" },
          { label: "Ngữ pháp", count: grammars.length, icon: "bi-pencil-square", color: "warning", path: "grammars" },
          { label: "Câu hỏi ôn tập", count: questions.length, icon: "bi-check2-circle", color: "danger", path: "practice" },
        ].map((item) => (
          <div className="col-md-3 col-6" key={item.path}>
            <button
              type="button"
              className="card border-0 shadow-sm rounded-4 w-100 text-start p-3"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/${item.path}`)}
            >
              <div className="d-flex align-items-center gap-3">
                <div className={`stat-icon bg-${item.color}-subtle text-${item.color}`}>
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <div>
                  <div className="text-muted small">{item.label}</div>
                  <h5 className="fw-bold mb-0">{item.count}</h5>
                  <small className="text-muted">Click để review</small>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Nút điều hướng review */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/videos`)}>
            <i className="bi bi-camera-video me-1"></i>Review video
          </button>
          <button className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/vocabularies`)}>
            <i className="bi bi-card-text me-1"></i>Review từ vựng
          </button>
          <button className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/grammars`)}>
            <i className="bi bi-journal-text me-1"></i>Review ngữ pháp
          </button>
          <button className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/practice`)}>
            <i className="bi bi-check2-circle me-1"></i>Review ôn tập
          </button>
          <button className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(`/admin/courses/${courseId}/review`)}>
            <i className="bi bi-shield-check me-1"></i>Quay lại duyệt khóa học
          </button>
        </div>
      </div>

      {/* Thông tin chi tiết bài học */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-0">Thông tin bài học</h5>
            <p className="text-muted small mb-0">
              Admin kiểm tra thông tin cơ bản của lesson trước khi duyệt khóa học.
            </p>
          </div>
          <span className={getStatusBadge(lesson.status)}>{lesson.status}</span>
        </div>

        <div className="row g-3 mb-3">
          {[
            { label: "Tên bài học", value: lesson.title },
            { label: "Thứ tự bài học", value: lesson.lessonOrder },
            { label: "Ngày tạo", value: lesson.createdAt || "--" },
            { label: "Ngày cập nhật", value: lesson.updatedAt || "--" },
            { label: "Khóa học", value: lesson.courseTitle || "--" },
          ].map((item) => (
            <div className="col-md-4 col-6" key={item.label}>
              <div className="text-muted small">{item.label}</div>
              <div className="fw-semibold">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-muted small mb-1">Mô tả bài học</div>
          <p className="mb-0">{lesson.description || "Chưa có mô tả."}</p>
        </div>

        <div className="alert alert-info">
          <strong>Gợi ý kiểm duyệt:</strong> Admin nên kiểm tra lesson có video,
          từ vựng, ngữ pháp và câu hỏi ôn tập phù hợp hay chưa.
        </div>

        {/* Thống kê câu hỏi theo loại */}
        <div className="row g-3 mt-2">
          {[
            { label: "Trắc nghiệm", type: "MULTIPLE_CHOICE" },
            { label: "Nghe chọn đáp án", type: "LISTENING_CHOICE" },
            { label: "Nghe điền từ", type: "LISTENING_FILL_BLANK" },
            { label: "Sắp xếp câu", type: "ARRANGE_SENTENCE" },
            { label: "Viết ngắn", type: "WRITING_SHORT" },
          ].map((item) => (
            <div className="col-md-4 col-6" key={item.type}>
              <div className="card border-0 bg-light rounded-3 p-3 text-center">
                <div className="text-muted small">{item.label}</div>
                <h5 className="fw-bold mb-0">{countQuestionType(item.type)} câu</h5>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LessonReviewDetail;
