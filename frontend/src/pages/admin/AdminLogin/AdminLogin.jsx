import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminLogin.css";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("http://localhost:8080/login", {
        taiKhoan: username.trim(),
        password: password.trim(),
      });

      const { token, role } = response.data;

      if (role?.toLowerCase() !== "admin") {
        setError("Tài khoản không có quyền quản trị viên");
        return;
      }

      localStorage.setItem("token", token);
      navigate("/admin", { replace: true });
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
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="text-center mb-4">
          <div className="admin-login-icon-box">
            <i className="bi bi-shield-check"></i>
          </div>
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="text-muted">Đăng nhập vào trang quản trị</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Tên đăng nhập</label>
            <input
              className="form-control"
              type="text"
              placeholder="Nhập tên đăng nhập..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <input
              className="form-control"
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Đăng nhập
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
