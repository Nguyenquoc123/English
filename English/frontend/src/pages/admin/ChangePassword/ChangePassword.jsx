import { useState } from "react";
import { changeAdminPassword } from "../../../api/adminApi";
import "./ChangePassword.css";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword === oldPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    try {
      setLoading(true);

      await changeAdminPassword(oldPassword, newPassword, confirmPassword);

      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const backendMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message ||
            "Đổi mật khẩu thất bại. Vui lòng thử lại.";

      setError(typeof backendMsg === "string" ? backendMsg : "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 6) return { label: "Quá ngắn", cls: "bg-secondary" };
    if (newPassword.length < 8) return { label: "Yếu", cls: "bg-danger" };
    if (newPassword.length < 12) return { label: "Trung bình", cls: "bg-warning" };
    return { label: "Mạnh", cls: "bg-success" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="admin-change-password-page">
      <div className="admin-page-heading">
        <div>
          <h2>Đổi mật khẩu quản trị</h2>
          <p>
            Nhập mật khẩu hiện tại để xác thực, sau đó đặt mật khẩu mới.
            Mật khẩu mới phải có ít nhất 6 ký tự.
          </p>
        </div>
      </div>

      <div className="admin-change-password-card">
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2">
            <i className="bi bi-check-circle"></i>
            <span>Đổi mật khẩu thành công! Mật khẩu mới đã được lưu.</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Mật khẩu hiện tại <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                id="oldPassword"
                type={showOld ? "text" : "password"}
                className="form-control"
                placeholder="Nhập mật khẩu hiện tại"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowOld(!showOld)}
                tabIndex={-1}
              >
                <i className={`bi ${showOld ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Mật khẩu mới <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                className="form-control"
                placeholder="Ít nhất 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>

            {strength && (
              <div className="d-flex align-items-center gap-2 mt-2">
                <div className="password-strength-bar flex-grow-1">
                  <div
                    className={`password-strength-fill ${strength.cls}`}
                    style={{
                      width:
                        strength.label === "Quá ngắn" ? "20%" :
                        strength.label === "Yếu" ? "40%" :
                        strength.label === "Trung bình" ? "70%" : "100%",
                    }}
                  ></div>
                </div>
                <small className="text-muted">{strength.label}</small>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Xác nhận mật khẩu mới <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className={`form-control ${
                  confirmPassword && confirmPassword !== newPassword ? "is-invalid" : ""
                }`}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>

            {confirmPassword && confirmPassword !== newPassword && (
              <small className="text-danger mt-1 d-block">Mat khau khong khop</small>
            )}

            {confirmPassword && confirmPassword === newPassword && newPassword.length >= 6 && (
              <small className="text-success mt-1 d-block">Mat khau khop</small>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || newPassword.length < 6}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="bi bi-key me-1"></i>
                Đổi mật khẩu
              </>
            )}
          </button>
        </form>

        <div className="alert alert-light mt-4 mb-0">
          <small>
            <strong>Lưu ý bảo mật:</strong> Sau khi đổi mật khẩu, phiên đăng nhập hiện tại
            vẫn còn hiệu lực cho đến khi JWT hết hạn. Hãy ghi nhớ mật khẩu mới.
          </small>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
