import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFileUrl } from "../../utils/fileurl";

function AdminLessonVideoListReview() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVideos();
  }, [lessonId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/video/${lessonId}/lessons`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Không thể tải danh sách video");
        return;
      }

      setVideos(data.result || data.data || data);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "--:--";
    const minutes = Math.floor(Number(seconds) / 60);
    const remainSeconds = Number(seconds) % 60;
    return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="teacher-lesson-detail-page">
      <div className="lesson-detail-heading">
        <div>
          <button
            className="lesson-detail-back"
            onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/review`)}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại chi tiết bài học
          </button>

          <h2>Quản lý video bài học</h2>
          <p>Danh sách video của lesson. Video chỉ được phát khi click vào trang xem chi tiết.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/videos/create`)
          }
        >
          <i className="bi bi-plus-lg me-1"></i>
          Thêm video
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="info-card">
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
                  <td colSpan="6" className="text-center text-muted py-4">
                    Đang tải video...
                  </td>
                </tr>
              )}

              {!loading &&
                videos.map((video) => (
                  <tr key={video.videoId}>
                    <td>
                      <div className="video-thumb">
                        {video.thumbnailUrl ? (
                          <img src={getFileUrl(video.thumbnailUrl)} alt={video.title} />
                        ) : (
                          <i className="bi bi-play-fill"></i>
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
                          Xem
                        </button>

                        
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && videos.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    Bài học chưa có video.
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

export default AdminLessonVideoListReview;