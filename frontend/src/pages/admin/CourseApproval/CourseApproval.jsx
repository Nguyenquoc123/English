import { useEffect, useState } from "react";
import {
  getPendingCourses,
  getAllAdminCourses,
  approveCourse,
  rejectCourse,
} from "../../../api/adminApi";
import "./CourseApproval.css";

function CourseApproval() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = tab === "pending"
        ? await getPendingCourses()
        : await getAllAdminCourses();

      setCourses(res.data || []);
    } catch {
      setError("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    const ok = window.confirm("Duyệt khoá học này?");
    if (!ok) return;

    try {
      setActionLoading(true);

      await approveCourse(courseId);

      setSelected(null);
      setRejectReason("");
      loadData();
    } catch {
      alert("Duyệt thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (courseId) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    const ok = window.confirm("Từ chối khoá học này?");
    if (!ok) return;

    try {
      setActionLoading(true);

      await rejectCourse(courseId, rejectReason);

      setSelected(null);
      setRejectReason("");
      loadData();
    } catch {
      alert("Từ chối thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "PENDING") return "badge rounded-pill text-bg-warning";
    if (status === "APPROVED") return "badge rounded-pill text-bg-success";
    if (status === "REJECTED") return "badge rounded-pill text-bg-danger";
    return "badge rounded-pill text-bg-secondary";
  };

  const formatPrice = (price) => {
    if (!price || Number(price) === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="admin-course-approval-page">
      <div className="admin-page-heading">
        <div>
          <h2>Duyệt khoá học</h2>
          <p>
            Admin xét duyệt khóa học do giáo viên tạo, chấp thuận hoặc từ chối với lý do cụ thể.
          </p>
        </div>

        <button className="btn btn-outline-secondary" onClick={loadData}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      <div className="admin-filter-card">
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${tab === "pending" ? "btn-warning" : "btn-outline-secondary"}`}
            onClick={() => setTab("pending")}
          >
            <i className="bi bi-hourglass-split me-1"></i>
            Chờ duyệt
          </button>

          <button
            className={`btn btn-sm ${tab === "all" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setTab("all")}
          >
            <i className="bi bi-list-ul me-1"></i>
            Tất cả
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải danh sách khóa học...</div>
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="admin-table-card text-center text-muted py-5">
          Không có khoá học nào.
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="course-approval-grid">
          {courses.map((course) => (
            <div className="admin-table-card course-approval-card" key={course.courseId}>
              <div className="course-approval-thumb">
                {course.thumbnailUrl ? (
                  <img
                    src={`http://localhost:8080/${course.thumbnailUrl}`}
                    alt={course.title}
                  />
                ) : (
                  <div className="course-thumb-placeholder">
                    <i className="bi bi-journal-bookmark"></i>
                  </div>
                )}

                <span className={`${getStatusBadge(course.status)} course-status-badge`}>
                  {course.status}
                </span>
              </div>

              <div className="mt-2">
                <h6 className="fw-bold mb-1">{course.title}</h6>

                <div className="text-muted small mb-1">
                  <i className="bi bi-person me-1"></i>
                  {course.teacherName || "--"}
                </div>

                <div className="text-muted small mb-1">
                  <i className="bi bi-bar-chart me-1"></i>
                  {course.levelName || "--"}
                </div>

                <div className="fw-semibold small mb-2">{formatPrice(course.price)}</div>

                <div className="text-muted small mb-2 course-approval-desc">
                  {course.description || "--"}
                </div>

                {course.rejectReason && (
                  <div className="alert alert-danger py-2 small mb-2">
                    Lý do từ chối: {course.rejectReason}
                  </div>
                )}

                {course.status === "PENDING" && (
                  <div>
                    {selected === course.courseId ? (
                      <div>
                        <textarea
                          className="form-control form-control-sm mb-2"
                          placeholder="Lý do từ chối..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                        />
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={actionLoading}
                            onClick={() => handleReject(course.courseId)}
                          >
                            {actionLoading ? "..." : "Xác nhận từ chối"}
                          </button>

                          <button
                            className="btn btn-sm btn-light"
                            onClick={() => {
                              setSelected(null);
                              setRejectReason("");
                            }}
                          >
                            Huỷ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-success"
                          disabled={actionLoading}
                          onClick={() => handleApprove(course.courseId)}
                        >
                          Duyệt
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setSelected(course.courseId);
                            setRejectReason("");
                          }}
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseApproval;
