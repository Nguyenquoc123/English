import { useState } from "react";
import "../login/DangNhap.css";

function Login() {
  // Lưu dữ liệu người dùng nhập
  const [taiKhoan, setTaiKhoan] = useState("");
  const [password, setPassword] = useState("");

  // Lưu trạng thái loading và thông báo lỗi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Hàm xử lý khi bấm nút Đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault(); // Chặn reload trang

    setError("");

    if (!taiKhoan.trim()) {
      setError("Vui lòng nhập tên đăng nhập");
      return;
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taiKhoan: taiKhoan,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Đăng nhập thất bại");
        return;
      }

      console.log("Kết quả đăng nhập:", data);

      // Giả sử API trả về token
      // Ví dụ: { token: "...", role: "Admin", status: true }
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      alert("Đăng nhập thành công!");

      // Chuyển trang theo role nếu cần
      // Ví dụ:
      // if (data.role === "Admin") {
      //   window.location.href = "/admin";
      // } else if (data.role === "Teacher") {
      //   window.location.href = "/teacher";
      // } else {
      //   window.location.href = "/student";
      // }

    } catch (err) {
      console.error(err);
      setError("Không thể kết nối tới server");
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
            <img
              src="/login-illustration.png"
              alt="Learning English"
            />
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

            {error && <p className="error-message">{error}</p>}

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