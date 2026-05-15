import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherLessonDetail.css";

function TeacherLessonDetail() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

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

  const loadLessonDetail = async () => {
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
        setError(data?.message || "Không thể tải chi tiết bài học");
        return;
      }

      const lessonData = data.result || data.data || data;

      setLesson(lessonData);
      setVideos(lessonData.videos || []);
      setVocabularies(lessonData.vocabularies || []);
      setGrammars(lessonData.grammars || []);
      setQuestions(lessonData.questions || []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Published") return "badge rounded-pill text-bg-success";
    if (status === "Draft") return "badge rounded-pill text-bg-secondary";
    if (status === "Hidden") return "badge rounded-pill text-bg-danger";
    if (status === "Pending") return "badge rounded-pill text-bg-warning";
    return "badge rounded-pill text-bg-light";
  };

  const countQuestionType = (type) => {
    return questions.filter((q) => q.questionType === type).length;
  };

  const handleHideLesson = async () => {
    const ok = window.confirm("Bạn có chắc muốn ẩn bài học này không?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/teacher/khoa-hoc/${courseId}/lessons/${lessonId}/hide`,
        {
          method: "PUT",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        alert("Ẩn bài học thất bại");
        return;
      }

      alert("Ẩn bài học thành công");
      loadLessonDetail();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống");
    }
  };

  if (loading) {
    return (
      <div className="teacher-lesson-detail-page">
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải chi tiết bài học...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-lesson-detail-page">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="teacher-lesson-detail-page">
        <div className="alert alert-warning">Không tìm thấy bài học.</div>
      </div>
    );
  }

  return (
    <div className="teacher-lesson-detail-page">
      <div className="lesson-detail-heading">
        <div>
          <button
            type="button"
            className="lesson-detail-back"
            onClick={() => navigate(`/teacher/courses/${courseId}/lessons`)}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại danh sách bài học
          </button>

          <div className="course-pill">
            <i className="bi bi-journal-bookmark"></i>
            {lesson.courseTitle}
          </div>

          <h2>
            Lesson {lesson.lessonOrder}: {lesson.title}
          </h2>

          <p>{lesson.description || "Bài học chưa có mô tả."}</p>
        </div>

        <div className="lesson-status-panel">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>Trạng thái bài học</span>
            <span className={getStatusBadge(lesson.status)}>
              {lesson.status}
            </span>
          </div>

          <div className="progress lesson-progress">
            <div
              className="progress-bar"
              style={{ width: `${lesson.progressPercent || 0}%` }}
            ></div>
          </div>

          <small className="text-muted">
            Mức hoàn thiện nội dung: {lesson.progressPercent || 0}%
          </small>
        </div>
      </div>

      <div className="lesson-summary-grid">
        <button
          type="button"
          className="lesson-summary-card summary-link-card"
          onClick={() =>
            navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/videos`)
          }
        >
          <div className="summary-icon bg-blue">
            <i className="bi bi-camera-video"></i>
          </div>
          <div>
            <span>Video</span>
            <strong>{videos.length}</strong>
          </div>
        </button>

        <button
          type="button"
          className="lesson-summary-card summary-link-card"
          onClick={() =>
            navigate(
              `/teacher/courses/${courseId}/lessons/${lessonId}/vocabularies`
            )
          }
        >
          <div className="summary-icon bg-green">
            <i className="bi bi-card-text"></i>
          </div>
          <div>
            <span>Từ vựng</span>
            <strong>{vocabularies.length}</strong>
          </div>
        </button>

        <button
          type="button"
          className="lesson-summary-card summary-link-card"
          onClick={() =>
            navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/grammars`)
          }
        >
          <div className="summary-icon bg-purple">
            <i className="bi bi-pencil-square"></i>
          </div>
          <div>
            <span>Ngữ pháp</span>
            <strong>{grammars.length}</strong>
          </div>
        </button>

        <button
          type="button"
          className="lesson-summary-card summary-link-card"
          onClick={() =>
            navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/practice`)
          }
        >
          <div className="summary-icon bg-orange">
            <i className="bi bi-check2-circle"></i>
          </div>
          <div>
            <span>Câu hỏi ôn tập</span>
            <strong>{questions.length}</strong>
          </div>
        </button>
      </div>

      <div className="lesson-action-card">
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() =>
              navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/edit`)
            }
          >
            <i className="bi bi-pencil-square me-1"></i>
            Cập nhật bài học
          </button>

          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              navigate(
                `/teacher/courses/${courseId}/lessons/${lessonId}/videos/create`
              )
            }
          >
            <i className="bi bi-camera-video me-1"></i>
            Thêm video
          </button>

          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              navigate(
                `/teacher/courses/${courseId}/lessons/${lessonId}/vocabularies/create`
              )
            }
          >
            <i className="bi bi-card-text me-1"></i>
            Thêm từ vựng
          </button>

          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              navigate(
                `/teacher/courses/${courseId}/lessons/${lessonId}/grammar/create`
              )
            }
          >
            <i className="bi bi-pencil-square me-1"></i>
            Thêm ngữ pháp
          </button>

          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              navigate(
                `/teacher/courses/${courseId}/lessons/${lessonId}/questions/create`
              )
            }
          >
            <i className="bi bi-question-circle me-1"></i>
            Thêm câu hỏi ôn tập
          </button>

          <button className="btn btn-outline-danger" onClick={handleHideLesson}>
            <i className="bi bi-eye-slash me-1"></i>
            Ẩn bài học
          </button>
        </div>
      </div>

      <div className="lesson-content-card">
        <ul className="nav lesson-detail-tabs">
          <li className="nav-item">
            <button type="button" className="nav-link active">
              <i className="bi bi-info-circle me-1"></i>
              Thông tin
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className="nav-link"
              onClick={() =>
                navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/videos`)
              }
            >
              <i className="bi bi-play-circle me-1"></i>
              Video
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className="nav-link"
              onClick={() =>
                navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/vocabularies`)
              }
            >
              <i className="bi bi-card-text me-1"></i>
              Từ vựng
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className="nav-link"
              onClick={() =>
                navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/grammars`)
              }
            >
              <i className="bi bi-journal-text me-1"></i>
              Ngữ pháp
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className="nav-link"
              onClick={() =>
                navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/practice`)
              }
            >
              <i className="bi bi-check2-circle me-1"></i>
              Ôn tập
            </button>
          </li>
        </ul>

        <div className="tab-content-box">
          <h5>Thông tin bài học</h5>

          <div className="lesson-info-grid">
            <div>
              <span>Tên bài học</span>
              <strong>{lesson.title}</strong>
            </div>

            <div>
              <span>Thứ tự bài học</span>
              <strong>{lesson.lessonOrder}</strong>
            </div>

            <div>
              <span>Trạng thái</span>
              <strong>
                <span className={getStatusBadge(lesson.status)}>
                  {lesson.status}
                </span>
              </strong>
            </div>

            <div>
              <span>Ngày tạo</span>
              <strong>{lesson.createdAt || "--"}</strong>
            </div>

            <div>
              <span>Ngày cập nhật</span>
              <strong>{lesson.updatedAt || "--"}</strong>
            </div>

            <div>
              <span>Khóa học</span>
              <strong>{lesson.courseTitle}</strong>
            </div>
          </div>

          <div className="lesson-description-panel mt-4">
            <span>Mô tả bài học</span>
            <p>{lesson.description || "Chưa có mô tả."}</p>
          </div>

          <div className="row g-3 mt-3">
            <div className="col-md-4">
              <div className="small-info-box">
                <span>Trắc nghiệm</span>
                <strong>{countQuestionType("MULTIPLE_CHOICE")} câu</strong>
              </div>
            </div>

            <div className="col-md-4">
              <div className="small-info-box">
                <span>Nghe chọn đáp án</span>
                <strong>{countQuestionType("LISTENING_CHOICE")} câu</strong>
              </div>
            </div>

            <div className="col-md-4">
              <div className="small-info-box">
                <span>Nghe điền từ</span>
                <strong>{countQuestionType("LISTENING_FILL_BLANK")} câu</strong>
              </div>
            </div>

            <div className="col-md-4">
              <div className="small-info-box">
                <span>Sắp xếp câu</span>
                <strong>{countQuestionType("ARRANGE_SENTENCE")} câu</strong>
              </div>
            </div>

            <div className="col-md-4">
              <div className="small-info-box">
                <span>Viết ngắn</span>
                <strong>{countQuestionType("WRITING_SHORT")} câu</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLessonDetail;