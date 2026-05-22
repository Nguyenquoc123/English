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
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("english_token", data.token);
      }
      const role = data.role?.toLowerCase();
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "teacher") navigate("/teacher/courses", { replace: true });
      else navigate("/danh-sach-khoa-hoc", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === "string" ? msg : "Sai tên đăng nhập hoặc mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dn-page auth-split-page">

      <div className="dn-left auth-split-left">
        <img src={anhNen} alt="English LMS" className="dn-left-img auth-split-img" />
      </div>

      <div className="dn-right auth-split-right">
        <div className="dn-card">

          <Link to="/" className="dn-back">
            <i className="bi bi-arrow-left" /> Trang chủ
          </Link>

          <div className="dn-card-logo">
            <span className="dn-logo-icon-sm">
              <i className="bi bi-mortarboard-fill" />
            </span>
            <span className="dn-logo-text-sm">English<b>LMS</b></span>
          </div>

          <h2 className="dn-card-title">Đăng nhập</h2>
          <p className="dn-card-sub">Vui lòng đăng nhập để tiếp tục</p>

          <form onSubmit={handleLogin} noValidate>

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

            <label className="dn-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            {error && (
              <div className="dn-error">
                <i className="bi bi-exclamation-circle-fill" />
                {error}
              </div>
            )}

            <button type="submit" className="dn-btn-submit" disabled={loading}>
              {loading
                ? <><span className="dn-spinner" /> Đang đăng nhập...</>
                : <>Đăng nhập <i className="bi bi-arrow-right" /></>
              }
            </button>
          </form>

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
