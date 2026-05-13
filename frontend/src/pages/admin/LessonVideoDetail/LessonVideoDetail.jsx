import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFileUrl } from "../../../utils/fileurl";
import "./LessonVideoDetail.css";

function LessonVideoDetail() {
  const navigate = useNavigate();
  const { courseId, lessonId, videoId } = useParams();

  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  // Tải chi tiết video cho admin xem
  const loadVideo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/video/${videoId}/admin`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Không thể tải video");
        return;
      }

      setVideo(data.result || data.data || data);
    } catch {
      setError("Lỗi kết nối server");
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle"></i>
        <span>{error}</span>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-video-detail-page">
      {/* Nút quay lại */}
      <button
        className="btn btn-light btn-sm mb-3"
        onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/videos`)}
      >
        <i className="bi bi-arrow-left me-1"></i>
        Quay lại danh sách video
      </button>

      {/* Card xem video */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h4 className="fw-bold mb-3" style={{ color: "#0f3c9c" }}>{video.title}</h4>

        <video
          className="w-100 rounded-4"
          style={{ maxHeight: 520, background: "#111827" }}
          controls
          poster={getFileUrl(video.thumbnailUrl)}
        >
          <source src={getFileUrl(video.videoUrl)} />
          Trình duyệt của bạn không hỗ trợ video.
        </video>

        <div className="mt-3 text-muted small">
          <i className="bi bi-list-ol me-1"></i>Thứ tự: {video.displayOrder}
          <span className="mx-2">·</span>
          <i className="bi bi-calendar me-1"></i>Ngày tạo: {video.createdAt || "--"}
        </div>
      </div>
    </div>
  );
}

export default LessonVideoDetail;
