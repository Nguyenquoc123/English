import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DangNhap.css";
import anhNen from "../../assets/anhnen.jpg";

function Login() {
  const [taiKhoan, setTaiKhoan] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!taiKhoan.trim()) { setError("Vui lòng nhập tên đăng nhập"); return; }
    if (!password.trim()) { setError("Vui lòng nhập mật khẩu"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:8080/login", {
        taiKhoan: taiKhoan.trim(),
        password: password.trim(),
      });
      if (data.token) localStorage.setItem("token", data.token);
      const role = data.role?.toLowerCase();
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "teacher") navigate("/teacher", { replace: true });
      else navigate("/danh-sach-khoa-hoc", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === "string" ? msg : "Sai tên đăng nhập hoặc mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dn-page">

      {/* ══ BÊN TRÁI ══ */}
      <div className="dn-left">
        <img src={anhNen} alt="English LMS" className="dn-left-img" />
      </div>

      {/* ══ BÊN PHẢI ══ */}
      <div className="dn-right">
        <div className="dn-card">

          {/* Back button */}
          <Link to="/" className="dn-back">
            <i className="bi bi-arrow-left" /> Trang chủ
          </Link>

          {/* Card logo */}
          <div className="dn-card-logo">
            <span className="dn-logo-icon-sm">
              <i className="bi bi-mortarboard-fill" />
            </span>
            <span className="dn-logo-text-sm">English<b>LMS</b></span>
          </div>

          <h2 className="dn-card-title">Đăng nhập</h2>
          <p className="dn-card-sub">Vui lòng đăng nhập để tiếp tục</p>

          <form onSubmit={handleLogin} noValidate>

            {/* Username */}
            <div className="dn-field">
              <label className="dn-label">Tên đăng nhập</label>
              <div className={`dn-input-wrap ${error && !taiKhoan ? 'dn-input-err' : ''}`}>
                <i className="bi bi-person dn-input-icon" />
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={taiKhoan}
                  onChange={e => setTaiKhoan(e.target.value)}
                  disabled={loading}
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="dn-field">
              <div className="dn-label-row">
                <label className="dn-label">Mật khẩu</label>
                <Link to="/quen-mat-khau" className="dn-forgot">Quên mật khẩu?</Link>
              </div>
              <div className={`dn-input-wrap ${error && !password ? 'dn-input-err' : ''}`}>
                <i className="bi bi-lock dn-input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="dn-eye"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="dn-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            {/* Error */}
            {error && (
              <div className="dn-error">
                <i className="bi bi-exclamation-circle-fill" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="dn-btn-submit" disabled={loading}>
              {loading
                ? <><span className="dn-spinner" /> Đang đăng nhập...</>
                : <>Đăng nhập <i className="bi bi-arrow-right" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="dn-divider"><span>Hoặc</span></div>

          {/* Google */}
          <button type="button" className="dn-btn-google" disabled>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.46 3.1 29.53 1 24 1 14.82 1 6.97 6.48 3.32 14.36l7.1 5.52C12.18 13.5 17.6 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.97-2.2 5.48-4.67 7.17l7.18 5.57C43.44 37.3 46.52 31.36 46.52 24.5z" />
              <path fill="#FBBC05" d="M10.42 28.12A14.6 14.6 0 0 1 9.5 24c0-1.43.2-2.82.55-4.12l-7.1-5.52A23.94 23.94 0 0 0 0 24c0 3.86.93 7.5 2.58 10.72l7.84-6.6z" />
              <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.18-5.57C28.56 37.9 26.4 38.5 24 38.5c-6.4 0-11.82-4-13.58-9.88l-7.84 6.6C6.97 43.52 14.82 47 24 47z" />
            </svg>
            Đăng nhập với Google
          </button>

          {/* Register */}
          <p className="dn-register">
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky">Đăng ký</Link>
          </p>

        </div>

        <div className="dn-right-blob" />
      </div>
    </div>
  );
}

export default Login;
