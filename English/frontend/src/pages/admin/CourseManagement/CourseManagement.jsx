import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseManagement.css";

function CourseManagement() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  // Tải danh sách khóa học với bộ lọc keyword và status
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (keyword.trim()) params.append("keyword", keyword.trim());
      if (status) params.append("status", status);

      const response = await fetch(
        `http://localhost:8080/khoa-hoc/danh-sach-khoa-hoc?${params.toString()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Không thể tải danh sách khóa học");
        return;
      }

      const result = data.result || data.data || data;
      setCourses(Array.isArray(result) ? result : []);
    } catch {
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
    setTimeout(() => loadCourses(), 0);
  };

  // Badge màu theo trạng thái khóa học
  const getStatusBadge = (statusValue) => {
    const map = {
      Draft: "badge rounded-pill text-bg-secondary",
      Pending: "badge rounded-pill text-bg-warning",
      Published: "badge rounded-pill text-bg-success",
      Rejected: "badge rounded-pill text-bg-danger",
      Hidden: "badge rounded-pill text-bg-dark",
      Deleted: "badge rounded-pill text-bg-light text-dark",
    };
    return map[statusValue] || "badge rounded-pill text-bg-light";
  };

  const getAccessTypeBadge = (accessType) => {
    if (accessType === "FREE") return "badge rounded-pill bg-success-subtle text-success";
    if (accessType === "PAID") return "badge rounded-pill bg-info-subtle text-info";
    return "badge rounded-pill bg-secondary-subtle text-secondary";
  };

  const formatPrice = (price) => {
    if (!price || Number(price) === 0) return "Miễn phí";
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  return (
    <div className="course-management-page">
      {/* Tiêu đề trang */}
      <div className="admin-page-heading">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: "#0f3c9c" }}>
            Quản lý khóa học
          </h4>
          <p className="text-muted mb-0">
            Xem danh sách khóa học, lọc theo trạng thái và kiểm tra các khóa học chờ duyệt.
          </p>
        </div>
        <button className="btn btn-outline-secondary" onClick={loadCourses}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      {/* Bộ lọc tìm kiếm */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
        <form onSubmit={handleSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-lg-5 col-md-6">
              <label className="form-label fw-semibold">Tìm kiếm</label>
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
              <label className="form-label fw-semibold">Trạng thái</label>
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
                <button type="button" className="btn btn-light" onClick={handleReset}>
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

      {/* Bảng danh sách khóa học */}
      <div className="card border-0 shadow-sm rounded-4 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0 fw-bold">Danh sách khóa học</h5>
            <small className="text-muted">Tìm thấy {courses.length} khóa học</small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Tên khóa học</th>
                <th>Giáo viên</th>
                <th>Cấp độ</th>
                <th>Loại</th>
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
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border text-primary">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && courses.map((course) => (
                <tr key={course.courseId}>
                  <td>
                    <div>
                      <strong className="d-block">{course.title}</strong>
                      <small className="text-muted">ID: {course.courseId}</small>
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
                  <td className="fw-semibold">{formatPrice(course.price)}</td>
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
                        onClick={() => navigate(`/admin/courses/${course.courseId}/review`)}
                      >
                        <i className="bi bi-eye me-1"></i>
                        Xem
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && courses.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                      Không có khóa học phù hợp với điều kiện tìm kiếm.
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

export default CourseManagement;
