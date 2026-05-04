import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo - bên trái */}
        <Link to="/" className="navbar-logo">
          English LMS
        </Link>

        {/* Menu - chính giữa */}
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
            to="/courses"
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

        {/* Auth - bên phải */}
        <div className="navbar-auth">
          {token ? (
            <>
              <Link to="/profile" className="navbar-btn-text">Hồ sơ</Link>
              <button className="navbar-btn-primary" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="navbar-btn-text">Đăng nhập</Link>
              <Link to="/register" className="navbar-btn-primary">Đăng ký</Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
