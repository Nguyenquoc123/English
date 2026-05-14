import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/dang-nhap');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">

          {/* Left */}
          <div className="navbar-left">
            <button className="navbar-menu-btn" onClick={toggleSidebar}>
              ☰
            </button>

            <Link to="/" className="navbar-logo">
              English LMS
            </Link>
          </div>

          {/* Menu giữa */}
          <nav className="navbar-menu">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
              }
            >
              Trang chủ
            </NavLink>

            <NavLink
              to="/danh-sach-khoa-hoc"
              className={({ isActive }) =>
                isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
              }
            >
              Khoá học
            </NavLink>

            <NavLink
              to="/free-lessons"
              className={({ isActive }) =>
                isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
              }
            >
              Lesson miễn phí
            </NavLink>

            <NavLink
              to="/exams"
              className={({ isActive }) =>
                isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
              }
            >
              Kỳ thi
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
              }
            >
              Liên hệ
            </NavLink>
          </nav>

          {/* Right */}
          <div className="navbar-auth">
            {token ? (
              <>
                <Link to="/student/profile" className="navbar-btn-text">
                  Hồ sơ
                </Link>

                <button
                  className="navbar-btn-primary"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/dang-nhap" className="navbar-btn-text">
                  Đăng nhập
                </Link>

                <Link to="/dang-ky" className="navbar-btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>

        <div className="sidebar-header">
          <h3>Menu</h3>

          <button
            className="sidebar-close-btn"
            onClick={closeSidebar}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/" onClick={closeSidebar}>
            Trang chủ
          </NavLink>

          <NavLink to="/danh-sach-khoa-hoc" onClick={closeSidebar}>
            Khoá học của tôi
          </NavLink>

          <NavLink to="/lich-su-on-tap" onClick={closeSidebar}>
            Lịch sử làm bài ôn tập
          </NavLink>

          <NavLink to="/exams" onClick={closeSidebar}>
            Lịch sử thi
          </NavLink>

          <NavLink to="/contact" onClick={closeSidebar}>
            Liên hệ
          </NavLink>
        </nav>

      </aside>
    </>
  );
}