import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherLessonDetail.css";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherLessonListTrail } from "../../utils/breadcrumbPaths";

// Đổi đường dẫn này theo đúng vị trí component video của bạn
import TeacherLessonVideoList from "./TeacherLessonVideoList";
import TeacherLessonVocabularyList from "./TeacherLessonVocabularyList";
import TeacherLessonGrammarList from "./TeacherLessonGrammarList";
import TeacherLessonPracticeOverview from "./TeacherLessonPracticeOverview";

function TeacherLessonDetail() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [lesson, setLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    if (normalizedStatus === "PUBLISHED") {
      return "badge rounded-pill text-bg-success";
    }

    if (normalizedStatus === "DRAFT") {
      return "badge rounded-pill text-bg-secondary";
    }

    if (normalizedStatus === "HIDDEN") {
      return "badge rounded-pill text-bg-danger";
    }

    if (normalizedStatus === "PENDING") {
      return "badge rounded-pill text-bg-warning";
    }

    return "badge rounded-pill text-bg-light";
  };

  const handleEdit = () => {
    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/edit`);
  };

  const handleDelete = async () => {
    const ok = window.confirm("Bạn có chắc muốn xóa bài học này không?");
    if (!ok) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      /*
        Đổi endpoint này theo API xóa/ẩn lesson thật của bạn.
        Nếu backend của bạn đang dùng ẩn bài học thì đổi thành PUT + endpoint hide.
      */
      const response = await fetch(
        `${API_BASE}/lesson/${courseId}/teacher/lessons/${lessonId}`,
        {
          method: "DELETE",
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
        alert(data?.message || "Xóa bài học thất bại");
        return;
      }

      alert("Xóa bài học thành công");
      navigate(`/teacher/courses/${courseId}`);
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setDeleting(false);
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
        <nav className="teacher-breadcrumb">
          <span
            className="teacher-breadcrumb-item"
            onClick={() => navigate("/teacher/courses")}
          >
            Khóa học
          </span>

          <i className="bi bi-chevron-right teacher-breadcrumb-separator"></i>

          <span
            className="teacher-breadcrumb-item"
            onClick={() => navigate(`/teacher/courses/${courseId}`)}
          >
            Chi tiết khóa học
          </span>

          <i className="bi bi-chevron-right teacher-breadcrumb-separator"></i>

          <span className="teacher-breadcrumb-item active">
            Bài học
          </span>
        </nav>
      </div>

      <div className="lesson-content-card">
        <ul className="nav lesson-detail-tabs">
          <li className="nav-item">
            <button
              type="button"
              className={
                activeTab === "overview" ? "nav-link active" : "nav-link"
              }
              onClick={() => setActiveTab("overview")}
            >
              <i className="bi bi-info-circle me-1"></i>
              Tổng quan
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className={
                activeTab === "videos" ? "nav-link active" : "nav-link"
              }
              onClick={() => setActiveTab("videos")}
            >
              <i className="bi bi-play-circle me-1"></i>
              Video
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className={
                activeTab === "vocabularies" ? "nav-link active" : "nav-link"
              }
              onClick={() => setActiveTab("vocabularies")}
            >
              <i className="bi bi-card-text me-1"></i>
              Từ vựng
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className={
                activeTab === "grammars" ? "nav-link active" : "nav-link"
              }
              onClick={() => setActiveTab("grammars")}
            >
              <i className="bi bi-journal-text me-1"></i>
              Ngữ pháp
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className={
                activeTab === "practice" ? "nav-link active" : "nav-link"
              }
              onClick={() => setActiveTab("practice")}
            >
              <i className="bi bi-check2-circle me-1"></i>
              Ôn tập
            </button>
          </li>
        </ul>

        {activeTab === "overview" && (
          <div className="lesson-overview-box">
            <div className="lesson-overview-title">
              <h5>Thông tin bài học</h5>

              <span className={getStatusBadge(lesson.status)}>
                {lesson.status || "--"}
              </span>
            </div>

            <div className="lesson-overview-info">
              <div className="lesson-overview-row">
                <span>Tên bài học</span>
                <strong>{lesson.title || "--"}</strong>
              </div>

              <div className="lesson-overview-row">
                <span>Trạng thái</span>
                <strong>
                  <span className={getStatusBadge(lesson.status)}>
                    {lesson.status || "--"}
                  </span>
                </strong>
              </div>

              <div className="lesson-overview-row lesson-overview-row-full">
                <span>Mô tả</span>
                <p>{lesson.description || "Chưa có mô tả."}</p>
              </div>
            </div>

            <div className="lesson-overview-actions">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleEdit}
              >
                <i className="bi bi-pencil-square me-1"></i>
                Sửa bài học
              </button>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-1"></i>
                    Xóa bài học
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "videos" && (
          <div className="lesson-tab-panel">
            <TeacherLessonVideoList
              embedded={true}
              courseId={courseId}
              lessonId={lessonId}
            />
          </div>
        )}

        {activeTab === "vocabularies" && (
          <TeacherLessonVocabularyList
            embedded={true}
            courseId={courseId}
            lessonId={lessonId}
          />
        )}

        {activeTab === "grammars" && (
          <TeacherLessonGrammarList
            embedded={true}
            courseId={courseId}
            lessonId={lessonId}
          />
        )}

        {activeTab === "practice" && (
          <TeacherLessonPracticeOverview
            embedded={true}
            courseId={courseId}
            lessonId={lessonId}
          />
        )}
      </div>
    </div>
  );
}

export default TeacherLessonDetail;