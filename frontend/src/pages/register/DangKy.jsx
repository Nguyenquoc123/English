import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import anhNen from "../../assets/anhnen.jpg";
import "./DangKy.css";

function DangKy() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }

    if (!username.trim()) {
      setError("Vui lòng nhập tên đăng nhập");
      return;
    }

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          fullName: fullName,
          email: email,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Đăng ký thất bại");
        return;
      }

      alert("Đăng ký thành công. Vui lòng nhập mã OTP để xác minh tài khoản.");

      navigate("/xac-minh", {
        state: {
          email: email,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page auth-split-page">
      <div className="register-left auth-split-left">
        <img src={anhNen} alt="English LMS" className="register-left-img auth-split-img" />
      </div>

      <div className="register-right auth-split-right">
        <div className="register-card">
          <Link to="/" className="register-back">
            <i className="bi bi-arrow-left" /> Trang chủ
          </Link>

          <div className="register-card-logo">
            <span className="register-logo-icon">
              <i className="bi bi-mortarboard-fill" />
            </span>
            <span className="register-logo-text">
              English<b>LMS</b>
            </span>
          </div>

          <h2 className="register-card-title">Đăng ký tài khoản</h2>
          <p className="register-card-sub">Tạo tài khoản để bắt đầu học tiếng Anh</p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Họ và tên</label>
              <div className="input-box">
                <i className="bi bi-person input-icon" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tên đăng nhập</label>
              <div className="input-box">
                <i className="bi bi-at input-icon" />
                <input
                  type="text"
                  placeholder="username123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-box">
                <i className="bi bi-envelope input-icon" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-box">
                <i className="bi bi-lock input-icon" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nhập lại mật khẩu</label>
              <div className="input-box">
                <i className="bi bi-lock-fill input-icon" />
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="register-submit" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <p className="login-text">
            Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DangKy;
