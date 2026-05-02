import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../verifyotp/XacMinh.css";

function XacMinh() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromRegister = location.state?.email || "";

  const [email, setEmail] = useState(emailFromRegister);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/xacminh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Xác minh OTP thất bại");
        return;
      }

      alert("Xác minh tài khoản thành công. Vui lòng đăng nhập.");

      navigate("/dang-nhap");
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <h2>▣ English LMS</h2>

        <h3>Xác minh tài khoản</h3>

        <p>
          Vui lòng nhập mã OTP đã được gửi đến email của bạn để kích hoạt tài khoản.
        </p>

        <form onSubmit={handleVerifyOtp}>
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
            <label>Mã OTP</label>
            <div className="input-box">
              <span>🔐</span>
              <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Đang xác minh..." : "Xác minh"}
          </button>
        </form>

        <div className="verify-back">
          <Link to="/dang-nhap">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default XacMinh;