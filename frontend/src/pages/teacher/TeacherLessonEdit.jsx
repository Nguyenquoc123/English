import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherLessonCreate.css";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherLessonListTrail } from "../../utils/breadcrumbPaths";

function TeacherLessonEdit() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Draft");
  const [isFreePreview, setIsFreePreview] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLessonInfo();
  }, [courseId, lessonId]);

  const getToken = () => localStorage.getItem("token");

  const parseJsonSafely = async (response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const loadLessonInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE}/lesson/teacher/lessons/${lessonId}`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        setError(data?.message || "Không thể tải thông tin bài học");
        return;
      }
      console.log(data)

      const lessonData = data?.result || data?.data || data;

      setTitle(lessonData.title || "");
      setDescription(lessonData.description || "");
      setStatus(lessonData.status || "Draft");
      setIsFreePreview(Boolean(lessonData.isPreviewFree));
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
      return "Mô tả không được vượt quá 2000 ký tự";
    }

    if (!status) {
      return "Vui lòng chọn trạng thái";
    }

    return "";
  };

  const buildRequestData = () => {
    return {
      lessonId: Number(lessonId),
      title: title.trim(),
      description: description.trim(),
      status: status,
      isFreePreview: isFreePreview,
    };
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

      const token = getToken();
      console.log(buildRequestData())
      const response = await fetch(`${API_BASE}/lesson/update-lesson`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(buildRequestData()),
      });

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        setError(data?.message || "Cập nhật bài học thất bại");
        return;
      }
      console.log(data)
      alert("Cập nhật bài học thành công");
      navigate(`/teacher/courses/${courseId}/lessons`);
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadLessonInfo();
  };

  if (loading) {
    return (
      <div className="container lesson-create-page">
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải thông tin bài học...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container lesson-create-page">
      <CourseBreadcrumb
        items={teacherLessonListTrail(courseId, "Chỉnh sửa bài học")}
      />



      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card border-0 shadow-sm lesson-create-card">
          <div className="card-header bg-white border-0 pb-0">
            <h5 className="fw-bold mb-1">
              <i className="bi bi-pencil-square text-primary me-2"></i>
              Thông tin bài học
            </h5>

            <small className="text-muted">
              Các trường có dấu <span className="text-danger">*</span> là bắt
              buộc
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
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Mô tả bài học</label>

              <textarea
                className="form-control lesson-description-input"
                rows="8"
                placeholder="Nhập mô tả ngắn hoặc nội dung giới thiệu bài học..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>

              <div className="d-flex justify-content-end mt-1">
                <small className="text-muted">{description.length}/2000</small>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Trạng thái</label>

              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>

            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isFreePreview"
                  checked={isFreePreview}
                  onChange={(e) => setIsFreePreview(e.target.checked)}
                />

                <label className="form-check-label fw-semibold" htmlFor="isFreePreview">
                  Cho học thử miễn phí
                </label>
              </div>

              <small className="text-muted">
                Nếu bật, học viên chưa mua khóa học vẫn có thể xem bài học này.
              </small>
            </div>
          </div>
        </div>

        <div className="lesson-action-bar mt-4">
          <button type="submit" className="btn btn-primary px-4" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="bi bi-save me-1"></i>
                Lưu thay đổi
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
            Khôi phục
          </button>

          <button
            type="button"
            className="btn btn-light"
            onClick={() => navigate(`/teacher/courses/${courseId}/lessons`)}
            disabled={saving}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default TeacherLessonEdit;