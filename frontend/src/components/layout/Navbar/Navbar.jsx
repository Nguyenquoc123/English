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
];

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserFromToken);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { setUser(getUserFromToken()); }, []);

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
    setCartCount(0);
    navigate('/dang-nhap');
  };

  const closeAll = () => { setDropdownOpen(false); setMobileOpen(false); };

  const isTeacher = user?.role?.includes('teacher');
  const isAdmin = user?.role?.includes('admin');
  const isStudent = user && !isTeacher && !isAdmin;
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';
  const roleLabel = isAdmin ? 'Quản trị viên' : isTeacher ? 'Giáo viên' : 'Học viên';

  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/gio-hang/khoa-hoc', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setCartCount(0);
        return;
      }

      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items || [];

      setCartCount(items.length);
    } catch (err) {
      console.error(err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleCartChanged = () => {
      fetchCartCount();
    };

    window.addEventListener('cartChanged', handleCartChanged);

    return () => {
      window.removeEventListener('cartChanged', handleCartChanged);
    };
  }, []);


  return (
    <header className="nb-header">
      <div className="nb-container">

        <Link to="/" className="nb-logo" onClick={closeAll}>
          <span className="nb-logo-icon"><i className="bi bi-mortarboard-fill" /></span>
          <span className="nb-logo-text">English<span>LMS</span></span>
        </Link>

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
                  <Link to="/gio-hang" className="nb-mobile-link" onClick={closeAll}>
                    <i className="bi bi-cart3" /> Giỏ hàng
                    {cartCount > 0 && (
                      <span className="nb-cart-mobile-badge">{cartCount}</span>
                    )}
                  </Link>
                  <div className="nb-mobile-divider" />
                  <Link to="/student/profile" className="nb-mobile-link" onClick={closeAll}>
                    <i className="bi bi-person" /> Hồ sơ cá nhân
                  </Link>
                  <Link to="/student/change-password" className="nb-mobile-link" onClick={closeAll}>
                    <i className="bi bi-key" /> Đổi mật khẩu
                  </Link>
                  {/* {isStudent && (
                    <Link to="/student/khoa-hoc-da-mua" className="nb-mobile-link" onClick={closeAll}>
                      <i className="bi bi-journal-bookmark" /> Khóa học đã mua
                    </Link>
                  )} */}
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

        {/* ── Cart desktop ── */}
        <Link to="/gio-hang" className="nb-cart" onClick={closeAll} aria-label="Giỏ hàng">
          <i className="bi bi-cart3" />

          {cartCount > 0 && (
            <span className="nb-cart-badge">{cartCount}</span>
          )}
        </Link>
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
                  <div className="nb-dropdown-header">
                    <span className="nb-avatar nb-avatar-lg">{initials}</span>
                    <div>
                      <div className="nb-dropdown-name">{user.username}</div>
                      <div className="nb-dropdown-role">{roleLabel}</div>
                    </div>
                  </div>
                  <div className="nb-dropdown-divider" />

                  <p className="nb-dropdown-section">Tài khoản</p>
                  <Link to="/student/profile" className="nb-dropdown-item" onClick={closeAll}>
                    <i className="bi bi-person" /> Hồ sơ cá nhân
                  </Link>

                  {/* <Link to="/khoa-hoc-da-mua" className="nb-dropdown-item" onClick={closeAll}>
                    <i className="bi bi-journal-bookmark" /> Khóa học đã mua
                  </Link> */}

                  <Link to="/student/change-password" className="nb-dropdown-item" onClick={closeAll}>
                    <i className="bi bi-key" /> Đổi mật khẩu
                  </Link>
                  {isStudent && (
                    <Link to="/khoa-hoc-da-mua" className="nb-dropdown-item" onClick={closeAll}>
                      <i className="bi bi-journal-bookmark" /> Khóa học đã mua
                    </Link>
                  )}

                  <Link
                    to="/personal-practices"
                    className="nb-dropdown-item"
                    onClick={closeAll}
                  >
                    <i className="bi bi-journal-check" /> Bài ôn tập cá nhân
                  </Link>

                  <Link
                    to="/lich-su-lam-bai"
                    className="nb-dropdown-item"
                    onClick={closeAll}
                  >
                    <i className="bi bi-clock-history" /> Lịch sử làm bài
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
