import { NavLink, useNavigate } from "react-router-dom";
import { STUDENT_HOME_PATH } from "../../utils/authUser";
import "./TeacherSidebar.css";

function TeacherSidebar({ isOpen, onClose }) {
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
    <aside
      className={`teacher-sidebar bg-white shadow-lg ${
        isOpen ? "show" : ""
      }`}
    >
      <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="logo-box">
            <i className="bi bi-book"></i>
          </div>

          <div>
            <h5 className="mb-0 text-primary fw-bold">English LMS</h5>
            <small className="text-muted">Teacher Panel</small>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-light teacher-sidebar-close"
          onClick={onClose}
          aria-label="Đóng menu"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="p-3 sidebar-content">
        <p className="sidebar-title">Tài khoản</p>

        <NavLink to={STUDENT_HOME_PATH} className="sidebar-link" onClick={onClose}>
          <i className="bi bi-mortarboard"></i>
          Chuyển sang trang học viên
        </NavLink>

        <NavLink to="/teacher/profile" className="sidebar-link" onClick={onClose}>
          <i className="bi bi-person"></i>
          Hồ sơ giáo viên
        </NavLink>

        <NavLink to="/teacher/bank" className="sidebar-link" onClick={onClose}>
          <i className="bi bi-bank"></i>
          Tài khoản ngân hàng
        </NavLink>

        <p className="sidebar-title">Khóa học</p>

        <NavLink to="/teacher/courses" className="sidebar-link" onClick={onClose}>
          <i className="bi bi-journal-bookmark"></i>
          Khóa học của tôi
        </NavLink>

        <NavLink
          to="/teacher/courses/create"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-plus-circle"></i>
          Tạo khóa học
        </NavLink>

        <NavLink
          to="/teacher/questions-bank"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-wallet2"></i>
          Ngân hàng câu hỏi
        </NavLink>

        <p className="sidebar-title">Doanh thu</p>

        <NavLink to="/teacher/revenue" className="sidebar-link" onClick={onClose}>
          <i className="bi bi-cash-stack"></i>
          Dashboard
        </NavLink>

        <NavLink
          to="/teacher/earnings"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-wallet2"></i>
          Số dư
        </NavLink>

        {/* <NavLink
          to="/teacher/withdrawals"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-clock-history"></i>
          Lịch sử rút tiền
        </NavLink> */}

        <p className="sidebar-title">Hệ thống</p>

        <button
          type="button"
          className="sidebar-link logout-link"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

export default TeacherSidebar;
