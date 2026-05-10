import { useEffect, useState } from "react";

function AdminDashboard() {
  const API_BASE = "http://localhost:8080";

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    pendingTeachers: 0,
    pendingCourses: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      /*
        API gợi ý:
        GET /admin/dashboard
      */

      const response = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const result = data.result || data.data || data;

      setStats(result);
    } catch (err) {
      console.error("Lỗi tải dashboard admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (number) => {
    if (!number) return "0";
    return Number(number).toLocaleString("vi-VN");
  };

  const formatPrice = (price) => {
    if (!price) return "0 VNĐ";
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary mb-3"></div>
        <div>Đang tải dashboard...</div>
      </div>
    );
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
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="admin-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-people"></i>
              </div>
              <div>
                <div className="text-muted small">Tổng người dùng</div>
                <h4 className="fw-bold mb-0">{formatNumber(stats.totalUsers)}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="admin-stat-icon bg-success-subtle text-success">
                <i className="bi bi-person-check"></i>
              </div>
              <div>
                <div className="text-muted small">Giáo viên</div>
                <h4 className="fw-bold mb-0">{formatNumber(stats.totalTeachers)}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="admin-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div>
                <div className="text-muted small">GV chờ duyệt</div>
                <h4 className="fw-bold mb-0">{formatNumber(stats.pendingTeachers)}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="admin-stat-icon bg-info-subtle text-info">
                <i className="bi bi-journal-check"></i>
              </div>
              <div>
                <div className="text-muted small">Khóa học chờ duyệt</div>
                <h4 className="fw-bold mb-0">{formatNumber(stats.pendingCourses)}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Tổng khóa học</div>
              <h3 className="fw-bold">{formatNumber(stats.totalCourses)}</h3>
              <p className="text-muted mb-0">Bao gồm khóa học Draft, Pending, Published, Rejected.</p>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Tổng doanh thu</div>
              <h3 className="fw-bold">{formatPrice(stats.totalRevenue)}</h3>
              <p className="text-muted mb-0">Doanh thu toàn hệ thống từ khóa học và kỳ thi.</p>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Rút tiền chờ xử lý</div>
              <h3 className="fw-bold">{formatNumber(stats.pendingWithdrawals)}</h3>
              <p className="text-muted mb-0">Yêu cầu rút tiền đang cần admin duyệt.</p>
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

export default AdminDashboard;