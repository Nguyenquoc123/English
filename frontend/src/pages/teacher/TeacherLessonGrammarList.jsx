import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherLessonTrail } from "../../utils/breadcrumbPaths";

function TeacherLessonGrammarList({
  embedded = false,
  courseId: courseIdProp,
  lessonId: lessonIdProp,
}) {
  const navigate = useNavigate();
  const params = useParams();

  const courseId = courseIdProp || params.courseId;
  const lessonId = lessonIdProp || params.lessonId;

  const API_BASE = "http://localhost:8080";

  const [grammars, setGrammars] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lessonId) {
      loadGrammars();
    }
  }, [lessonId]);

  const loadGrammars = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/grammar/${lessonId}/grammars`, {
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
        setError(data?.message || "Không thể tải danh sách ngữ pháp");
        return;
      }

      const result = data?.result || data?.data || data;
      setGrammars(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const filteredGrammars = useMemo(() => {
    const searchText = keyword.trim().toLowerCase();

    if (!searchText) {
      return grammars;
    }

    return grammars.filter((grammar) => {
      const text = [
        grammar.title,
        grammar.content,
        grammar.description,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(searchText);
    });
  }, [keyword, grammars]);

  const formatDate = (value) => {
    if (!value) return "--";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("vi-VN");
    } catch {
      return value;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setKeyword("");
  };

  const handleCreate = () => {
    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/grammar/create`);
  };

  const handleView = (grammarId) => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}/grammars/${grammarId}`
    );
  };

  const handleEdit = (grammarId) => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}/grammars/${grammarId}/edit`
    );
  };

  const handleDelete = async (grammarId) => {
    const ok = window.confirm("Bạn có chắc muốn xóa ngữ pháp này không?");
    if (!ok) return;

    try {
      setDeletingId(grammarId);

      const token = localStorage.getItem("token");

      /*
        Đổi endpoint này nếu API xóa grammar của bạn khác.
      */
      const response = await fetch(`${API_BASE}/grammar/${grammarId}`, {
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
        alert(data?.message || "Xóa ngữ pháp thất bại");
        return;
      }

      alert("Xóa ngữ pháp thành công");
      loadGrammars();
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

            <h2>Quản lý ngữ pháp</h2>
            <p>
              Danh sách nội dung ngữ pháp. Nội dung HTML dài sẽ được xem ở
              trang chi tiết riêng.
            </p>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            <i className="bi bi-plus-lg me-1"></i>
            Thêm ngữ pháp
          </button>
        </div>
      )}

      {embedded && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Ngữ pháp bài học</h5>
            <div className="text-muted small">
              Danh sách nội dung ngữ pháp trong bài học này.
            </div>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleCreate}>
            <i className="bi bi-plus-lg me-1"></i>
            Thêm ngữ pháp
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
          <form onSubmit={handleSearch}>
            <div className="row g-2 align-items-end">
              <div className="col-md-8">
                <label className="form-label fw-semibold">
                  Tìm kiếm ngữ pháp
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-search"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm theo tiêu đề hoặc nội dung..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-fill">
                    <i className="bi bi-search me-1"></i>
                    Tìm kiếm
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleClearSearch}
                  >
                    Làm mới
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "70px" }}>#</th>
                <th>Tiêu đề</th>
                <th style={{ width: "180px" }}>Ngày tạo</th>
                <th style={{ width: "180px" }}>Ngày cập nhật</th>
                <th className="text-end" style={{ width: "170px" }}>
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải ngữ pháp...
                  </td>
                </tr>
              )}

              {!loading && !error && filteredGrammars.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    <div className="mb-2">
                      <i className="bi bi-journal-text fs-2"></i>
                    </div>
                    Không có ngữ pháp phù hợp.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredGrammars.map((grammar, index) => (
                  <tr key={grammar.grammarId || index}>
                    <td>
                      <span className="text-muted small">{index + 1}</span>
                    </td>

                    <td>
                      <div className="fw-semibold">
                        {grammar.title || "Chưa có tiêu đề"}
                      </div>
                    </td>

                    <td>
                      <span className="text-muted small">
                        {formatDate(grammar.createdAt)}
                      </span>
                    </td>

                    <td>
                      <span className="text-muted small">
                        {formatDate(grammar.updatedAt)}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleView(grammar.grammarId)}
                        >
                          Xem
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          onClick={() => handleEdit(grammar.grammarId)}
                          title="Cập nhật"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-light text-danger"
                          onClick={() => handleDelete(grammar.grammarId)}
                          disabled={deletingId === grammar.grammarId}
                          title="Xóa"
                        >
                          {deletingId === grammar.grammarId ? (
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

export default TeacherLessonGrammarList;