import { useEffect, useState } from "react";
import { getDashboard } from "../../../api/adminApi";
import "./Dashboard.css";

const statCards = [
  { key: "totalUsers", label: "Tổng người dùng", icon: "bi-people", color: "bg-primary-subtle text-primary" },
  { key: "totalStudents", label: "Học viên", icon: "bi-person-check", color: "bg-info-subtle text-info" },
  { key: "totalTeachers", label: "Giáo viên", icon: "bi-person-badge", color: "bg-success-subtle text-success" },
  { key: "totalCourses", label: "Khoá học", icon: "bi-journal-bookmark", color: "bg-warning-subtle text-warning" },
  { key: "pendingTeachers", label: "Chờ duyệt GV", icon: "bi-hourglass-split", color: "bg-danger-subtle text-danger" },
  { key: "pendingCourses", label: "Chờ duyệt KH", icon: "bi-journal-check", color: "bg-primary-subtle text-primary" },
  { key: "pendingWithdrawals", label: "Chờ rút tiền", icon: "bi-wallet2", color: "bg-warning-subtle text-warning" },
];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getDashboard();
      setStats(res.data);
    } catch {
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price == null) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary mb-3"></div>
        <div>Đang tải dashboard...</div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Dashboard Admin</h2>
        <p className="text-muted mb-0">
          Tổng quan tình hình người dùng, khóa học, duyệt nội dung và doanh thu.
        </p>
      </div>

      <div className="row g-3">
        {statCards.map((card) => (
          <div className="col-xl-3 col-md-6" key={card.key}>
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`admin-stat-icon ${card.color}`}>
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <div>
                  <div className="text-muted small">{card.label}</div>
                  <h4 className="fw-bold mb-0">{stats?.[card.key] ?? 0}</h4>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Tổng doanh thu</div>
              <h3 className="fw-bold">{formatPrice(stats?.totalRevenue)}</h3>
              <p className="text-muted mb-0">Doanh thu toàn hệ thống từ khóa học và kỳ thi.</p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .admin-stat-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          }
        `}
      </style>
    </div>
  );
}

export default Dashboard;
