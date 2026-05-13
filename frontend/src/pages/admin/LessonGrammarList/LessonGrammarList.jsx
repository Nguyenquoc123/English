import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LessonGrammarList.css";

function LessonGrammarList() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const [grammars, setGrammars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGrammars();
  }, [lessonId]);

  // Tải danh sách ngữ pháp của bài học
  const loadGrammars = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/grammar/${lessonId}/grammars`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Không thể tải danh sách ngữ pháp");
        return;
      }

      setGrammars(data.result || data.data || data);
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lesson-grammar-list-page">
      {/* Header */}
      <div className="mb-4">
        <button
          className="btn btn-light btn-sm mb-2"
          onClick={() => navigate(`/admin/courses/${courseId}/lessons/${lessonId}/review`)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Quay lại chi tiết bài học
        </button>
        <h4 className="fw-bold mb-1" style={{ color: "#0f3c9c" }}>
          Quản lý ngữ pháp
        </h4>
        <p className="text-muted mb-0">
          Danh sách nội dung ngữ pháp. Click vào từng mục để xem nội dung HTML chi tiết.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Bảng danh sách ngữ pháp */}
      <div className="card border-0 shadow-sm rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-0">Danh sách ngữ pháp</h5>
            <small className="text-muted">Tìm thấy {grammars.length} mục</small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Tiêu đề</th>
                <th>Ngày tạo</th>
                <th>Ngày cập nhật</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border text-primary">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && grammars.map((grammar) => (
                <tr key={grammar.grammarId}>
                  <td className="fw-semibold">{grammar.title}</td>
                  <td>{grammar.createdAt || "--"}</td>
                  <td>{grammar.updatedAt || "--"}</td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          navigate(
                            `/admin/courses/${courseId}/lessons/${lessonId}/grammars/${grammar.grammarId}`
                          )
                        }
                      >
                        <i className="bi bi-eye me-1"></i>Xem
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && grammars.length === 0 && (
                <tr>
                  <td colSpan="4">
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-pencil-square fs-3 d-block mb-2"></i>
                      Bài học chưa có ngữ pháp.
                    </div>
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

export default LessonGrammarList;
