import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LessonPracticeTab({ API_BASE, lessonId, courseId, getToken }) {
  const navigate = useNavigate();

  const [practiceConfigs, setPracticeConfigs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPracticeConfigs();
  }, [lessonId]);

  const loadPracticeConfigs = async () => {
    try {
      setLoading(true);

      const token = getToken();

      /*
        API gợi ý:
        GET /lessons/{lessonId}/practice-configs/student
        Response:
        [
          {
            configId,
            lessonId,
            practiceType,
            isEnabled,
            questionCount
          }
        ]
      */

      const response = await fetch(
        `${API_BASE}/practice-configs/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      const result = data.result || data.data || data || [];

      if (!response.ok) {
        setPracticeConfigs([]);
        return;
      }

      setPracticeConfigs(result);
    } catch (err) {
      console.error(err);
      setPracticeConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const getPracticeInfo = (type) => {
    const map = {
      MULTIPLE_CHOICE: {
        title: "Trắc nghiệm",
        description: "Chọn đáp án đúng dựa trên nội dung bài học.",
        icon: "bi bi-ui-checks-grid",
      },
      LISTENING_CHOICE: {
        title: "Nghe chọn đáp án",
        description: "Nghe audio và chọn đáp án phù hợp.",
        icon: "bi bi-headphones",
      },
      LISTENING_FILL_BLANK: {
        title: "Nghe điền từ",
        description: "Nghe audio và điền từ còn thiếu.",
        icon: "bi bi-mic",
      },
      ARRANGE_SENTENCE: {
        title: "Sắp xếp câu",
        description: "Sắp xếp các từ thành câu hoàn chỉnh.",
        icon: "bi bi-sort-alpha-down",
      },
      WRITING_SHORT: {
        title: "Viết ngắn",
        description: "Trả lời ngắn theo yêu cầu của câu hỏi.",
        icon: "bi bi-pencil",
      },
    };

    return (
      map[type] || {
        title: type,
        description: "Dạng ôn tập của bài học.",
        icon: "bi bi-question-circle",
      }
    );
  };

  const handleStartPractice = (config) => {
    if (!config.isEnabled) {
      alert("Dạng ôn tập này hiện chưa được mở.");
      return;
    }

    if (!config.questionCount || config.questionCount <= 0) {
      alert("Dạng ôn tập này chưa có câu hỏi.");
      return;
    }

    navigate(
      `/khoa-hoc/${courseId}/lessons/${lessonId}/practice/${config.practiceType}`
    );
  };

  if (loading) {
    return (
      <div className="lesson-tab-loading">
        <div className="spinner-border text-primary"></div>
        <p>Đang tải bài ôn tập...</p>
      </div>
    );
  }

  if (!practiceConfigs || practiceConfigs.length === 0) {
    return (
      <div className="lesson-empty-state">
        <i className="bi bi-check2-circle"></i>
        <h5>Bài học chưa có bài ôn tập</h5>
        <p>Giáo viên chưa bật hoặc chưa thêm câu hỏi ôn tập cho bài học này.</p>
      </div>
    );
  }

  return (
    <div className="practice-tab">
      <div className="tab-section-header">
        <div>
          <h4>Ôn tập theo dạng bài</h4>
          <p>Chọn một dạng ôn tập để luyện lại kiến thức của lesson.</p>
        </div>

        <span>{practiceConfigs.length} dạng</span>
      </div>

      <div className="practice-grid">
        {practiceConfigs.map((config) => {
          const info = getPracticeInfo(config.practiceType);

          return (
            <div
              className={
                config.isEnabled
                  ? "practice-card"
                  : "practice-card disabled"
              }
              key={config.configId || config.practiceType}
            >
              <div className="practice-icon">
                <i className={info.icon}></i>
              </div>

              <div className="practice-content">
                <div className="practice-title-row">
                  <h5>{info.title}</h5>

                  <span
                    className={
                      config.isEnabled
                        ? "practice-status enabled"
                        : "practice-status disabled"
                    }
                  >
                    {config.isEnabled ? "Đang mở" : "Đã khóa"}
                  </span>
                </div>

                <p>{info.description}</p>

                <div className="practice-meta">
                  <span>
                    <i className="bi bi-question-circle"></i>
                    {config.questionCount || 0} câu hỏi
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100 mt-3"
                  onClick={() => handleStartPractice(config)}
                  disabled={!config.isEnabled || !config.questionCount}
                >
                  Bắt đầu ôn tập
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LessonPracticeTab;