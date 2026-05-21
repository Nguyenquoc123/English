import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherLessonCreate.css";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherLessonListTrail } from "../../utils/breadcrumbPaths";

function TeacherLessonCreate() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [course, setCourse] = useState(null);

  const [createType, setCreateType] = useState("LESSON");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const [durationMinutes, setDurationMinutes] = useState("");

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
    if (!createType) {
      return "Vui lòng chọn loại nội dung cần tạo";
    }

    if (!title.trim()) {
      return createType === "LESSON"
        ? "Vui lòng nhập tên bài học"
        : "Vui lòng nhập tên bài thi";
    }

    if (title.trim().length > 255) {
      return createType === "LESSON"
        ? "Tên bài học không được vượt quá 255 ký tự"
        : "Tên bài thi không được vượt quá 255 ký tự";
    }

    if (description.trim().length > 2000) {
      return "Mô tả không được vượt quá 2000 ký tự";
    }

    if (!status) {
      return "Vui lòng chọn trạng thái";
    }

    if (createType === "EXAM") {
      if (!durationMinutes) {
        return "Vui lòng nhập thời lượng bài thi";
      }

      if (Number(durationMinutes) <= 0) {
        return "Thời lượng bài thi phải lớn hơn 0 phút";
      }
    }

    return "";
  };

  const buildRequestData = () => {
    const commonData = {
      courseId: Number(courseId),
      title: title.trim(),
      description: description.trim(),
      status: status,
    };

    if (createType === "LESSON") {
      return commonData;
    }

    return {
      ...commonData,
      durationMinutes: Number(durationMinutes),
    };
  };

  const getApiUrl = () => {
    if (createType === "LESSON") {
      return `${API_BASE}/lesson/them-lesson`;
    }

    return `${API_BASE}/exams/create`;
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
      const requestData = buildRequestData();

      const response = await fetch(getApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestData),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(
          data?.message ||
            (createType === "LESSON"
              ? "Tạo bài học thất bại"
              : "Tạo bài thi thất bại")
        );
        return;
      }

      alert(
        createType === "LESSON"
          ? "Tạo bài học thành công"
          : "Tạo bài thi thành công"
      );

      navigate(`/teacher/courses/${courseId}/lessons`);
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCreateType("LESSON");
    setTitle("");
    setDescription("");
    setStatus("DRAFT");
    setDurationMinutes("");
    setError("");
  };

  const handleCreateTypeChange = (e) => {
    const selectedType = e.target.value;

    setCreateType(selectedType);
    setTitle("");
    setDescription("");
    setError("");

    if (selectedType === "LESSON") {
      setStatus("DRAFT");
      setDurationMinutes("");
    } else {
      setStatus("DRAFT");
    }
  };

  const getTitleLabel = () => {
    return createType === "LESSON" ? "Tên bài học" : "Tên bài thi";
  };

  const getDescriptionLabel = () => {
    return createType === "LESSON" ? "Mô tả bài học" : "Mô tả bài thi";
  };

  const getPlaceholder = () => {
    return createType === "LESSON"
      ? "Nhập tiêu đề bài học"
      : "Nhập tiêu đề bài thi";
  };

  const getPreviewIcon = () => {
    return createType === "LESSON"
      ? "bi bi-file-earmark-text"
      : "bi bi-clipboard-check";
  };

  const getStatusBadgeClass = () => {
    if (status === "PUBLISHED") {
      return "badge rounded-pill text-bg-success";
    }

    if (status === "HIDDEN") {
      return "badge rounded-pill text-bg-danger";
    }

    return "badge rounded-pill text-bg-secondary";
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
          <CourseBreadcrumb
            items={teacherLessonListTrail(courseId, "Thêm bài học")}
          />

          <h2>Thêm nội dung mới</h2>

          <p>
            Chọn loại nội dung muốn tạo cho khóa học. Nếu chọn bài học, hệ thống
            sẽ gọi API thêm lesson. Nếu chọn bài thi, hệ thống sẽ gọi API thêm
            exam.
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
                  Thông tin nội dung
                </h5>

                <small className="text-muted">
                  Các trường có dấu <span className="text-danger">*</span> là
                  bắt buộc
                </small>
              </div>

              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Loại nội dung <span className="text-danger">*</span>
                  </label>

                  <select
                    className="form-select"
                    value={createType}
                    onChange={handleCreateTypeChange}
                  >
                    <option value="LESSON">Bài học</option>
                    <option value="EXAM">Bài thi</option>
                  </select>

                  <small className="text-muted">
                    Bài học và bài thi sẽ được tạo bằng 2 API khác nhau.
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    {getTitleLabel()} <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className={getPreviewIcon()}></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder={getPlaceholder()}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <small className="text-muted">
                    {createType === "LESSON"
                      ? "Ví dụ: Present Simple, Daily Activities, Shopping Conversation..."
                      : "Ví dụ: Final Test Unit 1, Bài kiểm tra giữa khóa, Bài thi tổng kết..."}
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    {getDescriptionLabel()}
                  </label>

                  <textarea
                    className="form-control lesson-description-input"
                    rows="8"
                    placeholder={
                      createType === "LESSON"
                        ? "Nhập mô tả ngắn hoặc nội dung giới thiệu bài học..."
                        : "Nhập mô tả, yêu cầu hoặc hướng dẫn làm bài thi..."
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>

                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      {createType === "LESSON"
                        ? "Mô tả này giúp học viên hiểu mục tiêu của bài học."
                        : "Mô tả này giúp học viên hiểu quy định và mục tiêu bài thi."}
                    </small>

                    <small className="text-muted">
                      {description.length}/2000
                    </small>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Trạng thái
                    </label>

                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {createType === "LESSON" ? (
                        <>
                          <option value="Draft">Draft</option>
                          <option value="Published">Published</option>
                          <option value="Hidden">Hidden</option>
                        </>
                      ) : (
                        <>
                          <option value="Draft">Draft</option>
                          <option value="Published">Published</option>
                          <option value="Hidden">Hidden</option>
                        </>
                      )}
                    </select>

                    <small className="text-muted">
                      {createType === "LESSON"
                        ? "Nên để Draft cho đến khi hoàn thiện nội dung bài học."
                        : "Nên để Draft cho đến khi hoàn thiện câu hỏi bài thi."}
                    </small>
                  </div>

                  {createType === "EXAM" && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Thời lượng bài thi{" "}
                        <span className="text-danger">*</span>
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-clock"></i>
                        </span>

                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          step="1"
                          placeholder="Nhập số phút"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(e.target.value)}
                        />

                        <span className="input-group-text bg-light">phút</span>
                      </div>

                      <small className="text-muted">
                        Ví dụ: 15, 30, 45 hoặc 60 phút.
                      </small>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Thứ tự trong khóa học
                    </label>

                    <div className="auto-order-box">
                      <div>
                        <strong>Tự động</strong>
                        <span>
                          Hệ thống sẽ xếp nội dung này ở cuối lộ trình.
                        </span>
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
                    {createType === "LESSON" ? "Tạo bài học" : "Tạo bài thi"}
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
                Hủy
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm lesson-create-card sticky-preview">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-eye text-primary me-2"></i>
                  Xem trước nội dung
                </h5>

                <small className="text-muted">
                  Thông tin sẽ được lưu vào khóa học
                </small>
              </div>

              <div className="card-body">
                <div className="lesson-preview-box">
                  <div className="preview-icon">
                    <i className={getPreviewIcon()}></i>
                  </div>

                  <h6>
                    {title ||
                      (createType === "LESSON"
                        ? "Tên bài học chưa nhập"
                        : "Tên bài thi chưa nhập")}
                  </h6>

                  <p>
                    {description
                      ? description.slice(0, 160) +
                        (description.length > 160 ? "..." : "")
                      : createType === "LESSON"
                      ? "Chưa có mô tả bài học."
                      : "Chưa có mô tả bài thi."}
                  </p>

                  <span className={getStatusBadgeClass()}>{status}</span>
                </div>

                <hr />

                <div className="preview-summary">
                  <h6 className="fw-bold">Thông tin sau khi tạo</h6>

                  <div className="summary-item">
                    <span>Khóa học</span>
                    <strong>{course?.title || "Đang tải..."}</strong>
                  </div>

                  <div className="summary-item">
                    <span>Loại nội dung</span>
                    <strong>
                      {createType === "LESSON" ? "Bài học" : "Bài thi"}
                    </strong>
                  </div>

                  <div className="summary-item">
                    <span>Tiêu đề</span>
                    <strong>{title || "Chưa nhập"}</strong>
                  </div>

                  {createType === "EXAM" && (
                    <div className="summary-item">
                      <span>Thời lượng</span>
                      <strong>
                        {durationMinutes ? `${durationMinutes} phút` : "Chưa nhập"}
                      </strong>
                    </div>
                  )}

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
              <strong>Gợi ý:</strong>{" "}
              {createType === "LESSON"
                ? "Sau khi tạo bài học, bạn nên thêm video, từ vựng, ngữ pháp và câu hỏi ôn tập."
                : "Sau khi tạo bài thi, bạn cần thêm câu hỏi vào bài thi trước khi mở cho học viên làm."}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeacherLessonCreate;
