import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../register/DangKy.css";

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

      // Chuyển sang trang xác minh, gửi kèm email qua state
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
    <div className="register-page">
      <div className="register-left">
        <div className="register-intro">
          <h1>Tạo tài khoản mới</h1>

          <p>
            Tham gia nền tảng học và thi tiếng Anh trực tuyến để học bài,
            luyện tập, làm bài thi và theo dõi tiến độ học tập.
          </p>

          <div className="register-image-box">
            <img src="/register-illustration.png" alt="Register" />
          </div>

          {/* <div className="register-features">
            <div className="register-feature-item">▣ Học mọi lúc mọi nơi</div>
            <div className="register-feature-item">▣ Luyện tập đa dạng</div>
            <div className="register-feature-item">▣ Thi trực tuyến</div>
            <div className="register-feature-item">⌁ Theo dõi tiến độ học tập</div>
            <div className="register-feature-item">◎ Hỗ trợ AI tra từ vựng</div>
          </div> */}
        </div>
      </div>

      <div className="register-right">
        <div className="register-card">
          <h2 className="register-logo">▣ English LMS</h2>

          <h3>Đăng ký tài khoản</h3>

          

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Họ và tên</label>
              <div className="input-box">
                <span>👤</span>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tên đăng nhập</label>
              <div className="input-box">
                <span>◎</span>
                <input
                  type="text"
                  placeholder="username123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-box">
                <span>✉</span>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            <div className="form-group">
              <label>Nhập lại mật khẩu</label>
              <div className="input-box">
                <span>🔒</span>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="login-text">
            Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DangKy;