import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../login/DangNhap.css";

/**
 * DangNhap — Trang đăng nhập chung cho tất cả người dùng:
 *   - Admin    → redirect /admin
 *   - Teacher  → redirect /teacher
 *   - Student  → redirect /danh-sach-khoa-hoc
 *
 * Dùng axios trực tiếp (không phải axiosClient) vì chưa có token lúc đăng nhập.
 */
function Login() {
  const [taiKhoan, setTaiKhoan] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!taiKhoan.trim()) {
      setError("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/login", {
        taiKhoan: taiKhoan.trim(),
        password: password.trim(),
      });

      const { token, role } = response.data;

      // Lưu token để axiosClient tự gắn vào mọi request sau
      if (token) {
        localStorage.setItem("token", token);
      }

      // Redirect theo role — replace để không back về trang login
      if (role?.toLowerCase() === "admin") {
        navigate("/admin", { replace: true });
      } else if (role?.toLowerCase() === "teacher") {
        navigate("/teacher", { replace: true });
      } else {
        navigate("/danh-sach-khoa-hoc", { replace: true });
      }

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Đăng nhập thất bại. Kiểm tra lại thông tin.";

      setError(
        typeof message === "string"
          ? message
          : "Đăng nhập thất bại. Kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Bên trái */}
      <div className="login-left">
        <div className="intro-content">
          <h1>Học tiếng Anh thông minh</h1>
          <p className="description">
            Nền tảng học tập, ôn luyện và thi tiếng Anh trực tuyến dành
            <br />
            cho học viên, giáo viên và quản trị viên.
          </p>
          <div className="image-box">
            <img src="/login-illustration.png" alt="Learning English" />
          </div>
        </div>
      </div>

      {/* Bên phải */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="logo">▣ English LMS</h2>
          <h3>Đăng nhập</h3>
          <p className="login-note">
            Vui lòng nhập thông tin tài khoản để tiếp tục
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <div className="input-box">
                <span>👤</span>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={taiKhoan}
                  onChange={(e) => setTaiKhoan(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-box">
                <span>🔒</span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" />
                Ghi nhớ đăng nhập
              </label>
              <a href="/quen-mat-khau">Quên mật khẩu?</a>
            </div>

            {error && <p className="error-message">⚠️ {error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
            </button>
          </form>

          <div className="register-text">
            Chưa có tài khoản? <a href="/dang-ky">Đăng ký</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
