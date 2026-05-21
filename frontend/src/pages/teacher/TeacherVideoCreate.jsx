import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFileUrl } from "../../utils/fileurl";
import "./TeacherVideoCreate.css";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherLessonTrail } from "../../utils/breadcrumbPaths";

function TeacherVideoCreate() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewName, setVideoPreviewName] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");

  const [durationSeconds, setDurationSeconds] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!title.trim()) {
      return "Vui lòng nhập tiêu đề video";
    }

    if (title.trim().length > 255) {
      return "Tiêu đề video không được vượt quá 255 ký tự";
    }

    if (!videoFile) {
      return "Vui lòng chọn file video";
    }

    if (!status) {
      return "Vui lòng chọn trạng thái video";
    }

    if (!["DRAFT", "PUBLISHED", "HIDDEN"].includes(status)) {
      return "Trạng thái video không hợp lệ";
    }

    return "";
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-matroska",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("File video chỉ hỗ trợ MP4, WEBM, MOV hoặc MKV");
      return;
    }

    setError("");
    setVideoFile(file);
    setVideoPreviewName(file.name);

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);

      if (video.duration && !Number.isNaN(video.duration)) {
        setDurationSeconds(Math.round(video.duration));
      }
    };

    video.src = URL.createObjectURL(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh thumbnail");
      return;
    }

    setError("");
    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
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

      const videoData = {
        title: title.trim(),
        status,
        durationSeconds: durationSeconds ? Number(durationSeconds) : null,
      };

      const formData = new FormData();

      formData.append(
        "data",
        new Blob([JSON.stringify(videoData)], {
          type: "application/json",
        })
      );

      formData.append("videoFile", videoFile);

      if (thumbnailFile) {
        formData.append("thumbnailFile", thumbnailFile);
      }

      const response = await fetch(`${API_BASE}/video/${lessonId}/lessons`, {
        method: "POST",
        headers: {
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
        setError(data?.message || "Đăng video thất bại");
        return;
      }

      alert("Đăng video thành công");

      navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`);
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setStatus("DRAFT");

    setVideoFile(null);
    setVideoPreviewName("");

    setThumbnailFile(null);
    setThumbnailPreviewUrl("");

    setDurationSeconds("");

    setError("");
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Chưa xác định";

    const total = Number(seconds);
    const minutes = Math.floor(total / 60);
    const remainSeconds = total % 60;

    return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="video-create-page">
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

          <span
            className="teacher-breadcrumb-item"
            onClick={() => navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)}
          >
            Bài học
          </span>

          <i className="bi bi-chevron-right teacher-breadcrumb-separator"></i>

          <span className="teacher-breadcrumb-item active">
            Video
          </span>
        </nav>
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
            <div className="card border-0 shadow-sm video-card">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-camera-video text-primary me-2"></i>
                  Thông tin video
                </h5>

                <small className="text-muted">
                  Các trường có dấu <span className="text-danger">*</span> là
                  bắt buộc
                </small>
              </div>

              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Tiêu đề video <span className="text-danger">*</span>
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tiêu đề video"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    File video <span className="text-danger">*</span>
                  </label>

                  <label className="video-upload-box">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                      hidden
                      onChange={handleVideoChange}
                    />

                    <div className="upload-placeholder">
                      <i className="bi bi-file-earmark-play"></i>
                      <strong>Kéo thả file video hoặc click để tải lên</strong>
                      <span>Hỗ trợ MP4, WEBM, MOV, MKV</span>

                      {videoPreviewName && (
                        <em>Đã chọn: {videoPreviewName}</em>
                      )}
                    </div>
                  </label>

                  {videoFile && (
                    <div className="selected-file mt-3">
                      <div>
                        <strong>{videoFile.name}</strong>
                        <span>
                          {(videoFile.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                          {formatDuration(durationSeconds)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreviewName("");
                          setDurationSeconds("");
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Trạng thái video <span className="text-danger">*</span>
                    </label>

                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="HIDDEN">Hidden</option>
                    </select>

                    <small className="text-muted">
                      Nên để Draft cho đến khi kiểm tra nội dung hoàn tất.
                    </small>
                  </div>


                </div>
              </div>
            </div>

            <div className="video-action-bar mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i>
                    Lưu video
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
                onClick={() =>
                  navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
                }
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm video-side-card mb-4">
              <div className="card-header bg-white border-0 pb-0">
                <h6 className="fw-bold mb-1">Ảnh thumbnail</h6>
                <small className="text-muted">
                  Ảnh đại diện hiển thị cho video
                </small>
              </div>

              <div className="card-body">
                <div className="thumbnail-preview">
                  {thumbnailPreviewUrl ? (
                    <img src={thumbnailPreviewUrl} alt="Thumbnail preview" />
                  ) : (
                    <div>
                      <i className="bi bi-image"></i>
                      <span>Chưa có thumbnail</span>
                    </div>
                  )}
                </div>

                <label className="thumbnail-upload-btn mt-3">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleThumbnailChange}
                  />

                  <i className="bi bi-image me-2"></i>
                  Chọn ảnh thumbnail
                </label>

                <small className="text-muted d-block mt-2">
                  Hỗ trợ JPG, PNG, JPEG. Tỷ lệ khuyến nghị 16:9.
                </small>

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
                        setThumbnailPreviewUrl("");
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </form>
    </div>
  );
}

export default TeacherVideoCreate;
