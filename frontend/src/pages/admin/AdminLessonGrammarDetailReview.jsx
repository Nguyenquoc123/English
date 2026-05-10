import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AdminLessonGrammarDetailReview() {
  const navigate = useNavigate();
  const { courseId, lessonId, grammarId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [grammar, setGrammar] = useState(null);

  useEffect(() => {
    loadGrammar();
  }, [grammarId]);

  const loadGrammar = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/grammar/${grammarId}/admin`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    setGrammar(data.result || data.data || data);
  };

  if (!grammar) return <div className="text-center text-muted py-5">Đang tải ngữ pháp...</div>;

  return (
    <div className="teacher-lesson-detail-page">
      <button
        className="lesson-detail-back"
        onClick={() =>
          navigate(`/admin/courses/${courseId}/lessons/${lessonId}/grammars`)
        }
      >
        <i className="bi bi-arrow-left"></i>
        Quay lại danh sách ngữ pháp
      </button>

      <div className="info-card">
        <h2>{grammar.title}</h2>

        <div
          className="course-description-html mt-4"
          dangerouslySetInnerHTML={{ __html: grammar.contentHtml }}
        ></div>
      </div>
    </div>
  );
}

export default AdminLessonGrammarDetailReview;