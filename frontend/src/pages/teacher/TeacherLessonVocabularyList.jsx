import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherLessonTrail } from "../../utils/breadcrumbPaths";

function TeacherLessonVocabularyList({
  embedded = false,
  courseId: courseIdProp,
  lessonId: lessonIdProp,
}) {
  const navigate = useNavigate();
  const params = useParams();

  const courseId = courseIdProp || params.courseId;
  const lessonId = lessonIdProp || params.lessonId;

  const API_BASE = "http://localhost:8080";

  const [vocabularies, setVocabularies] = useState([]);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lessonId) {
      loadVocabularies();
    }
  }, [lessonId]);

  const loadVocabularies = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/tu-vung/lessons/${lessonId}`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Không thể tải danh sách từ vựng");
        return;
      }

      const result = data?.result || data?.data || data;
      setVocabularies(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const filteredVocabularies = useMemo(() => {
    const searchText = keyword.trim().toLowerCase();

    if (!searchText) {
      return vocabularies;
    }

    return vocabularies.filter((vocab) => {
      const text = [
        vocab.word,
        vocab.pronunciation,
        vocab.meaning,
        vocab.exampleSentence,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(searchText);
    });
  }, [keyword, vocabularies]);

  const handleCreate = () => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}/vocabularies/create`
    );
  };

  const handleEdit = (vocabularyId) => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}/vocabularies/${vocabularyId}/edit`
    );
  };

  const handleDelete = async (vocabularyId) => {
    const ok = window.confirm("Bạn có chắc muốn xóa từ vựng này không?");
    if (!ok) return;

    try {
      setDeletingId(vocabularyId);

      const token = localStorage.getItem("token");

      /*
        Đổi endpoint này nếu API xóa từ vựng của bạn khác.
      */
      const response = await fetch(`${API_BASE}/tu-vung/${vocabularyId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Xóa từ vựng thất bại");
        return;
      }

      alert("Xóa từ vựng thành công");
      loadVocabularies();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={embedded ? "p-3" : "teacher-lesson-detail-page"}>
      {!embedded && (
        <div className="lesson-detail-heading">
          <div>
            <button
              type="button"
              className="lesson-detail-back"
              onClick={() =>
                navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
              }
            >
              <i className="bi bi-arrow-left"></i>
              Quay lại chi tiết bài học
            </button>

            <h2>Quản lý từ vựng</h2>
            <p>Quản lý danh sách từ vựng thuộc lesson hiện tại.</p>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            <i className="bi bi-plus-lg me-1"></i>
            Thêm từ vựng
          </button>
        </div>
      )}

      {embedded && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Từ vựng bài học</h5>
            <div className="text-muted small">
              Danh sách từ vựng trong bài học này.
            </div>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            <i className="bi bi-plus-lg me-1"></i>
            Thêm từ vựng
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-light">
              <i className="bi bi-search"></i>
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo từ vựng, phiên âm, nghĩa hoặc câu ví dụ..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            {keyword && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setKeyword("")}
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "70px" }}>#</th>
                <th>Từ vựng</th>
                <th>Phiên âm</th>
                <th>Nghĩa</th>
                <th>Câu ví dụ</th>
                <th style={{ width: "100px" }}>Thứ tự</th>
                <th className="text-end" style={{ width: "140px" }}>
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải từ vựng...
                  </td>
                </tr>
              )}

              {!loading && !error && filteredVocabularies.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    <div className="mb-2">
                      <i className="bi bi-card-text fs-2"></i>
                    </div>
                    Không có từ vựng phù hợp.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredVocabularies.map((vocab, index) => (
                  <tr key={vocab.vocabularyId || index}>
                    <td>
                      <span className="text-muted small">{index + 1}</span>
                    </td>

                    <td>
                      <div className="fw-bold">{vocab.word || "--"}</div>
                    </td>

                    <td>
                      <span className="text-muted">
                        {vocab.pronunciation || "--"}
                      </span>
                    </td>

                    <td>{vocab.meaning || "--"}</td>

                    <td>
                      <span className="text-muted">
                        {vocab.exampleSentence || "--"}
                      </span>
                    </td>

                    <td>
                      <span className="badge text-bg-light border">
                        {vocab.displayOrder || "--"}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          onClick={() => handleEdit(vocab.vocabularyId)}
                          title="Cập nhật"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-light text-danger"
                          onClick={() => handleDelete(vocab.vocabularyId)}
                          disabled={deletingId === vocab.vocabularyId}
                          title="Xóa"
                        >
                          {deletingId === vocab.vocabularyId ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeacherLessonVocabularyList;