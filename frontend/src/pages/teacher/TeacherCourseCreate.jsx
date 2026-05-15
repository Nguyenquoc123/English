import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import "./TeacherCourseCreate.css";

function TeacherCourseCreate() {
  const navigate = useNavigate();
  const editor = useRef(null);

  const API_BASE = "http://localhost:8080";

  const [levels, setLevels] = useState([]);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [levelId, setLevelId] = useState("");

  const [accessType, setAccessType] = useState("FREE");

  // PAID thì dùng price
  const [price, setPrice] = useState(0);

  // FREE thì dùng examPrice
  const [examPrice, setExamPrice] = useState(0);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [levelLoading, setLevelLoading] = useState(false);
  const [error, setError] = useState("");

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 320,
      placeholder:
        "Nhập mô tả chi tiết khóa học, nội dung chính, đối tượng học phù hợp, kết quả học viên đạt được...",
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
  }, []);

  const loadLevels = async () => {
    try {
      setLevelLoading(true);
      setError("");

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
      setLoading(true);

      const token = localStorage.getItem("token");

      const courseData = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),

        // Jodit trả về HTML
        description: description.trim(),

        levelId: Number(levelId),

        // Bạn đang dùng courseType trong code hiện tại
        // Nếu backend của bạn dùng accessType thì đổi courseType thành accessType
        courseType: accessType,

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

      const response = await fetch(`${API_BASE}/khoa-hoc/tao-khoa-hoc`, {
        method: "POST",
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
        setError(data?.message || "Tạo khóa học thất bại");
        return;
      }

      alert("Tạo khóa học thành công");

      if (data?.courseId) {
        navigate(`/teacher/courses/${data.courseId}`);
      } else {
        navigate("/teacher/courses");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setShortDescription("");
    setDescription("");
    setLevelId("");
    setAccessType("FREE");
    setPrice(0);
    setExamPrice(0);
    setThumbnailFile(null);
    setPreviewImage("");
    setError("");
  };

  const selectedLevelName =
    levels.find((level) => String(level.levelId) === String(levelId))
      ?.levelName || "Chưa chọn";

  return (
    <div className="create-course-page">
      <div className="create-page-heading">
        <div>
          <button
            type="button"
            className="create-back-link"
            onClick={() => navigate("/teacher/courses")}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại danh sách
          </button>

          <h2>Tạo khóa học mới</h2>

          <p>
            Nhập thông tin cơ bản của khóa học. Sau khi tạo, khóa học sẽ ở trạng
            thái Draft để giáo viên tiếp tục thêm lesson, video, từ vựng, ngữ
            pháp, câu hỏi và bài thi.
          </p>
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
            <div className="card border-0 shadow-sm create-card">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-info-circle text-primary me-2"></i>
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
                      Nên viết 1-2 câu ngắn gọn, dễ hiểu.
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
                      value={levelId}
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
                        id="freeCourse"
                        checked={accessType === "FREE"}
                        onChange={() => {
                          setAccessType("FREE");
                          setPrice(0);
                        }}
                      />
                      <label
                        className="btn btn-outline-success"
                        htmlFor="freeCourse"
                      >
                        <i className="bi bi-gift me-1"></i>
                        Free
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="accessType"
                        id="paidCourse"
                        checked={accessType === "PAID"}
                        onChange={() => {
                          setAccessType("PAID");
                          setExamPrice(0);
                        }}
                      />
                      <label
                        className="btn btn-outline-primary"
                        htmlFor="paidCourse"
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-lg me-1"></i>
                    Tạo khóa học
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Làm mới
              </button>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => navigate("/teacher/courses")}
                disabled={loading}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Quay lại
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm create-card sticky-preview">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-image text-primary me-2"></i>
                  Ảnh đại diện khóa học
                </h5>

                <small className="text-muted">
                  Nên dùng ảnh ngang tỉ lệ 16:9
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
                      onClick={() => {
                        setThumbnailFile(null);
                        setPreviewImage("");
                      }}
                    >
                      Xóa
                    </button>
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
                    <span>Trạng thái sau khi tạo</span>
                    <span className="badge text-bg-secondary">Draft</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-3">
              <strong>Lưu ý:</strong> Sau khi tạo khóa học, bạn cần thêm lesson,
              video, từ vựng, ngữ pháp, câu hỏi ôn tập và bài thi trước khi gửi
              admin duyệt.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeacherCourseCreate;