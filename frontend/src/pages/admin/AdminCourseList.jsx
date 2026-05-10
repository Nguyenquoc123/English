import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCourseList.css";

function AdminCourseList() {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080";

  const [courses, setCourses] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      if (keyword.trim()) {
        params.append("keyword", keyword.trim());
      }

      if (status) {
        params.append("status", status);
      }

      const response = await fetch(`${API_BASE}/khoa-hoc/danh-sach-khoa-hoc?${params.toString()}`, {
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
        setError(data?.message || "Không thể tải danh sách khóa học");
        return;
      }

      const result = data.result || data.data || data;

      setCourses(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCourses();
  };

  const handleReset = () => {
    setKeyword("");
    setStatus("");

    setTimeout(() => {
      loadCourses();
    }, 0);
  };

  const formatPrice = (price) => {
    if (!price || Number(price) === 0) {
      return "Miễn phí";
    }

    return Number(price).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatDateTime = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("vi-VN");
  };

  const getStatusBadge = (statusValue) => {
    if (statusValue === "Draft") return "badge rounded-pill text-bg-secondary";
    if (statusValue === "Pending") return "badge rounded-pill text-bg-warning";
    if (statusValue === "Published") return "badge rounded-pill text-bg-success";
    if (statusValue === "Rejected") return "badge rounded-pill text-bg-danger";
    if (statusValue === "Hidden") return "badge rounded-pill text-bg-dark";
    if (statusValue === "Deleted") return "badge rounded-pill text-bg-light";
    return "badge rounded-pill text-bg-light";
  };

  const getAccessTypeBadge = (accessType) => {
    if (accessType === "FREE") {
      return "badge rounded-pill bg-success-subtle text-success";
    }

    if (accessType === "PAID") {
      return "badge rounded-pill bg-info-subtle text-info";
    }

    return "badge rounded-pill bg-secondary-subtle text-secondary";
  };

  return (
    <div className="admin-course-list-page">
      <div className="admin-page-heading">
        <div>
          <h2>Quản lý khóa học</h2>
          <p>
            Admin xem danh sách khóa học trong hệ thống, lọc theo trạng thái và
            kiểm tra các khóa học đang chờ duyệt.
          </p>
        </div>

        <button className="btn btn-outline-secondary" onClick={loadCourses}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      <div className="admin-filter-card">
        <form onSubmit={handleSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-lg-5 col-md-6">
              <label className="form-label fw-semibold">
                Tìm kiếm
              </label>

              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên khóa học hoặc tên giáo viên..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <label className="form-label fw-semibold">
                Trạng thái khóa học
              </label>

              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Draft">Draft - Bản nháp</option>
                <option value="Pending">Pending - Chờ duyệt</option>
                <option value="Published">Published - Đã duyệt</option>
                <option value="Rejected">Rejected - Từ chối</option>
                <option value="Hidden">Hidden - Đã ẩn</option>
                <option value="Deleted">Deleted - Đã xóa</option>
              </select>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="d-flex gap-2 flex-wrap">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-search me-1"></i>
                  Tìm kiếm
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={handleReset}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Xóa lọc
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="admin-table-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0 fw-bold">Danh sách khóa học</h5>
            <small className="text-muted">
              Tìm thấy {courses.length} khóa học
            </small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle admin-course-table">
            <thead className="table-light">
              <tr>
                <th>Tên khóa học</th>
                <th>Giáo viên</th>
                <th>Cấp độ</th>
                <th>Loại khóa học</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Ngày gửi duyệt</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải danh sách khóa học...
                  </td>
                </tr>
              )}

              {!loading &&
                courses.map((course) => (
                  <tr key={course.courseId}>
                    <td>
                      <div className="course-title-cell">
                        <strong>{course.title}</strong>
                        <span>ID: {course.courseId}</span>
                      </div>
                    </td>

                    <td>{course.teacherName || "--"}</td>

                    <td>
                      <span className="badge rounded-pill bg-primary-subtle text-primary">
                        {course.levelName || "--"}
                      </span>
                    </td>

                    <td>
                      <span className={getAccessTypeBadge(course.accessType)}>
                        {course.accessType || "--"}
                      </span>
                    </td>

                    <td className="fw-semibold">
                      {formatPrice(course.price)}
                    </td>

                    <td>
                      <span className={getStatusBadge(course.status)}>
                        {course.status}
                      </span>
                    </td>

                    <td>{formatDateTime(course.createdAt)}</td>

                    <td>{formatDateTime(course.submittedAt)}</td>

                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            navigate(`/admin/courses/${course.courseId}/review`)
                          }
                        >
                          Xem
                        </button>

                        
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && courses.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-5">
                    Không có khóa học phù hợp với điều kiện tìm kiếm.
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

export default AdminCourseList;