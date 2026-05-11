import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LessonVideoTab from "./components/LessonVideoTab";
import LessonVocabularyTab from "./components/LessonVocabularyTab";
import LessonGrammarTab from "./components/LessonGrammarTab";
import LessonPracticeTab from "./components/LessonPracticeTab";
import "./StudentLessonDetail.css";

function StudentLessonDetail() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [lesson, setLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("video");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  useEffect(() => {
    loadLessonDetail();
  }, [lessonId]);

  const loadLessonDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      /*
        API gợi ý:
        GET /lessons/{lessonId}/student-detail

        Response mẫu:
        {
          lessonId,
          courseId,
          courseTitle,
          title,
          description,
          lessonOrder,
          status,
          progressPercent
        }
      */

      const response = await fetch(
        `${API_BASE}/lesson/${lessonId}/student-detail`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const result = data?.result || data?.data || data;

      if (!response.ok) {
        setError(result?.message || "Không thể tải chi tiết bài học");
        return;
      }

      setLesson(result);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      key: "video",
      label: "Video",
      icon: "bi bi-play-circle",
    },
    {
      key: "vocabulary",
      label: "Từ vựng",
      icon: "bi bi-box-seam",
    },
    {
      key: "grammar",
      label: "Ngữ pháp",
      icon: "bi bi-pencil-square",
    },
    {
      key: "practice",
      label: "Ôn tập",
      icon: "bi bi-check2-circle",
    },
  ];

  const renderTabContent = () => {
    if (activeTab === "video") {
      return (
        <LessonVideoTab
          API_BASE={API_BASE}
          lessonId={lessonId}
          courseId={courseId}
          getToken={getToken}
        />
      );
    }

    if (activeTab === "vocabulary") {
      return (
        <LessonVocabularyTab
          API_BASE={API_BASE}
          lessonId={lessonId}
          getToken={getToken}
        />
      );
    }

    if (activeTab === "grammar") {
      return (
        <LessonGrammarTab
          API_BASE={API_BASE}
          lessonId={lessonId}
          getToken={getToken}
        />
      );
    }

    if (activeTab === "practice") {
      return (
        <LessonPracticeTab
          API_BASE={API_BASE}
          lessonId={lessonId}
          courseId={courseId}
          getToken={getToken}
        />
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="student-lesson-detail-page">
        <div className="student-lesson-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-lesson-detail-page">
        <button className="lesson-back-link" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>

        <div className="alert alert-danger mt-3">{error}</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="student-lesson-detail-page">
        <div className="alert alert-warning">Không tìm thấy bài học.</div>
      </div>
    );
  }

  return (
    <div className="student-lesson-detail-page">
      <div className="student-lesson-container">
        <button className="lesson-back-link" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>

        <div className="lesson-hero">
          <div className="lesson-hero-left">
            <div className="course-pill">
              {lesson.courseTitle || "Khóa học tiếng Anh"}
            </div>

            <h1>
              Lesson {lesson.lessonOrder}: {lesson.title}
            </h1>

            <p>{lesson.description || "Bài học chưa có mô tả."}</p>
          </div>

          <div className="lesson-progress-card">
            <div className="d-flex justify-content-between mb-2">
              <span>Tiến độ lesson</span>
              <strong>{lesson.progressPercent || 0}%</strong>
            </div>

            <div className="lesson-progress-track">
              <div
                className="lesson-progress-bar"
                style={{ width: `${lesson.progressPercent || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="lesson-content-card">
          <div className="lesson-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={
                  activeTab === tab.key
                    ? "lesson-tab-button active"
                    : "lesson-tab-button"
                }
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lesson-tab-content">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default StudentLessonDetail;