import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function TeacherLessonVocabularyList() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [vocabularies, setVocabularies] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    loadVocabularies();
  }, [lessonId]);

  const loadVocabularies = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/tu-vung/lessons/${lessonId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    setVocabularies(data.result || data.data || data);
  };

  const filtered = vocabularies.filter((v) => {
    const text = `${v.word || ""} ${v.meaning || ""}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  });

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

          <h2>Quản lý từ vựng</h2>
          <p>Quản lý danh sách từ vựng thuộc lesson hiện tại.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/vocabularies/create`)
          }
        >
          <i className="bi bi-plus-lg me-1"></i>
          Thêm từ vựng
        </button>
      </div>

      <div className="info-card mb-3">
        <input
          className="form-control"
          placeholder="Tìm theo từ vựng hoặc nghĩa..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="info-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Từ vựng</th>
                <th>Phiên âm</th>
                <th>Nghĩa</th>
                <th>Câu ví dụ</th>
                <th>Thứ tự</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((vocab) => (
                <tr key={vocab.vocabularyId}>
                  <td className="fw-bold">{vocab.word}</td>
                  <td>{vocab.pronunciation || "--"}</td>
                  <td>{vocab.meaning}</td>
                  <td className="text-muted">{vocab.exampleSentence || "--"}</td>
                  <td>{vocab.displayOrder || "--"}</td>
                  <td>
                    <div className="d-flex justify-content-end gap-1">
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

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    Không có từ vựng phù hợp.
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

export default TeacherLessonVocabularyList;