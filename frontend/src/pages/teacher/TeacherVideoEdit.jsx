import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFileUrl } from "../../utils/fileurl";
import "./TeacherVideoCreate.css";

function TeacherVideoEdit() {
  const navigate = useNavigate();
  const { courseId, lessonId, videoId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const [materialFile, setMaterialFile] = useState(null);
  const [materialPreviewName, setMaterialPreviewName] = useState("");
  const [oldMaterialUrl, setOldMaterialUrl] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [oldThumbnailUrl, setOldThumbnailUrl] = useState("");

  const [durationSeconds, setDurationSeconds] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVideoInfo();
  }, [courseId, lessonId, videoId]);

  const getToken = () => localStorage.getItem("token");

  const parseJsonSafely = async (response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const loadVideoInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE}/video/${videoId}`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        setError(data?.message || "Không thể tải thông tin video");
        return;
      }


      const videoData = data?.result || data?.data || data;

      setTitle(videoData.title || "");
      setStatus(videoData.status || "DRAFT");
      setDurationSeconds(videoData.durationSeconds || "");

      setOldThumbnailUrl(videoData.thumbnailUrl || videoData.thumbnailPath || "");
      setOldMaterialUrl(videoData.materialUrl || videoData.materialPath || "");

      setMaterialPreviewName(videoData.materialName || "");
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      return "Vui lòng nhập tiêu đề video";
    }

    if (title.trim().length > 255) {
      return "Tiêu đề video không được vượt quá 255 ký tự";
    }

    if (!status) {
      return "Vui lòng chọn trạng thái video";
    }

    if (!["DRAFT", "PUBLISHED", "HIDDEN"].includes(status)) {
      return "Trạng thái video không hợp lệ";
    }

    return "";
  };

  const handleMaterialChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setError("");
    setMaterialFile(file);
    setMaterialPreviewName(file.name);
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

  const buildVideoData = () => {
    return {
      videoId: Number(videoId),
      lessonId: Number(lessonId),
      title: title.trim(),
      status,
      durationSeconds: durationSeconds ? Number(durationSeconds) : null,
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

      const formData = new FormData();

      formData.append(
        "data",
        new Blob([JSON.stringify(buildVideoData())], {
          type: "application/json",
        })
      );

      if (thumbnailFile) {
        formData.append("thumbnailFile", thumbnailFile);
      }

      if (materialFile) {
        formData.append("materialFile", materialFile);
      }

      const response = await fetch(`${API_BASE}/video/${videoId}/lessons/edit`, {
        method: "PUT",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        setError(data?.message || "Cập nhật video thất bại");
        return;
      }

      alert("Cập nhật video thành công");
      navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`);
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMaterialFile(null);
    setThumbnailFile(null);
    setThumbnailPreviewUrl("");
    loadVideoInfo();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Chưa xác định";

    const total = Number(seconds);
    const minutes = Math.floor(total / 60);
    const remainSeconds = total % 60;

    return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
  };

  const getThumbnailSrc = () => {
    if (thumbnailPreviewUrl) return thumbnailPreviewUrl;
    if (oldThumbnailUrl) return getFileUrl(oldThumbnailUrl);
    return "";
  };

  if (loading) {
    return (
      <div className="video-create-page">
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải thông tin video...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-create-page">
      <div className="mb-4">
        <h2 className="fw-bold">Chỉnh sửa video</h2>
        <p className="text-muted mb-0">
          Cập nhật một số thông tin cơ bản của video.
        </p>
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

                <div className="row g-3 mb-3 align-items-end">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Trạng thái
                    </label>

                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="DRAFT">Bản nháp</option>
                      <option value="PUBLISHED">Công khai</option>
                      <option value="HIDDEN">Ẩn</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Thời lượng video
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={formatDuration(durationSeconds)}
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Tài liệu bài học
                  </label>

                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <label className="btn btn-outline-secondary mb-0">
                      <i className="bi bi-file-earmark-zip me-2"></i>
                      Chọn file tài liệu mới
                      <input
                        type="file"
                        accept=".zip,.pdf,.doc,.docx,.ppt,.pptx,.rar"
                        hidden
                        onChange={handleMaterialChange}
                      />
                    </label>

                    {materialPreviewName ? (
                      <>
                        <span
                          className="text-muted small text-truncate"
                          style={{ maxWidth: "260px" }}
                          title={materialPreviewName}
                        >
                          {materialPreviewName}
                        </span>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setMaterialFile(null);
                            setMaterialPreviewName("");
                          }}
                        >
                          Xóa file mới
                        </button>
                      </>
                    ) : oldMaterialUrl ? (
                      <a
                        href={getFileUrl(oldMaterialUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="small"
                      >
                        Xem tài liệu hiện tại
                      </a>
                    ) : (
                      <span className="text-muted small">Chưa có tài liệu</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="video-action-bar mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={saving}
              >
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
                onClick={() =>
                  navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
                }
                disabled={saving}
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
                  Chọn ảnh mới nếu muốn thay thumbnail hiện tại
                </small>
              </div>

              <div className="card-body">
                <div className="thumbnail-preview">
                  {getThumbnailSrc() ? (
                    <img src={getThumbnailSrc()} alt="Thumbnail preview" />
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
                  Chọn ảnh thumbnail mới
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

export default TeacherVideoEdit;