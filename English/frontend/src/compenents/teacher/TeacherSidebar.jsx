import { NavLink, useNavigate } from "react-router-dom";
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

        <button className="btn btn-sm btn-light" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="p-3 sidebar-content">
        <p className="sidebar-title">Tài khoản</p>

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

        <p className="sidebar-title">Nội dung học</p>

        <NavLink to="/teacher/lessons" className="sidebar-link" onClick={onClose}>
          <i className="bi bi-file-earmark-text"></i>
          Quản lý lesson
        </NavLink>

        <NavLink to="/teacher/videos" className="sidebar-link" onClick={onClose}>
          <i className="bi bi-camera-video"></i>
          Video bài học
        </NavLink>

        <NavLink
          to="/teacher/vocabularies"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-card-text"></i>
          Từ vựng
        </NavLink>

        <NavLink to="/teacher/grammar" className="sidebar-link" onClick={onClose}>
          <i className="bi bi-pencil-square"></i>
          Ngữ pháp
        </NavLink>

        <NavLink
          to="/teacher/practice-questions"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-question-circle"></i>
          Câu hỏi ôn tập
        </NavLink>

        <p className="sidebar-title">Kỳ thi</p>

        <NavLink to="/teacher/exams" className="sidebar-link" onClick={onClose}>
          <i className="bi bi-clipboard-check"></i>
          Quản lý kỳ thi
        </NavLink>

        <NavLink
          to="/teacher/exam-results"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-bar-chart"></i>
          Kết quả thi
        </NavLink>

        <p className="sidebar-title">Doanh thu</p>

        <NavLink to="/teacher/revenue" className="sidebar-link" onClick={onClose}>
          <i className="bi bi-cash-stack"></i>
          Dashboard doanh thu
        </NavLink>

        <NavLink
          to="/teacher/withdrawals/create"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-wallet2"></i>
          Tạo yêu cầu rút tiền
        </NavLink>

        <NavLink
          to="/teacher/withdrawals"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-clock-history"></i>
          Lịch sử rút tiền
        </NavLink>

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