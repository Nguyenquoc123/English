import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ExamListPage.css";


function ExamListPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const API_BASE = "http://localhost:8080";

  const [exams, setExams] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/dang-nhap");
        return;
      }

      const params = new URLSearchParams();

      if (keyword.trim()) {
        params.append("keyword", keyword.trim());
      }

      if (status) {
        params.append("status", status);
      }

      // Chỉ thêm courseId khi đang ở trang chi tiết khóa học
      if (courseId) {
        params.append("courseId", courseId);
      }

      const queryString = params.toString();

      const url = queryString
        ? `${API_BASE}/exams/all-bai-thi-teacher?${queryString}`
        : `${API_BASE}/exams/all-bai-thi-teacher`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }
      console.log(data)
      const result = data?.result || data?.data || data || [];

      if (!response.ok) {
        setError(result?.message || "Không thể tải danh sách bài thi");
        return;
      }

      setExams(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadExams();
  };

  const handleReset = () => {
    setKeyword("");
    setStatus("");

    setTimeout(() => {
      loadExams();
    }, 0);
  };

  const handleDeleteExam = async (exam) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa bài thi "${exam.title}" không?`);

    if (!ok) return;

    try {
      const token = getToken();

      const response = await fetch(`${API_BASE}/exams/${exam.examId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Xóa bài thi thất bại");
        return;
      }

      alert("Xóa bài thi thành công");
      loadExams();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi xóa bài thi");
    }
  };

  const formatDate = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTimeShort = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const dateText = date.toLocaleDateString("vi-VN");
    const timeText = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <>
        {dateText}
        <br />
        <span>{timeText}</span>
      </>
    );
  };

  const getStatusBadge = (examStatus) => {
    const value = String(examStatus || "").toLowerCase();

    if (value === "open") {
      return <span className="exam-status-badge status-open">Open</span>;
    }

    if (value === "closed") {
      return <span className="exam-status-badge status-closed">Closed</span>;
    }

    if (value === "draft") {
      return <span className="exam-status-badge status-draft">Draft</span>;
    }

    if (value === "hidden") {
      return <span className="exam-status-badge status-hidden">Hidden</span>;
    }

    return <span className="exam-status-badge status-muted">{examStatus || "--"}</span>;
  };

  const getTimeRangeText = (startTime, endTime) => {
    return (
      <div className="exam-time-range">
        <div>{formatDateTimeShort(startTime)}</div>
        <div className="time-divider">→</div>
        <div>{formatDateTimeShort(endTime)}</div>
      </div>
    );
  };

  return (
    <div className="exam-list-page">
      <div className="exam-list-container">
        <div className="exam-page-heading">
          <div>
            <h2>Danh sách bài thi</h2>
            <p>Quản lý các kỳ thi thuộc khóa học trong hệ thống.</p>
          </div>

          <button
            type="button"
            className="btn btn-primary create-exam-btn"
            onClick={() => navigate("/teacher/exams/create")}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Tạo bài thi
          </button>
        </div>

        <form className="exam-filter-card" onSubmit={handleSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-lg-5 col-md-6">
              <label className="form-label">Từ khóa tìm kiếm</label>

              <div className="exam-search-input">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="form-control"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập tên kỳ thi"
                />
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <label className="form-label">Trạng thái kỳ thi</label>

              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Draft">Draft</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>

            <div className="col-lg-4">
              <div className="filter-actions">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-search me-2"></i>
                  Tìm kiếm
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={handleReset}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Làm mới
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="exam-table-card">
          {loading ? (
            <div className="exam-loading">
              <div className="spinner-border text-primary mb-3"></div>
              <p>Đang tải danh sách bài thi...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3">{error}</div>
          ) : exams.length === 0 ? (
            <div className="exam-empty">
              <i className="bi bi-clipboard-x"></i>
              <h5>Chưa có bài thi</h5>
              <p>Không tìm thấy bài thi phù hợp với điều kiện lọc.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table exam-table align-middle">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên kỳ thi</th>
                      <th>Thời gian mở</th>
                      <th>Thời lượng</th>
                      <th>Số câu</th>
                      <th>Lượt thi</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody>
                    {exams.map((exam, index) => (
                      <tr key={exam.examId}>
                        <td>{index + 1}</td>

                        <td>
                          <div className="exam-title-cell">
                            <strong>{exam.title}</strong>
                            <span>ID EX-{exam.examId}</span>
                            {exam.courseTitle && (
                              <small>{exam.courseTitle}</small>
                            )}
                          </div>
                        </td>

                        <td>
                          {getTimeRangeText(exam.startTime, exam.endTime)}
                        </td>

                        <td>
                          <strong>{exam.durationMinutes || 0}</strong>
                          <span className="cell-muted"> phút</span>
                        </td>

                        <td>{exam.questionCount || 0}</td>

                        <td>
                          <span className="attempt-count">
                            {exam.attemptCount || 0}
                          </span>
                        </td>

                        <td>{getStatusBadge(exam.status)}</td>

                        <td>{formatDate(exam.createdAt)}</td>

                        <td>
                          <div className="exam-action-group">
                            <button
                              type="button"
                              className="exam-icon-btn"
                              title="Xem chi tiết"
                              onClick={() => navigate(`/teacher/exams/${exam.examId}`)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>

                            <button
                              type="button"
                              className="exam-icon-btn"
                              title="Cập nhật"
                              onClick={() =>
                                navigate(`/teacher/exams/${exam.examId}/update`)
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              type="button"
                              className="exam-icon-btn"
                              title="Quản lý câu hỏi"
                              onClick={() =>
                                navigate(`/teacher/exams/${exam.examId}/questions`)
                              }
                            >
                              <i className="bi bi-journal-plus"></i>
                            </button>

                            <button
                              type="button"
                              className="exam-icon-btn danger"
                              title="Xóa"
                              onClick={() => handleDeleteExam(exam)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="exam-table-footer">
                <span>Hiển thị 1 - {exams.length} trong {exams.length} kỳ thi</span>

                <div className="pagination-lite">
                  <button type="button" disabled>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button type="button" className="active">
                    1
                  </button>
                  <button type="button" disabled>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExamListPage;