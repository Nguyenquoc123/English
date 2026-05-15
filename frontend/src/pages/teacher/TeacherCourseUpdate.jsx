import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JoditEditor from "jodit-react";
import "./TeacherCourseUpdate.css";
import { getFileUrl } from "../../utils/fileurl";

function TeacherCourseUpdate() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const editor = useRef(null);

  const API_BASE = "http://localhost:8080";

  const [levels, setLevels] = useState([]);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [levelId, setLevelId] = useState("");

  const [accessType, setAccessType] = useState("FREE");
  const [price, setPrice] = useState(0);
  const [examPrice, setExamPrice] = useState(0);

  const [oldThumbnailUrl, setOldThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [courseStatus, setCourseStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [levelLoading, setLevelLoading] = useState(false);
  const [error, setError] = useState("");

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 320,
      placeholder: "Nhập mô tả chi tiết khóa học...",
      language: "vi",
      toolbarAdaptive: false,
      toolbarSticky: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "brush",
        "|",
        "paragraph",
        "align",
        "|",
        "link",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "source",
      ],
      removeButtons: ["image", "video", "file"],
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",
    }),
    []
  );

  useEffect(() => {
    loadLevels();
    loadCourseDetail();
  }, [courseId]);

  const loadLevels = async () => {
    try {
      setLevelLoading(true);

      const response = await fetch(`${API_BASE}/level/all-level`);
      const data = await response.json();

      if (!response.ok) {
        setError("Không thể tải danh sách cấp độ");
        return;
      }

      const levelList = data.result || data.data || data;

      const normalizedLevels = levelList.map((level) => ({
        levelId: level.levelId ?? level.levelid,
        levelName: level.levelName ?? level.levelname,
      }));

      setLevels(normalizedLevels);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối cơ sở dữ liệu");
    } finally {
      setLevelLoading(false);
    }
  };

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/khoa-hoc/chi-tiet-khoa-hoc-teacher/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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
      fillForm(courseData);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const fillForm = (course) => {
    const currentLevelId =
      course.levelId ??
      course.levelid ??
      course.level?.levelId ??
      course.level?.levelid ??
      "";

    setTitle(course.title || "");
    setShortDescription(course.shortDescription || "");
    setDescription(course.description || "");
    setLevelId(currentLevelId !== "" ? String(currentLevelId) : "");

    setAccessType(course.accessType || course.courseType || "FREE");

    setPrice(course.price || 0);
    setExamPrice(course.examPrice || 0);

    setOldThumbnailUrl(course.thumbnailUrl || "");
    setPreviewImage(getFileUrl(course.thumbnailUrl) || "");

    setCourseStatus(course.status || "");
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    setError("");
    setThumbnailFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const removeHtmlTags = (html) => {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();
  };

  const validateForm = () => {
    if (!title.trim()) {
      return "Vui lòng nhập tên khóa học";
    }

    if (title.trim().length > 255) {
      return "Tên khóa học không được vượt quá 255 ký tự";
    }

    if (!shortDescription.trim()) {
      return "Vui lòng nhập mô tả ngắn khóa học";
    }

    if (shortDescription.trim().length > 500) {
      return "Mô tả ngắn không được vượt quá 500 ký tự";
    }

    if (!removeHtmlTags(description)) {
      return "Vui lòng nhập mô tả chi tiết khóa học";
    }

    if (!levelId) {
      return "Vui lòng chọn cấp độ";
    }

    if (accessType === "PAID" && Number(price) <= 0) {
      return "Khóa học có phí phải nhập giá khóa học lớn hơn 0";
    }

    if (accessType === "FREE" && Number(examPrice) < 0) {
      return "Giá quyền thi không được âm";
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

      const courseData = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),

        // Jodit lưu HTML
        description: description.trim(),

        levelId: Number(levelId),

        // Nếu backend của bạn dùng courseType thì đổi accessType thành courseType
        accessType: accessType,

        price: accessType === "PAID" ? Number(price) : 0,

        examPrice: accessType === "FREE" ? Number(examPrice) : 0,
      };

      const formData = new FormData();

      formData.append(
        "data",
        new Blob([JSON.stringify(courseData)], {
          type: "application/json",
        })
      );

      if (thumbnailFile) {
        formData.append("thumbnailFile", thumbnailFile);
      }

      const response = await fetch(`${API_BASE}/teacher/khoa-hoc/${courseId}`, {
        method: "PUT",
        headers: {
          // Không set Content-Type khi dùng FormData
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Cập nhật khóa học thất bại");
        return;
      }

      alert("Cập nhật khóa học thành công");

      navigate(`/teacher/courses/${courseId}`);
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleResetImage = () => {
    setThumbnailFile(null);
    setPreviewImage(getFileUrl(oldThumbnailUrl) || "");
  };

  const selectedLevelName =
    levels.find((level) => String(level.levelId) === String(levelId))
      ?.levelName || "Chưa chọn";

  if (loading) {
    return (
      <div className="update-course-page">
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải thông tin khóa học...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="update-course-page">
      <div className="update-page-heading">
        <div>
          <button
            type="button"
            className="update-back-link"
            onClick={() => navigate(`/teacher/courses/${courseId}`)}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại chi tiết
          </button>

          <h2>Cập nhật khóa học</h2>

          <p>
            Chỉnh sửa thông tin cơ bản của khóa học. Nếu khóa học đã Published,
            sau khi chỉnh sửa bạn có thể cần gửi lại để admin duyệt tùy theo
            quy trình hệ thống.
          </p>
        </div>

        <div>
          {courseStatus && (
            <span className="badge rounded-pill text-bg-secondary px-3 py-2">
              {courseStatus}
            </span>
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
            <div className="card border-0 shadow-sm update-card">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-pencil-square text-primary me-2"></i>
                  Thông tin khóa học
                </h5>

                <small className="text-muted">
                  Các trường có dấu <span className="text-danger">*</span> là
                  bắt buộc
                </small>
              </div>

              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Tên khóa học <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-type"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Ngữ pháp tiếng Anh nền tảng"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Mô tả ngắn <span className="text-danger">*</span>
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    maxLength="500"
                    placeholder="Mô tả ngắn dùng để hiển thị ở card danh sách khóa học..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                  ></textarea>

                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Dùng cho card danh sách khóa học.
                    </small>

                    <small className="text-muted">
                      {shortDescription.length}/500
                    </small>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Mô tả chi tiết khóa học{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <div className="jodit-wrapper">
                    <JoditEditor
                      ref={editor}
                      value={description}
                      config={editorConfig}
                      tabIndex={1}
                      onBlur={(newContent) => setDescription(newContent)}
                      onChange={() => {}}
                    />
                  </div>

                  <small className="text-muted">
                    Nội dung này sẽ được lưu dạng HTML và hiển thị ở trang chi
                    tiết khóa học.
                  </small>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Cấp độ <span className="text-danger">*</span>
                    </label>

                    <select
                      className="form-select"
                      value={String(levelId)}
                      onChange={(e) => setLevelId(e.target.value)}
                      disabled={levelLoading}
                    >
                      <option value="">
                        {levelLoading ? "Đang tải..." : "Chọn cấp độ"}
                      </option>

                      {levels.map((level) => (
                        <option
                          key={level.levelId}
                          value={String(level.levelId)}
                        >
                          {level.levelName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Loại khóa học
                    </label>

                    <div className="course-type-group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="accessType"
                        id="freeCourseUpdate"
                        checked={accessType === "FREE"}
                        onChange={() => {
                          setAccessType("FREE");
                          setPrice(0);
                        }}
                      />
                      <label
                        className="btn btn-outline-success"
                        htmlFor="freeCourseUpdate"
                      >
                        <i className="bi bi-gift me-1"></i>
                        Free
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="accessType"
                        id="paidCourseUpdate"
                        checked={accessType === "PAID"}
                        onChange={() => {
                          setAccessType("PAID");
                          setExamPrice(0);
                        }}
                      />
                      <label
                        className="btn btn-outline-primary"
                        htmlFor="paidCourseUpdate"
                      >
                        <i className="bi bi-credit-card me-1"></i>
                        Paid
                      </label>
                    </div>
                  </div>

                  {accessType === "PAID" && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Giá khóa học <span className="text-danger">*</span>
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-tag"></i>
                        </span>

                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="1000"
                          placeholder="Nhập giá khóa học"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />

                        <span className="input-group-text bg-light">VNĐ</span>
                      </div>

                      <small className="text-muted">
                        Học viên cần mua khóa học để học toàn bộ nội dung.
                      </small>
                    </div>
                  )}

                  {accessType === "FREE" && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Giá quyền thi
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-patch-check"></i>
                        </span>

                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="1000"
                          placeholder="Nhập giá quyền thi"
                          value={examPrice}
                          onChange={(e) => setExamPrice(e.target.value)}
                        />

                        <span className="input-group-text bg-light">VNĐ</span>
                      </div>

                      <small className="text-muted">
                        Nếu phần thi miễn phí, nhập 0.
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="action-bar mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang cập nhật...
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
                onClick={loadCourseDetail}
                disabled={saving}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Tải lại dữ liệu
              </button>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => navigate(`/teacher/courses/${courseId}`)}
                disabled={saving}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Quay lại
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm update-card sticky-preview">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-image text-primary me-2"></i>
                  Ảnh đại diện khóa học
                </h5>

                <small className="text-muted">
                  Chọn ảnh mới nếu muốn thay đổi ảnh hiện tại
                </small>
              </div>

              <div className="card-body">
                <label className="upload-box">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <i className="bi bi-cloud-arrow-up"></i>
                      <strong>Tải ảnh lên</strong>
                      <span>PNG, JPG, JPEG, WEBP</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    hidden
                  />
                </label>

                {thumbnailFile && (
                  <div className="selected-file mt-3">
                    <div>
                      <strong>{thumbnailFile.name}</strong>
                      <span>
                        {(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleResetImage}
                    >
                      Hủy ảnh mới
                    </button>
                  </div>
                )}

                {!thumbnailFile && oldThumbnailUrl && (
                  <div className="alert alert-light border mt-3 mb-0 small">
                    Đang dùng ảnh hiện tại. Nếu không chọn ảnh mới, hệ thống sẽ
                    giữ nguyên ảnh này.
                  </div>
                )}

                <hr />

                <div className="preview-summary">
                  <h6 className="fw-bold">Xem trước thông tin</h6>

                  <div className="summary-item">
                    <span>Tên khóa học</span>
                    <strong>{title || "Chưa nhập"}</strong>
                  </div>

                  <div className="summary-item">
                    <span>Mô tả ngắn</span>
                    <strong>
                      {shortDescription
                        ? shortDescription.slice(0, 80) +
                          (shortDescription.length > 80 ? "..." : "")
                        : "Chưa nhập"}
                    </strong>
                  </div>

                  <div className="summary-item">
                    <span>Cấp độ</span>
                    <strong>{selectedLevelName}</strong>
                  </div>

                  <div className="summary-item">
                    <span>Loại khóa học</span>
                    <strong>{accessType}</strong>
                  </div>

                  {accessType === "PAID" && (
                    <div className="summary-item">
                      <span>Giá khóa học</span>
                      <strong>
                        {Number(price || 0).toLocaleString("vi-VN")} VNĐ
                      </strong>
                    </div>
                  )}

                  {accessType === "FREE" && (
                    <div className="summary-item">
                      <span>Giá quyền thi</span>
                      <strong>
                        {Number(examPrice || 0).toLocaleString("vi-VN")} VNĐ
                      </strong>
                    </div>
                  )}

                  <div className="summary-item">
                    <span>Trạng thái hiện tại</span>
                    <span className="badge text-bg-secondary">
                      {courseStatus || "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-warning mt-3">
              <strong>Lưu ý:</strong> Nếu khóa học đã gửi duyệt hoặc đã xuất
              bản, bạn nên cân nhắc việc chỉnh sửa nội dung vì có thể cần admin
              duyệt lại.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeacherCourseUpdate;