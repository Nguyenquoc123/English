import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function TeacherLessonGrammarList() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [grammars, setGrammars] = useState([]);

  useEffect(() => {
    loadGrammars();
  }, [lessonId]);

  const loadGrammars = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/grammar/${lessonId}/grammars`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    setGrammars(data.result || data.data || data);
  };

  return (
    <div className="teacher-lesson-detail-page">
      <div className="lesson-detail-heading">
        <div>
          <button
            className="lesson-detail-back"
            onClick={() => navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại chi tiết bài học
          </button>

          <h2>Quản lý ngữ pháp</h2>
          <p>Danh sách nội dung ngữ pháp. Nội dung HTML dài sẽ được xem ở trang chi tiết riêng.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/grammar/create`)
          }
        >
          <i className="bi bi-plus-lg me-1"></i>
          Thêm ngữ pháp
        </button>
      </div>

      <div className="info-card">
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
              {grammars.map((grammar) => (
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
                            `/teacher/courses/${courseId}/lessons/${lessonId}/grammars/${grammar.grammarId}`
                          )
                        }
                      >
                        Xem
                      </button>

                      <button className="btn btn-sm btn-light">
                        <i className="bi bi-pencil"></i>
                      </button>

                      <button className="btn btn-sm btn-light text-danger">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {grammars.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    Bài học chưa có ngữ pháp.
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

export default TeacherLessonGrammarList;