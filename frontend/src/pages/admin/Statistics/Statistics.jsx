import { useState, useEffect } from "react";
import {
  getDashboard,
  getAllTransactions,
  getAllUsers,
  getAllAdminCourses,
} from "../../../api/adminApi";
import "./Statistics.css";

function Statistics() {
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashRes, txRes, userRes, courseRes] = await Promise.all([
        getDashboard(),
        getAllTransactions(),
        getAllUsers(),
        getAllAdminCourses(),
      ]);

      setDashboard(dashRes.data);
      setTransactions(txRes.data || []);
      setUsers(userRes.data || []);
      setCourses(courseRes.data || []);
    } catch {
      setError("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  // ── Helper formatters ──────────────────────────────────────
  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // ── User stats ─────────────────────────────────────────────
  const userStats = {
    total: users.length,
    students: users.filter((u) => u.roleName === "student").length,
    teachers: users.filter((u) => u.roleName === "teacher").length,
    admins: users.filter((u) => u.roleName === "admin").length,
    active: users.filter((u) => u.status === "active").length,
    banned: users.filter((u) => u.status === "banned").length,
    pending: users.filter((u) => u.status === "pending").length,
  };

  // Monthly new users (last 6 months)
  const monthlyUsers = (() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${d.getMonth() + 1}/${d.getFullYear()}`;
      const count = users.filter((u) => {
        if (!u.createdAt) return false;
        const ud = new Date(u.createdAt);
        return ud.getFullYear() === d.getFullYear() && ud.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }
    return months;
  })();

  const maxMonthlyUsers = Math.max(...monthlyUsers.map((m) => m.count), 1);

  // ── Course stats ───────────────────────────────────────────
  const courseStats = {
    total: courses.length,
    published: courses.filter((c) => c.status === "Published").length,
    pending: courses.filter((c) => c.status === "Pending").length,
    rejected: courses.filter((c) => c.status === "Rejected").length,
    draft: courses.filter((c) => c.status === "Draft").length,
    hidden: courses.filter((c) => c.status === "Hidden").length,
    free: courses.filter((c) => c.accessType === "FREE").length,
    paid: courses.filter((c) => c.accessType === "PAID").length,
  };

  const approvalRate = courses.length > 0
    ? Math.round((courseStats.published / (courseStats.published + courseStats.rejected || 1)) * 100)
    : 0;

  // ── Revenue stats ──────────────────────────────────────────
  const successTx = transactions.filter((t) => t.status === "SUCCESS");
  const totalRevenue = successTx.reduce((sum, t) => sum + (t.amount || 0), 0);
  const courseTxRevenue = successTx
    .filter((t) => t.targetType === "COURSE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const examTxRevenue = successTx
    .filter((t) => t.targetType === "EXAM")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Monthly revenue (last 6 months)
  const monthlyRevenue = (() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${d.getMonth() + 1}/${d.getFullYear()}`;
      const amount = successTx
        .filter((t) => {
          if (!t.createdAt) return false;
          const td = new Date(t.createdAt);
          return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
        })
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      months.push({ label, amount });
    }
    return months;
  })();

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

  // Top courses by revenue
  const topCourseRevenue = (() => {
    const map = {};
    successTx
      .filter((t) => t.targetType === "COURSE" && t.targetName)
      .forEach((t) => {
        map[t.targetName] = (map[t.targetName] || 0) + (t.amount || 0);
      });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  })();

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary mb-3"></div>
        <div>Đang tải dữ liệu thống kê...</div>
      </div>
    );
  }

  return (
    <div className="admin-statistics-page">
      <div className="admin-page-heading">
        <div>
          <h2>Thống kê &amp; Báo cáo</h2>
          <p>
            Tổng quan về người dùng, khóa học và doanh thu của hệ thống.
          </p>
        </div>

        <button className="btn btn-outline-secondary" onClick={loadAll}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* ── Overview cards ── */}
      <div className="row g-3 mb-4">
        {[
          { label: "Tổng người dùng", value: dashboard?.totalUsers ?? userStats.total, icon: "bi-people", color: "bg-primary-subtle text-primary" },
          { label: "Học viên", value: dashboard?.totalStudents ?? userStats.students, icon: "bi-person-check", color: "bg-info-subtle text-info" },
          { label: "Giáo viên", value: dashboard?.totalTeachers ?? userStats.teachers, icon: "bi-person-badge", color: "bg-success-subtle text-success" },
          { label: "Tổng khóa học", value: dashboard?.totalCourses ?? courseStats.total, icon: "bi-journal-bookmark", color: "bg-warning-subtle text-warning" },
        ].map((card) => (
          <div className="col-xl-3 col-md-6" key={card.label}>
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`stats-icon ${card.color}`}>
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <div>
                  <div className="text-muted small">{card.label}</div>
                  <h4 className="fw-bold mb-0">{card.value ?? 0}</h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue overview ── */}
      <div className="row g-3 mb-4">
        <div className="col-xl-4 col-md-6">
          <div className="admin-table-card h-100">
            <h6 className="fw-bold text-muted mb-3">
              <i className="bi bi-currency-exchange me-2"></i>
              Tổng doanh thu
            </h6>
            <h3 className="fw-bold text-success">{formatPrice(totalRevenue)}</h3>
            <div className="stats-revenue-breakdown mt-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Từ khóa học</span>
                <span className="fw-semibold">{formatPrice(courseTxRevenue)}</span>
              </div>
              <div className="progress mb-2" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-primary"
                  style={{ width: totalRevenue > 0 ? `${(courseTxRevenue / totalRevenue) * 100}%` : "0%" }}
                ></div>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Từ kỳ thi</span>
                <span className="fw-semibold">{formatPrice(examTxRevenue)}</span>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-info"
                  style={{ width: totalRevenue > 0 ? `${(examTxRevenue / totalRevenue) * 100}%` : "0%" }}
                ></div>
              </div>
            </div>
            <div className="d-flex gap-3 mt-3">
              <small className="text-muted">
                <span className="fw-bold text-success">{successTx.length}</span> GD thành công
              </small>
              <small className="text-muted">
                <span className="fw-bold text-warning">{transactions.filter((t) => t.status === "PENDING").length}</span> đang chờ
              </small>
            </div>
          </div>
        </div>

        <div className="col-xl-8 col-md-6">
          <div className="admin-table-card h-100">
            <h6 className="fw-bold text-muted mb-3">
              <i className="bi bi-graph-up me-2"></i>
              Doanh thu 6 tháng gần nhất
            </h6>
            <div className="stats-bar-chart">
              {monthlyRevenue.map((m) => (
                <div className="stats-bar-item" key={m.label}>
                  <div className="stats-bar-value-label">{formatPrice(m.amount)}</div>
                  <div className="stats-bar-wrap">
                    <div
                      className="stats-bar-fill bg-primary"
                      style={{ height: `${(m.amount / maxMonthlyRevenue) * 100}%` }}
                    ></div>
                  </div>
                  <div className="stats-bar-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── User stats + Course stats ── */}
      <div className="row g-3 mb-4">
        {/* User distribution */}
        <div className="col-xl-4 col-md-6">
          <div className="admin-table-card h-100">
            <h6 className="fw-bold text-muted mb-3">
              <i className="bi bi-pie-chart me-2"></i>
              Phân bố người dùng
            </h6>

            {[
              { label: "Học viên", count: userStats.students, total: userStats.total, cls: "bg-primary" },
              { label: "Giáo viên", count: userStats.teachers, total: userStats.total, cls: "bg-success" },
              { label: "Admin", count: userStats.admins, total: userStats.total, cls: "bg-danger" },
            ].map((item) => (
              <div key={item.label} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small className="fw-semibold">{item.label}</small>
                  <small className="text-muted">
                    {item.count} ({item.total > 0 ? Math.round((item.count / item.total) * 100) : 0}%)
                  </small>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className={`progress-bar ${item.cls}`}
                    style={{ width: item.total > 0 ? `${(item.count / item.total) * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>
            ))}

            <hr />
            <div className="row g-2 text-center">
              <div className="col-4">
                <div className="fw-bold text-success">{userStats.active}</div>
                <small className="text-muted">Hoạt động</small>
              </div>
              <div className="col-4">
                <div className="fw-bold text-danger">{userStats.banned}</div>
                <small className="text-muted">Bị khóa</small>
              </div>
              <div className="col-4">
                <div className="fw-bold text-warning">{userStats.pending}</div>
                <small className="text-muted">Chờ xác minh</small>
              </div>
            </div>
          </div>
        </div>

        {/* New users by month */}
        <div className="col-xl-4 col-md-6">
          <div className="admin-table-card h-100">
            <h6 className="fw-bold text-muted mb-3">
              <i className="bi bi-person-plus me-2"></i>
              Người dùng mới 6 tháng
            </h6>
            <div className="stats-bar-chart">
              {monthlyUsers.map((m) => (
                <div className="stats-bar-item" key={m.label}>
                  <div className="stats-bar-value-label">{m.count}</div>
                  <div className="stats-bar-wrap">
                    <div
                      className="stats-bar-fill bg-info"
                      style={{ height: `${(m.count / maxMonthlyUsers) * 100}%` }}
                    ></div>
                  </div>
                  <div className="stats-bar-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course status breakdown */}
        <div className="col-xl-4 col-md-12">
          <div className="admin-table-card h-100">
            <h6 className="fw-bold text-muted mb-3">
              <i className="bi bi-journal-bookmark me-2"></i>
              Trạng thái khóa học
            </h6>

            {[
              { label: "Đã duyệt (Published)", count: courseStats.published, cls: "bg-success" },
              { label: "Chờ duyệt (Pending)", count: courseStats.pending, cls: "bg-warning" },
              { label: "Bản nháp (Draft)", count: courseStats.draft, cls: "bg-secondary" },
              { label: "Từ chối (Rejected)", count: courseStats.rejected, cls: "bg-danger" },
              { label: "Đã ẩn (Hidden)", count: courseStats.hidden, cls: "bg-dark" },
            ].map((item) => (
              <div key={item.label} className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <small className="fw-semibold">{item.label}</small>
                  <small className="text-muted">
                    {item.count} ({courseStats.total > 0 ? Math.round((item.count / courseStats.total) * 100) : 0}%)
                  </small>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div
                    className={`progress-bar ${item.cls}`}
                    style={{ width: courseStats.total > 0 ? `${(item.count / courseStats.total) * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>
            ))}

            <hr />
            <div className="row g-2 text-center">
              <div className="col-6">
                <div className="fw-bold text-success">{courseStats.free}</div>
                <small className="text-muted">Miễn phí</small>
              </div>
              <div className="col-6">
                <div className="fw-bold text-info">{courseStats.paid}</div>
                <small className="text-muted">Trả phí</small>
              </div>
            </div>
            <div className="text-center mt-2">
              <small className="text-muted">
                Tỷ lệ duyệt: <strong className="text-success">{approvalRate}%</strong>
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top courses by revenue ── */}
      {topCourseRevenue.length > 0 && (
        <div className="admin-table-card mb-4">
          <h6 className="fw-bold text-muted mb-3">
            <i className="bi bi-trophy me-2"></i>
            Top khóa học theo doanh thu
          </h6>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Tên khóa học</th>
                  <th>Doanh thu</th>
                  <th style={{ width: "40%" }}>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {topCourseRevenue.map((c, idx) => (
                  <tr key={c.name}>
                    <td>
                      {idx === 0 && <i className="bi bi-trophy-fill text-warning"></i>}
                      {idx === 1 && <i className="bi bi-trophy-fill text-secondary"></i>}
                      {idx === 2 && <i className="bi bi-trophy-fill" style={{ color: "#cd7f32" }}></i>}
                      {idx > 2 && <span className="text-muted">{idx + 1}</span>}
                    </td>
                    <td className="fw-semibold">{c.name}</td>
                    <td className="fw-bold text-success">{formatPrice(c.amount)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: `${(c.amount / (topCourseRevenue[0]?.amount || 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <small className="text-muted text-nowrap">
                          {Math.round((c.amount / (totalRevenue || 1)) * 100)}%
                        </small>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent transactions ── */}
      <div className="admin-table-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-muted mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Giao dịch gần nhất
          </h6>
          <small className="text-muted">{transactions.length} giao dịch</small>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Học viên</th>
                <th>Sản phẩm</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((t, idx) => (
                <tr key={t.transactionId}>
                  <td>{idx + 1}</td>
                  <td className="fw-semibold">{t.username || "--"}</td>
                  <td>
                    <div className="small">{t.targetName || "--"}</div>
                    <span className={`badge rounded-pill ${t.targetType === "COURSE" ? "bg-primary-subtle text-primary" : "bg-info-subtle text-info"}`}>
                      {t.targetType === "COURSE" ? "Khóa học" : "Kỳ thi"}
                    </span>
                  </td>
                  <td className="fw-bold">{formatPrice(t.amount)}</td>
                  <td>
                    <span className={`badge rounded-pill ${
                      t.status === "SUCCESS" ? "text-bg-success" :
                      t.status === "PENDING" ? "text-bg-warning" :
                      "text-bg-danger"
                    }`}>
                      {t.status === "SUCCESS" ? "Thành công" : t.status === "PENDING" ? "Đang chờ" : "Thất bại"}
                    </span>
                  </td>
                  <td>
                    <small className="text-muted">
                      {t.createdAt ? new Date(t.createdAt).toLocaleString("vi-VN") : "--"}
                    </small>
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    Chưa có giao dịch nào.
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

export default Statistics;
