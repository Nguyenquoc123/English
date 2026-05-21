import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFileUrl } from "../../utils/fileurl";

function TeacherLessonVideoDetail({
  videoId: videoIdProp,
  embedded = false,
  onClose,
}) {
  const navigate = useNavigate();
  const params = useParams();

  const courseId = params.courseId;
  const lessonId = params.lessonId;
  const videoId = videoIdProp || params.videoId;

  const API_BASE = "http://localhost:8080";

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (videoId) {
      loadVideo();
    }
  }, [videoId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/video/${videoId}`, {
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
        setError(data?.message || "Không thể tải video");
        return;
      }

      setVideo(data.result || data.data || data);
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

  const handleBack = () => {
    if (embedded && onClose) {
      onClose();
      return;
    }

    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/videos`);
  };

  if (loading) {
    return (
      <div className="text-center text-muted py-5">
        <div className="spinner-border text-primary mb-3"></div>
        <div>Đang tải video...</div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mb-0">{error}</div>;
  }

  if (!video) {
    return (
      <div className="text-muted py-5 text-center">
        Không tìm thấy video.
      </div>
    );
  }

  return (
    <div>
      {!embedded && (
        <button
          type="button"
          className="btn btn-link px-0 text-decoration-none mb-3"
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Quay lại danh sách video
        </button>
      )}

      

      <video
        className="w-100"
        style={{
          maxHeight: 520,
          background: "#111827",
          borderRadius: 12,
        }}
        controls
        poster={video.thumbnailUrl ? getFileUrl(video.thumbnailUrl) : undefined}
      >
        <source src={getFileUrl(video.videoUrl)} />
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    </div>
  );
}

export default TeacherLessonVideoDetail;