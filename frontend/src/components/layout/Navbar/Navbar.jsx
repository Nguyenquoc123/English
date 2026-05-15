import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import './Navbar.css';

function getUserFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.sub || payload.username || 'User',
      role: (payload.scope || payload.role || '').toLowerCase(),
    };
  } catch {
    return null;
  }
}

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/danh-sach-khoa-hoc', label: 'Khoá học' },
  { to: '/free-lessons', label: 'Lesson miễn phí' },
  { to: '/exams', label: 'Kỳ thi' },
  { to: '/contact', label: 'Liên hệ' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserFromToken);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { setUser(getUserFromToken()); }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/dang-nhap');
  };

  const closeAll = () => { setDropdownOpen(false); setMobileOpen(false); };

  const isTeacher  = user?.role?.includes('teacher');
  const isAdmin    = user?.role?.includes('admin');
  const initials   = user?.username?.slice(0, 2).toUpperCase() || 'U';
  const roleLabel  = isAdmin ? 'Quản trị viên' : isTeacher ? 'Giáo viên' : 'Học viên';

  return (
    <header className="nb-header">
      <div className="nb-container">

        {/* ── Logo ── */}
        <Link to="/" className="nb-logo" onClick={closeAll}>
          <span className="nb-logo-icon"><i className="bi bi-mortarboard-fill" /></span>
          <span className="nb-logo-text">English<span>LMS</span></span>
        </Link>

        {/* ── Nav (desktop + mobile dropdown) ── */}
        <nav className={`nb-nav ${mobileOpen ? 'nb-nav-open' : ''}`}>
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => 'nb-link' + (isActive ? ' nb-link-active' : '')}
              onClick={closeAll}
            >
              {label}
            </NavLink>
          ))}


          {/* ── Mobile-only auth section ── */}
          {mobileOpen && (
            <div className="nb-mobile-auth">
              {user ? (
                <>
                  <div className="nb-mobile-user">
                    <span className="nb-avatar">{initials}</span>
                    <div>
                      <div className="nb-mobile-name">{user.username}</div>
                      <div className="nb-mobile-role">{roleLabel}</div>
                    </div>
                  </div>
                  <div className="nb-mobile-divider" />
                  <Link to="/student/profile" className="nb-mobile-link" onClick={closeAll}>
                    <i className="bi bi-person" /> Hồ sơ cá nhân
                  </Link>
                  <Link to="/student/change-password" className="nb-mobile-link" onClick={closeAll}>
                    <i className="bi bi-key" /> Đổi mật khẩu
                  </Link>
                  {!isTeacher && !isAdmin && (
                    <Link to="/student/teacher-register" className="nb-mobile-link" onClick={closeAll}>
                      <i className="bi bi-pencil-square" /> Đăng ký làm giáo viên
                    </Link>
                  )}
                  {isTeacher && (
                    <Link to="/teacher/courses" className="nb-mobile-link" onClick={closeAll}>
                      <i className="bi bi-easel2" /> Trang giáo viên
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" className="nb-mobile-link" onClick={closeAll}>
                      <i className="bi bi-shield-check" /> Trang quản trị
                    </Link>
                  )}
                  <div className="nb-mobile-divider" />
                  <button className="nb-mobile-logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" /> Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/dang-nhap" className="nb-mobile-link" onClick={closeAll}>
                    <i className="bi bi-box-arrow-in-right" /> Đăng nhập
                  </Link>
                  <Link to="/dang-ky" className="nb-mobile-signup" onClick={closeAll}>
                    Đăng ký miễn phí
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>

        {/* ── Auth desktop ── */}
        <div className="nb-auth">
          {user ? (
            <div className="nb-avatar-wrap" ref={dropdownRef}>
              <button
                className="nb-avatar-btn"
                onClick={() => setDropdownOpen(o => !o)}
                aria-expanded={dropdownOpen}
              >
                <span className="nb-avatar">{initials}</span>
                <span className="nb-username">{user.username}</span>
                <i className={`bi bi-chevron-down nb-chevron ${dropdownOpen ? 'nb-chevron-up' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="nb-dropdown">
                  {/* Header */}
                  <div className="nb-dropdown-header">
                    <span className="nb-avatar nb-avatar-lg">{initials}</span>
                    <div>
                      <div className="nb-dropdown-name">{user.username}</div>
                      <div className="nb-dropdown-role">{roleLabel}</div>
                    </div>
                  </div>
                  <div className="nb-dropdown-divider" />

                  {/* Tài khoản */}
                  <p className="nb-dropdown-section">Tài khoản</p>
                  <Link to="/student/profile" className="nb-dropdown-item" onClick={closeAll}>
                    <i className="bi bi-person" /> Hồ sơ cá nhân
                  </Link>
                  <Link to="/student/change-password" className="nb-dropdown-item" onClick={closeAll}>
                    <i className="bi bi-key" /> Đổi mật khẩu
                  </Link>

                  {/* Đăng ký GV (student only) */}
                  {!isTeacher && !isAdmin && (
                    <>
                      <div className="nb-dropdown-divider" />
                      <p className="nb-dropdown-section">Nâng cấp</p>
                      <Link to="/student/teacher-register" className="nb-dropdown-item" onClick={closeAll}>
                        <i className="bi bi-pencil-square" /> Đăng ký làm giáo viên
                      </Link>
                    </>
                  )}

                  {/* Teacher */}
                  {isTeacher && (
                    <>
                      <div className="nb-dropdown-divider" />
                      <p className="nb-dropdown-section">Giáo viên</p>
                      <Link to="/teacher/courses" className="nb-dropdown-item" onClick={closeAll}>
                        <i className="bi bi-easel2" /> Quản lý khoá học
                      </Link>
                      <Link to="/teacher/exams" className="nb-dropdown-item" onClick={closeAll}>
                        <i className="bi bi-file-earmark-text" /> Quản lý kỳ thi
                      </Link>
                    </>
                  )}

                  {/* Admin */}
                  {isAdmin && (
                    <>
                      <div className="nb-dropdown-divider" />
                      <p className="nb-dropdown-section">Quản trị</p>
                      <Link to="/admin" className="nb-dropdown-item" onClick={closeAll}>
                        <i className="bi bi-shield-check" /> Trang quản trị
                      </Link>
                    </>
                  )}

                  <div className="nb-dropdown-divider" />
                  <button className="nb-dropdown-item nb-dropdown-logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nb-guest">
              <Link to="/dang-nhap" className="nb-btn-login">Đăng nhập</Link>
              <Link to="/dang-ky" className="nb-btn-signup">Đăng ký</Link>
            </div>
          )}
        </div>

        {/* ── Hamburger ── */}
        <button
          className={`nb-hamburger ${mobileOpen ? 'nb-hamburger-open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>

      </div>
    </header>
  );
}