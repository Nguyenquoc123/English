import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFileUrl } from "../../utils/fileurl";
import TeacherLessonVideoDetail from "./TeacherLessonVideoDetail";

function TeacherLessonVideoList({
  embedded = false,
  courseId: courseIdProp,
  lessonId: lessonIdProp,
}) {
  const navigate = useNavigate();
  const params = useParams();

  const courseId = courseIdProp || params.courseId;
  const lessonId = lessonIdProp || params.lessonId;

  const API_BASE = "http://localhost:8080";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  useEffect(() => {
    if (lessonId) {
      loadVideos();
    }
  }, [lessonId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/video/${lessonId}/lessons`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Không thể tải danh sách video");
        return;
      }

      const result = data?.result || data?.data || data;
      setVideos(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "--";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("vi-VN");
    } catch {
      return value;
    }
  };

  const handleCreateVideo = () => {
    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/videos/create`);
  };

  const handleViewVideo = (videoId) => {
    setSelectedVideoId(videoId);
  };

  const handleEditVideo = (videoId) => {
    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/videos/${videoId}/edit`);
  };

  const handleDeleteVideo = async (videoId) => {
    const ok = window.confirm("Bạn có chắc muốn xóa video này không?");
    if (!ok) return;

    try {
      setDeletingId(videoId);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/video/${videoId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Xóa video thất bại");
        return;
      }

      alert("Xóa video thành công");
      loadVideos();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={embedded ? "p-3" : "container py-4"}>
      {!embedded && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button
              type="button"
              className="btn btn-link px-0 text-decoration-none"
              onClick={() =>
                navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
              }
            >
              <i className="bi bi-arrow-left me-1"></i>
              Quay lại bài học
            </button>

            <h4 className="fw-bold mb-0">Danh sách video</h4>
            <div className="text-muted">Quản lý video của bài học.</div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateVideo}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm video
          </button>
        </div>
      )}

      {embedded && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Video bài học</h5>

          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateVideo}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm video
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "120px" }}>Thumbnail</th>
                <th>Tiêu đề</th>
                <th style={{ width: "100px" }}>Thứ tự</th>
                <th style={{ width: "180px" }}>Ngày tạo</th>
                <th className="text-end" style={{ width: "180px" }}>
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải video...
                  </td>
                </tr>
              )}

              {!loading && !error && videos.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    <div className="mb-2">
                      <i className="bi bi-play-circle fs-2"></i>
                    </div>
                    Bài học chưa có video.
                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={handleCreateVideo}
                      >
                        <i className="bi bi-plus-lg me-1"></i>
                        Thêm video
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                videos.map((video) => (
                  <tr key={video.videoId}>
                    <td>
                      {video.thumbnailUrl ? (
                        <img
                          src={getFileUrl(video.thumbnailUrl)}
                          alt={video.title}
                          className="rounded border"
                          style={{
                            width: "90px",
                            height: "52px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded border bg-light d-flex align-items-center justify-content-center"
                          style={{ width: "90px", height: "52px" }}
                        >
                          <i className="bi bi-play-fill fs-4 text-primary"></i>
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="fw-semibold">
                        {video.title || "Video chưa có tiêu đề"}
                      </div>

                      {video.videoUrl && (
                        <div className="text-muted small text-truncate">
                          {video.videoUrl}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="badge text-bg-light border">
                        {video.displayOrder || "--"}
                      </span>
                    </td>

                    <td>
                      <span className="text-muted small">
                        {formatDate(video.createdAt)}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewVideo(video.videoId)}
                        >
                          Xem
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          onClick={() => handleEditVideo(video.videoId)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-light text-danger"
                          onClick={() => handleDeleteVideo(video.videoId)}
                          disabled={deletingId === video.videoId}
                        >
                          {deletingId === video.videoId ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVideoId && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết video</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedVideoId(null)}
                ></button>
              </div>

              <div className="modal-body">
                <TeacherLessonVideoDetail
                  embedded={true}
                  videoId={selectedVideoId}
                  onClose={() => setSelectedVideoId(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherLessonVideoList;