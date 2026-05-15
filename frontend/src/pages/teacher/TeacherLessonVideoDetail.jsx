import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFileUrl } from "../../utils/fileurl";

function TeacherLessonVideoDetail() {
  const navigate = useNavigate();
  const { courseId, lessonId, videoId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  const loadVideo = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/video/${videoId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        setError(data?.message || "Không thể tải video");
        return;
      }

      setVideo(data.result || data.data || data);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!video) return <div className="text-muted py-5 text-center">Đang tải video...</div>;

  return (
    <div className="teacher-lesson-detail-page">
      <button
        className="lesson-detail-back"
        onClick={() =>
          navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/videos`)
        }
      >
        <i className="bi bi-arrow-left"></i>
        Quay lại danh sách video
      </button>

      <div className="info-card">
        <h3>{video.title}</h3>

        <video
          className="w-100 mt-3"
          style={{ maxHeight: 520, background: "#111827", borderRadius: 16 }}
          controls
          poster={getFileUrl(video.thumbnailUrl)}
        >
          <source src={getFileUrl(video.videoUrl)} />
          Trình duyệt của bạn không hỗ trợ video.
        </video>

        <div className="mt-3 text-muted">
          Thứ tự: {video.displayOrder} · Ngày tạo: {video.createdAt || "--"}
        </div>
      </div>
    </div>
  );
}

export default TeacherLessonVideoDetail;