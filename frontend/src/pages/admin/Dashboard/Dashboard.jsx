import { useEffect, useMemo, useState } from "react";
import { getDashboard } from "../../../api/adminApi";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPending = useMemo(() => {
    return (
      Number(stats?.pendingTeachers || 0) +
      Number(stats?.pendingCourses || 0) +
      Number(stats?.pendingWithdrawals || 0)
    );
  }, [stats]);

  useEffect(() => {
    loadDashboard();
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

  const formatNumber = (value) => {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price || 0));
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
                <p className="text-muted mb-1">Tác vụ đang chờ</p>
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
    </div>
  );
}

export default Dashboard;