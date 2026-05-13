import { useEffect, useState } from "react";
import { getFileUrl } from "../../../../utils/fileurl";

function LessonVideoTab({ API_BASE, lessonId, getToken }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, [lessonId]);

  

  const loadVideos = async () => {
    try {
      setLoading(true);

      const token = getToken();

      /*
        API gợi ý:
        GET /videos/{lessonId}/lessons
      */

      const response = await fetch(`${API_BASE}/video/${lessonId}/lessons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const result = data.result || data.data || data || [];

      if (!response.ok) {
        setVideos([]);
        return;
      }

      setVideos(result);

      if (result.length > 0) {
        setSelectedVideo(result[0]);
      }
    } catch (err) {
      console.error(err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="lesson-tab-loading">
        <div className="spinner-border text-primary"></div>
        <p>Đang tải video bài học...</p>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="lesson-empty-state">
        <i className="bi bi-camera-video"></i>
        <h5>Bài học chưa có video</h5>
        <p>Bạn có thể học từ vựng, ngữ pháp hoặc chuyển sang phần ôn tập.</p>
      </div>
    );
  }

  return (
    <div className="lesson-video-layout">
      <div className="lesson-video-main">
        <div className="video-player-box">
          {selectedVideo?.videoUrl ? (
            <video
              key={selectedVideo.videoId}
              controls
              poster={
                selectedVideo.thumbnailUrl
                  ? getFileUrl(selectedVideo.thumbnailUrl)
                  : undefined
              }
            >
              <source src={getFileUrl(selectedVideo.videoUrl)} />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          ) : (
            <div className="video-placeholder">
              <i className="bi bi-play-fill"></i>
            </div>
          )}
        </div>

        <div className="video-info">
          <h3>{selectedVideo?.title || "Video bài học"}</h3>
          <p>
            Xem video bài giảng để nắm nội dung chính trước khi học từ vựng,
            ngữ pháp và làm bài ôn tập.
          </p>
        </div>
      </div>

      <div className="lesson-video-sidebar">
        <h5>Danh sách video</h5>

        <div className="video-list">
          {videos.map((video, index) => (
            <button
              key={video.videoId}
              type="button"
              className={
                selectedVideo?.videoId === video.videoId
                  ? "video-list-item active"
                  : "video-list-item"
              }
              onClick={() => setSelectedVideo(video)}
            >
              <div className="video-thumb">
                {video.thumbnailUrl ? (
                  <img src={getFileUrl(video.thumbnailUrl)} alt={video.title} />
                ) : (
                  <i className="bi bi-play-fill"></i>
                )}
              </div>

              <div className="video-list-info">
                <strong>
                  {index + 1}. {video.title}
                </strong>
                <span>{formatDuration(video.durationSeconds)}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lesson-tip-box">
          <i className="bi bi-info-circle"></i>
          <span>
            Sau khi xem video, bạn có thể chuyển sang tab Từ vựng, Ngữ pháp hoặc
            Ôn tập để củng cố kiến thức.
          </span>
        </div>
      </div>
    </div>
  );
}

export default LessonVideoTab;