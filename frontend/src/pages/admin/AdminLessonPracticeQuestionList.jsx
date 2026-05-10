import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AdminLessonPracticeQuestionList() {
  const navigate = useNavigate();
  const { courseId, lessonId, practiceType } = useParams();

  const API_BASE = "http://localhost:8080";

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadQuestions();
  }, [lessonId, practiceType]);

  const loadQuestions = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/lesson/${courseId}/admin/lessons/${lessonId}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    const data = await response.json();
    console.log(data)
    const lessonData = data.result || data.data || data;

    setQuestions(
      (lessonData.questions || []).filter((q) => q.questionType === practiceType)
    );
  };

  return (
    <div className="teacher-lesson-detail-page">
      <div className="lesson-detail-heading">
        <div>
          <button
            className="lesson-detail-back"
            onClick={() =>
              navigate(`/admin/courses/${courseId}/lessons/${lessonId}/review`)
            }
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại quản lý ôn tập
          </button>

          <h2>Danh sách câu hỏi: {practiceType}</h2>
          <p>Hiển thị các câu hỏi thuộc dạng ôn tập đã chọn.</p>
        </div>

        
      </div>

      <div className="info-card">
        <div className="question-list">
          {questions.map((question) => (
            <div className="question-card" key={question.questionId}>
              <div>
                <span className="question-type">{question.questionType}</span>
                <h6>{question.content}</h6>
                <p>
                  Số đáp án: <strong>{question.optionCount || 0}</strong>
                </p>
              </div>

              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-light">
                  <i className="bi bi-eye"></i>
                </button>

                
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="empty-box">
              Dạng ôn tập này chưa có câu hỏi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminLessonPracticeQuestionList;