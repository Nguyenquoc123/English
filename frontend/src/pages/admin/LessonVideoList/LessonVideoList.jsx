import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFileUrl } from "../../../utils/fileurl";
import "./LessonVideoList.css";

function LessonVideoList() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVideos();
  }, [lessonId]);

  // Tải danh sách video của bài học
  const loadVideos = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/video/${lessonId}/lessons`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Không thể tải danh sách video");
        return;
      }

      setVideos(data.result || data.data || data);
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "--:--";
    const m = Math.floor(Number(seconds) / 60);
    const s = Number(seconds) % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="lesson-video-list-page">
      {/* Header */}
      <div className="admin-page-heading mb-4">
        <div>
          <button
            className="btn btn-light btn-sm mb-2"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/review`)}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Quay lại chi tiết bài học
          </button>
          <h4 className="fw-bold mb-1" style={{ color: "#0f3c9c" }}>
            Quản lý video bài học
          </h4>
          <p className="text-muted mb-0">
            Danh sách video của lesson. Click vào trang chi tiết để xem video.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Bảng danh sách video */}
      <div className="card border-0 shadow-sm rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-0">Danh sách video</h5>
            <small className="text-muted">Tìm thấy {videos.length} video</small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Thumbnail</th>
                <th>Tiêu đề</th>
                <th>Thời lượng</th>
                <th>Thứ tự</th>
                <th>Ngày tạo</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && videos.map((video) => (
                <tr key={video.videoId}>
                  <td>
                    <div className="video-thumbnail">
                      {video.thumbnailUrl ? (
                        <img
                          src={getFileUrl(video.thumbnailUrl)}
                          alt={video.title}
                          className="rounded-2"
                          style={{ width: 72, height: 48, objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center bg-light rounded-2 text-muted"
                          style={{ width: 72, height: 48 }}
                        >
                          <i className="bi bi-play-fill"></i>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="fw-semibold">{video.title}</td>
                  <td>{formatDuration(video.durationSeconds)}</td>
                  <td>{video.displayOrder}</td>
                  <td>{video.createdAt || "--"}</td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          navigate(
                            `/admin/courses/${courseId}/lessons/${lessonId}/videos/${video.videoId}`
                          )
                        }
                      >
                        <i className="bi bi-eye me-1"></i>Xem
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && videos.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-camera-video fs-3 d-block mb-2"></i>
                      Bài học chưa có video.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LessonVideoList;
