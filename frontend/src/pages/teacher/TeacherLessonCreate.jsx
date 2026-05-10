import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherLessonCreate.css";

function TeacherLessonCreate() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [course, setCourse] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Draft");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourseInfo();
  }, [courseId]);

  const loadCourseInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      /*
        API gợi ý:
        GET http://localhost:8080/khoa-hoc/chi-tiet-khoa-hoc-teacher/{courseId}
      */

      const response = await fetch(
        `${API_BASE}/khoa-hoc/chi-tiet-khoa-hoc-teacher/${courseId}`,
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
        setError(data?.message || "Không thể tải thông tin khóa học");
        return;
      }

      const courseData = data.result || data.data || data;

      setCourse({
        courseId: courseData.courseId,
        title: courseData.title,
        status: courseData.status,
      });
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      return "Vui lòng nhập tên bài học";
    }

    if (title.trim().length > 255) {
      return "Tên bài học không được vượt quá 255 ký tự";
    }

    if (description.trim().length > 2000) {
      return "Mô tả bài học không được vượt quá 2000 ký tự";
    }

    if (!status) {
      return "Vui lòng chọn trạng thái bài học";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const validateMessage = validateForm();

    if (validateMessage) {
      setError(validateMessage);
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const requestData = {
        courseId: courseId,
        title: title.trim(),
        description: description.trim(),
        status: status,
      };

      
      const response = await fetch(
        `${API_BASE}/lesson/them-lesson`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(requestData),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Tạo bài học thất bại");
        return;
      }

      alert("Tạo bài học thành công");

      if (data?.lessonId) {
        navigate(`/teacher/courses/${courseId}/lessons/${data.lessonId}`);
      } else {
        navigate(`/teacher/courses/${courseId}/lessons`);
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setStatus("Draft");
    setError("");
  };

  if (loading) {
    return (
      <div className="lesson-create-page">
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải thông tin khóa học...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-create-page">
      <div className="lesson-create-heading">
        <div>
          <button
            type="button"
            className="lesson-create-back"
            onClick={() => navigate(`/teacher/courses/${courseId}/lessons`)}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại danh sách bài học
          </button>

          <h2>Thêm bài học mới</h2>

          <p>
            Thiết lập thông tin cơ bản cho bài học mới trong khóa học. Sau khi
            tạo lesson, giáo viên có thể tiếp tục thêm video, từ vựng, ngữ pháp
            và bài ôn tập.
          </p>

          {course && (
            <div className="course-info-pill">
              <i className="bi bi-journal-bookmark"></i>
              <span>{course.title}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm lesson-create-card">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-list-task text-primary me-2"></i>
                  Thông tin bài học
                </h5>

                <small className="text-muted">
                  Các trường có dấu <span className="text-danger">*</span> là
                  bắt buộc
                </small>
              </div>

              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Tên bài học <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-file-earmark-text"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tiêu đề bài học"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <small className="text-muted">
                    Ví dụ: Present Simple, Daily Activities, Shopping
                    Conversation...
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Mô tả bài học
                  </label>

                  <textarea
                    className="form-control lesson-description-input"
                    rows="8"
                    placeholder="Nhập mô tả ngắn hoặc nội dung giới thiệu bài học..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>

                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Mô tả này giúp giáo viên và học viên hiểu mục tiêu của bài
                      học.
                    </small>

                    <small className="text-muted">
                      {description.length}/2000
                    </small>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Trạng thái bài học
                    </label>

                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Hidden">Hidden</option>
                    </select>

                    <small className="text-muted">
                      Nên để Draft cho đến khi hoàn thiện nội dung bài học.
                    </small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Thứ tự bài học
                    </label>

                    <div className="auto-order-box">
                      <div>
                        <strong>Tự động</strong>
                        <span>Hệ thống sẽ xếp bài học ở cuối danh sách.</span>
                      </div>

                      <i className="bi bi-sort-numeric-down text-primary"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lesson-action-bar mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-square me-1"></i>
                    Tạo bài học
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
                disabled={saving}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Làm mới
              </button>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => navigate(`/teacher/courses/${courseId}/lessons`)}
                disabled={saving}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Quay lại
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm lesson-create-card sticky-preview">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-eye text-primary me-2"></i>
                  Xem trước bài học
                </h5>

                <small className="text-muted">
                  Thông tin sẽ được lưu vào bài học mới
                </small>
              </div>

              <div className="card-body">
                <div className="lesson-preview-box">
                  <div className="preview-icon">
                    <i className="bi bi-file-earmark-text"></i>
                  </div>

                  <h6>{title || "Tên bài học chưa nhập"}</h6>

                  <p>
                    {description
                      ? description.slice(0, 160) +
                        (description.length > 160 ? "..." : "")
                      : "Chưa có mô tả bài học."}
                  </p>

                  <span
                    className={
                      status === "Published"
                        ? "badge rounded-pill text-bg-success"
                        : status === "Hidden"
                        ? "badge rounded-pill text-bg-danger"
                        : "badge rounded-pill text-bg-secondary"
                    }
                  >
                    {status}
                  </span>
                </div>

                <hr />

                <div className="preview-summary">
                  <h6 className="fw-bold">Thông tin sau khi tạo</h6>

                  <div className="summary-item">
                    <span>Khóa học</span>
                    <strong>{course?.title || "Đang tải..."}</strong>
                  </div>

                  <div className="summary-item">
                    <span>Tên bài học</span>
                    <strong>{title || "Chưa nhập"}</strong>
                  </div>

                  <div className="summary-item">
                    <span>Thứ tự</span>
                    <strong>Tự động</strong>
                  </div>

                  <div className="summary-item">
                    <span>Trạng thái</span>
                    <span className="badge text-bg-secondary">{status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-3">
              <strong>Gợi ý:</strong> Sau khi tạo bài học, bạn nên thêm video,
              từ vựng, ngữ pháp và câu hỏi ôn tập để lesson hoàn chỉnh hơn.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeacherLessonCreate;