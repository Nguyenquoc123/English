import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../../api/adminApi";
import {
  getAdminStudentFeedbackTasks,
  reviewAdminStudentFeedbackTask,
} from "../../../api/studentFeedbackApi";
import "./Dashboard.css";

const statCards = [
  {
    key: "totalUsers",
    label: "Tổng người dùng",
    description: "Tài khoản trong hệ thống",
    icon: "bi-people-fill",
    color: "primary",
  },
  {
    key: "totalStudents",
    label: "Học viên",
    description: "Người học đã đăng ký",
    icon: "bi-mortarboard-fill",
    color: "info",
  },
  {
    key: "totalTeachers",
    label: "Giáo viên",
    description: "Tài khoản giảng dạy",
    icon: "bi-person-workspace",
    color: "success",
  },
  {
    key: "totalCourses",
    label: "Khóa học",
    description: "Tổng khóa học hiện có",
    icon: "bi-journal-bookmark-fill",
    color: "warning",
  },
  {
    key: "pendingTeachers",
    label: "Chờ duyệt GV",
    description: "Giáo viên cần xét duyệt",
    icon: "bi-person-exclamation",
    color: "danger",
  },
  {
    key: "pendingCourses",
    label: "Chờ duyệt KH",
    description: "Khóa học cần kiểm duyệt",
    icon: "bi-journal-check",
    color: "primary",
  },
  {
    key: "pendingWithdrawals",
    label: "Chờ rút tiền",
    description: "Yêu cầu thanh toán đang chờ",
    icon: "bi-wallet2",
    color: "warning",
  },
];

function Dashboard() {
  const [stats, setStats] = useState({});
  const [feedbackTasks, setFeedbackTasks] = useState([]);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState("OPEN");
  const [reviewingTaskId, setReviewingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPending = useMemo(() => {
    return (
      Number(stats?.pendingTeachers || 0) +
      Number(stats?.pendingCourses || 0) +
      Number(stats?.pendingWithdrawals || 0) +
      Number(stats?.pendingStudentFeedbacks || 0) +
      Number(stats?.pendingRefunds || 0)
    );
  }, [stats]);

  useEffect(() => {
    loadDashboard();
    loadFeedbackTasks("OPEN");
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getDashboard();
      setStats(res.data || {});
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbackTasks = async (status = feedbackStatusFilter) => {
    try {
      const res = await getAdminStudentFeedbackTasks(status);
      setFeedbackTasks(res.data || []);
    } catch (err) {
      console.error("Lỗi tải feedback học viên:", err);
    }
  };

  const handleReviewFeedback = async (taskId, status) => {
    try {
      setReviewingTaskId(taskId);
      await reviewAdminStudentFeedbackTask(taskId, status, "");
      await Promise.all([loadDashboard(), loadFeedbackTasks()]);
    } catch (err) {
      console.error(err);
      alert("Cập nhật trạng thái feedback thất bại.");
    } finally {
      setReviewingTaskId(null);
    }
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price || 0));
  };

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-primary mb-3"></div>
        <h6 className="fw-semibold mb-1">Đang tải dashboard</h6>
        <p className="text-muted mb-0">Vui lòng chờ trong giây lát...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error alert alert-danger border-0 shadow-sm">
        <div className="d-flex align-items-start gap-3">
          <i className="bi bi-exclamation-triangle-fill fs-4"></i>

          <div>
            <h6 className="fw-bold mb-1">Có lỗi xảy ra</h6>
            <p className="mb-3">{error}</p>

            <button className="btn btn-sm btn-danger" onClick={loadDashboard}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Tải lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      

      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="revenue-card">
            <div>
              <div className="revenue-icon">
                <i className="bi bi-cash-stack"></i>
              </div>

              <p className="text-muted mb-1">Tổng doanh thu</p>

              <h2 className="fw-bold mb-2">
                {formatPrice(stats?.totalRevenue)}
              </h2>

              <span className="text-muted">
                Doanh thu toàn hệ thống từ khóa học và kỳ thi.
              </span>
            </div>

            <div className="revenue-art">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="pending-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted mb-1">Công việc cần xử lý</p>
                <h2 className="fw-bold mb-0">{formatNumber(totalPending)}</h2>
              </div>

              <div className="pending-icon">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>

            <div className="pending-list mt-4">
              <div>
                <span>Giáo viên</span>
                <strong>{formatNumber(stats?.pendingTeachers)}</strong>
              </div>

              <div>
                <span>Khóa học</span>
                <strong>{formatNumber(stats?.pendingCourses)}</strong>
              </div>

              <div>
                <span>Rút tiền</span>
                <strong>{formatNumber(stats?.pendingWithdrawals)}</strong>
              </div>

              <div>
                <span>Feedback học viên</span>
                <strong>{formatNumber(stats?.pendingStudentFeedbacks)}</strong>
              </div>

              <div>
                <span>Hoàn tiền</span>
                <strong>
                  <Link to="/admin/refunds" className="text-decoration-none">
                    {formatNumber(stats?.pendingRefunds)}
                  </Link>
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {statCards.map((card) => (
          <div className="col-xl-3 col-lg-4 col-md-6" key={card.key}>
            <div className="admin-stat-card">
              <div className={`admin-stat-icon ${card.color}`}>
                <i className={`bi ${card.icon}`}></i>
              </div>

              <div className="flex-grow-1">
                <p className="text-muted mb-1">{card.label}</p>

                <h4 className="fw-bold mb-1">
                  {formatNumber(stats?.[card.key])}
                </h4>

                <small className="text-muted">{card.description}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-chat-dots me-2 text-primary"></i>
            Feedback học viên cần xử lý
          </h5>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={feedbackStatusFilter}
              onChange={async (e) => {
                const value = e.target.value;
                setFeedbackStatusFilter(value);
                await loadFeedbackTasks(value);
              }}
            >
              <option value="OPEN">Mới gửi</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã xử lý</option>
            </select>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => loadFeedbackTasks()}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
        <div className="card-body">
          {feedbackTasks.length === 0 ? (
            <div className="text-muted">Không có feedback nào trong bộ lọc hiện tại.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Học viên</th>
                    <th>Tiêu đề</th>
                    <th>Nội dung</th>
                    <th>Trạng thái</th>
                    <th>Ngày gửi</th>
                    <th className="text-end">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackTasks.map((item) => (
                    <tr key={item.feedbackTaskId}>
                      <td>
                        <div className="fw-semibold">{item.studentFullName || item.studentUsername}</div>
                        <small className="text-muted">@{item.studentUsername}</small>
                      </td>
                      <td className="fw-semibold">{item.title}</td>
                      <td style={{ maxWidth: 320 }}>
                        {item.content?.length > 120
                          ? `${item.content.slice(0, 120)}...`
                          : item.content}
                      </td>
                      <td>
                        <span className="badge text-bg-light border">{item.status}</span>
                      </td>
                      <td>{formatDateTime(item.createdAt)}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            disabled={reviewingTaskId === item.feedbackTaskId}
                            onClick={() =>
                              handleReviewFeedback(item.feedbackTaskId, "IN_PROGRESS")
                            }
                          >
                            Đang xử lý
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            disabled={reviewingTaskId === item.feedbackTaskId}
                            onClick={() =>
                              handleReviewFeedback(item.feedbackTaskId, "RESOLVED")
                            }
                          >
                            Hoàn tất
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;