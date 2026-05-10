import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    const ok = window.confirm("Bạn có chắc muốn đăng xuất không?");
    if (!ok) return;

    localStorage.removeItem("token");
    localStorage.removeItem("english_token");
    localStorage.removeItem("user");

    onClose();

    navigate("/dang-nhap");
  };

  return (
    <aside className={`admin-sidebar bg-white shadow-lg ${isOpen ? "show" : ""}`}>
      <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="admin-logo-box">
            <i className="bi bi-shield-check"></i>
          </div>

          <div>
            <h5 className="mb-0 text-primary fw-bold">English LMS</h5>
            <small className="text-muted">Admin Panel</small>
          </div>
        </div>

        <button className="btn btn-sm btn-light" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="p-3">
        <p className="admin-sidebar-title">Tổng quan</p>

        <NavLink to="/admin/dashboard" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-speedometer2"></i>
          Dashboard Admin
        </NavLink>

        <p className="admin-sidebar-title">Người dùng</p>

        <NavLink to="/admin/users" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-people"></i>
          Danh sách user
        </NavLink>

        <NavLink to="/admin/users/statistics" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-person-lines-fill"></i>
          Thống kê người dùng
        </NavLink>

        <p className="admin-sidebar-title">Duyệt giáo viên</p>

        <NavLink to="/admin/teacher-profiles/pending" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-person-check"></i>
          Hồ sơ GV chờ duyệt
        </NavLink>

        <p className="admin-sidebar-title">Duyệt khóa học</p>

        <NavLink to="/admin/courses/pending" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-journal-check"></i>
          Khóa học chờ duyệt
        </NavLink>

        <NavLink to="/admin/courses" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-journal-bookmark"></i>
          Quản lý khóa học
        </NavLink>

        <NavLink to="/admin/courses/statistics" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-bar-chart"></i>
          Thống kê khóa học
        </NavLink>

        <p className="admin-sidebar-title">Rút tiền</p>

        <NavLink to="/admin/withdrawals" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-wallet2"></i>
          Yêu cầu rút tiền
        </NavLink>

        <p className="admin-sidebar-title">Thông báo</p>

        <NavLink to="/admin/notifications/create" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-send"></i>
          Tạo thông báo
        </NavLink>

        <NavLink to="/admin/notifications" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-clock-history"></i>
          Lịch sử thông báo
        </NavLink>

        <p className="admin-sidebar-title">Học liệu hệ thống</p>

        <NavLink to="/admin/vocabularies/import" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-file-earmark-excel"></i>
          Import từ vựng Excel
        </NavLink>

        <NavLink to="/admin/flashcard-sets" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-collection"></i>
          Bộ Flashcard hệ thống
        </NavLink>

        <p className="admin-sidebar-title">Báo cáo</p>

        <NavLink to="/admin/revenue-reports" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-cash-stack"></i>
          Báo cáo doanh thu
        </NavLink>

        <NavLink to="/admin/reports/export" className="admin-sidebar-link" onClick={onClose}>
          <i className="bi bi-file-earmark-arrow-down"></i>
          Xuất Excel / PDF
        </NavLink>

        <p className="admin-sidebar-title">Hệ thống</p>

        <button
          type="button"
          className="admin-sidebar-link admin-logout-link"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;