import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentChangePassword.css";

function StudentChangePassword() {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080";

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [saving, setSaving] = useState(false);

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleShowPassword = (fieldName) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      alert("Vui lòng nhập mật khẩu hiện tại");
      return false;
    }

    if (!formData.newPassword.trim()) {
      alert("Vui lòng nhập mật khẩu mới");
      return false;
    }

    if (formData.newPassword.length < 8) {
      alert("Mật khẩu mới phải có ít nhất 8 ký tự");
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      alert("Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return false;
    }

    if (!formData.confirmPassword.trim()) {
      alert("Vui lòng nhập lại mật khẩu mới");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Mật khẩu nhập lại không khớp");
      return false;
    }

    return true;
  };

  const getPasswordStrength = () => {
    const password = formData.newPassword;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (!password) {
      return {
        text: "Chưa nhập mật khẩu mới",
        className: "strength-empty",
        percent: 0,
      };
    }

    if (score <= 2) {
      return {
        text: "Yếu",
        className: "strength-weak",
        percent: 35,
      };
    }

    if (score <= 4) {
      return {
        text: "Trung bình",
        className: "strength-medium",
        percent: 70,
      };
    }

    return {
      text: "Mạnh",
      className: "strength-strong",
      percent: 100,
    };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const ok = window.confirm("Bạn có chắc muốn đổi mật khẩu không?");
    if (!ok) return;

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        alert("Vui lòng đăng nhập lại");
        navigate("/dang-nhap");
        return;
      }

      /*
        API gợi ý:
        PUT /doi-mat-khau

        Body:
        {
          "currentPassword": "...",
          "newPassword": "...",
          "confirmPassword": "..."
        }
      */

      const response = await fetch(`${API_BASE}/doi-mat-khau`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Đổi mật khẩu thất bại");
        return;
      }

      alert("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");

      localStorage.removeItem("english_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/dang-nhap");
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="student-change-password-page">
      <div className="change-password-container">
        <div className="change-password-heading">
          <div>
            <h2>Đổi mật khẩu</h2>
            <p>Cập nhật mật khẩu mới để bảo vệ tài khoản học viên của bạn.</p>
          </div>

          <button
            type="button"
            className="btn btn-light change-back-btn"
            onClick={() => navigate("/student/profile")}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Quay lại
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <form className="change-password-card" onSubmit={handleSubmit}>
              <div className="change-card-header">
                <div className="change-icon-box">
                  <i className="bi bi-shield-lock"></i>
                </div>

                <div>
                  <h4>Thông tin mật khẩu</h4>
                  <p>Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.</p>
                </div>
              </div>

              <div className="change-form-body">
                <div className="mb-4">
                  <label className="form-label">Mật khẩu hiện tại</label>

                  <div className="password-input-box">
                    <i className="bi bi-lock"></i>

                    <input
                      type={showPassword.currentPassword ? "text" : "password"}
                      className="form-control"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu hiện tại"
                    />

                    <button
                      type="button"
                      className="password-eye-btn"
                      onClick={() => toggleShowPassword("currentPassword")}
                    >
                      <i
                        className={
                          showPassword.currentPassword
                            ? "bi bi-eye-slash"
                            : "bi bi-eye"
                        }
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Mật khẩu mới</label>

                  <div className="password-input-box">
                    <i className="bi bi-lock"></i>

                    <input
                      type={showPassword.newPassword ? "text" : "password"}
                      className="form-control"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu mới"
                    />

                    <button
                      type="button"
                      className="password-eye-btn"
                      onClick={() => toggleShowPassword("newPassword")}
                    >
                      <i
                        className={
                          showPassword.newPassword
                            ? "bi bi-eye-slash"
                            : "bi bi-eye"
                        }
                      ></i>
                    </button>
                  </div>

                  <div className="password-strength mt-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Độ mạnh mật khẩu</span>
                      <strong className={passwordStrength.className}>
                        {passwordStrength.text}
                      </strong>
                    </div>

                    <div className="strength-track">
                      <div
                        className={`strength-bar ${passwordStrength.className}`}
                        style={{ width: `${passwordStrength.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Nhập lại mật khẩu mới</label>

                  <div className="password-input-box">
                    <i className="bi bi-lock"></i>

                    <input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu mới"
                    />

                    <button
                      type="button"
                      className="password-eye-btn"
                      onClick={() => toggleShowPassword("confirmPassword")}
                    >
                      <i
                        className={
                          showPassword.confirmPassword
                            ? "bi bi-eye-slash"
                            : "bi bi-eye"
                        }
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="password-policy-box">
                  <i className="bi bi-info-circle"></i>

                  <div>
                    <strong>Yêu cầu mật khẩu an toàn</strong>
                    <p>
                      Mật khẩu mới nên có ít nhất 8 ký tự, bao gồm chữ hoa,
                      chữ thường, số và ký tự đặc biệt để tăng độ bảo mật.
                    </p>
                  </div>
                </div>
              </div>

              <div className="change-form-footer">
                <button
                  type="button"
                  className="btn btn-light change-action-btn"
                  onClick={() => navigate("/student/profile")}
                  disabled={saving}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Quay lại
                </button>

                <button
                  type="submit"
                  className="btn btn-primary change-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Lưu thay đổi
                      <i className="bi bi-save ms-2"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="col-lg-4">
            <div className="password-guide-card">
              <div className="guide-icon">
                <i className="bi bi-shield-check"></i>
              </div>

              <h5>Bảo vệ tài khoản</h5>

              <p>
                Mật khẩu mạnh giúp bảo vệ thông tin học tập, lịch sử giao dịch
                và quyền truy cập khóa học của bạn.
              </p>

              <ul>
                <li>
                  <i className="bi bi-check-circle"></i>
                  Không dùng lại mật khẩu cũ.
                </li>
                <li>
                  <i className="bi bi-check-circle"></i>
                  Không chia sẻ mật khẩu với người khác.
                </li>
                <li>
                  <i className="bi bi-check-circle"></i>
                  Tránh dùng ngày sinh hoặc tên cá nhân.
                </li>
                <li>
                  <i className="bi bi-check-circle"></i>
                  Đăng xuất khi dùng máy tính công cộng.
                </li>
              </ul>
            </div>

            <div className="password-warning-card mt-4">
              <i className="bi bi-exclamation-triangle"></i>

              <div>
                <h6>Lưu ý</h6>
                <p>
                  Sau khi đổi mật khẩu thành công, bạn sẽ được chuyển về trang
                  đăng nhập để đăng nhập lại bằng mật khẩu mới.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentChangePassword;