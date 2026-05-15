import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LessonGrammarDetail.css";

function LessonGrammarDetail() {
  const navigate = useNavigate();
  const { courseId, lessonId, grammarId } = useParams();

  const [grammar, setGrammar] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGrammar();
  }, [grammarId]);

  // Tải chi tiết ngữ pháp cho admin xem
  const loadGrammar = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/grammar/${grammarId}/admin`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Không thể tải ngữ pháp");
        return;
      }

      setGrammar(data.result || data.data || data);
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

  if (!grammar) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-grammar-detail-page">
      {/* Nút quay lại */}
      <button
        className="btn btn-light btn-sm mb-3"
        onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/grammars`)}
      >
        <i className="bi bi-arrow-left me-1"></i>
        Quay lại danh sách ngữ pháp
      </button>

      {/* Nội dung ngữ pháp */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h4 className="fw-bold mb-4" style={{ color: "#0f3c9c" }}>{grammar.title}</h4>

        <div
          className="grammar-content"
          dangerouslySetInnerHTML={{ __html: grammar.contentHtml }}
        />
      </div>
    </div>
  );
}

export default LessonGrammarDetail;
