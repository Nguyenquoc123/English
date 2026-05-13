import { NavLink, useNavigate } from "react-router-dom";
import "../../../compenents/admin/AdminSidebar.css";

function OurAdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    const ok = window.confirm("Bạn có chắc muốn đăng xuất không?");
    if (!ok) return;

    localStorage.removeItem("token");
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
            <small className="text-muted">Admin Portal</small>
          </div>
        </div>

        <button className="btn btn-sm btn-light" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="p-3">
        <p className="admin-sidebar-title">Tổng quan</p>
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-speedometer2"></i>
          Dashboard
        </NavLink>

        <p className="admin-sidebar-title">Người dùng</p>
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-people"></i>
          Quản lý người dùng
        </NavLink>

        <p className="admin-sidebar-title">Giáo viên</p>
        <NavLink
          to="/admin/teachers"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-person-check"></i>
          Duyệt giáo viên
        </NavLink>

        <p className="admin-sidebar-title">Khoá học</p>
        <NavLink
          to="/admin/courses"
          end
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-collection"></i>
          Danh sách khóa học
        </NavLink>

        <NavLink
          to="/admin/course-approval"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-journal-check"></i>
          Duyệt khoá học
        </NavLink>

        <p className="admin-sidebar-title">Học liệu</p>
        <NavLink
          to="/admin/lessons-free"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-book"></i>
          Lesson miễn phí
        </NavLink>

        <p className="admin-sidebar-title">Kỳ thi</p>
        <NavLink
          to="/admin/exams"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-file-earmark-text"></i>
          Quản lý kỳ thi
        </NavLink>

        <p className="admin-sidebar-title">Tài chính</p>
        <NavLink
          to="/admin/withdrawals"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-wallet2"></i>
          Rút tiền
        </NavLink>

        <NavLink
          to="/admin/transactions"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-receipt"></i>
          Giao dịch
        </NavLink>

        <p className="admin-sidebar-title">Nội dung</p>
        <NavLink
          to="/admin/reviews"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-star-half"></i>
          Đánh giá khóa học
        </NavLink>

        <p className="admin-sidebar-title">Thông báo</p>
        <NavLink
          to="/admin/notifications"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-bell"></i>
          Thông báo
        </NavLink>

        <p className="admin-sidebar-title">Hệ thống</p>
        <NavLink
          to="/admin/change-password"
          className={({ isActive }) =>
            "admin-sidebar-link" + (isActive ? " active" : "")
          }
          onClick={onClose}
        >
          <i className="bi bi-key"></i>
          Đổi mật khẩu
        </NavLink>

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

export default OurAdminSidebar;
