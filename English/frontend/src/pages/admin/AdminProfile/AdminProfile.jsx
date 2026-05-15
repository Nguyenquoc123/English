import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getAdminProfile, updateAdminProfile } from "../../../api/adminApi";
import "./AdminProfile.css";

function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAdminProfile();
      setProfile(res.data);
      setFullName(res.data.fullName || "");
      setEmail(res.data.email || "");
    } catch {
      setError("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFullName(profile.fullName || "");
    setEmail(profile.email || "");
    setAvatarFile(null);
    setAvatarPreview(null);
    setSuccess("");
    setError("");
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setError("");
    setSuccess("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh (jpg, png, ...)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh tối đa 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    try {
      setSaving(true);
      const res = await updateAdminProfile(fullName.trim(), email.trim(), avatarFile);
      setProfile(res.data);
      setSuccess("Cập nhật hồ sơ thành công!");
      setEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      const msg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (profile?.avatarUrl) return `http://localhost:8080/${profile.avatarUrl}`;
    return null;
  };

  const getInitial = () => {
    return (profile?.fullName || profile?.username || "A")[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary mb-3"></div>
        <div>Đang tải thông tin hồ sơ...</div>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-page-heading">
        <div>
          <h2>Hồ sơ quản trị viên</h2>
          <p>Xem và cập nhật thông tin cá nhân của tài khoản admin.</p>
        </div>

        <button className="btn btn-outline-secondary" onClick={loadProfile}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2">
          <i className="bi bi-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {profile && (
        <div className="admin-profile-layout">
          {/* Avatar card */}
          <div className="admin-table-card admin-profile-avatar-card">
            <div className="text-center">
              <div className="admin-profile-avatar-wrap">
                {getAvatarSrc() ? (
                  <img
                    className="admin-profile-avatar-img"
                    src={getAvatarSrc()}
                    alt="Avatar"
                  />
                ) : (
                  <div className="admin-profile-avatar-placeholder">
                    {getInitial()}
                  </div>
                )}

                {editMode && (
                  <button
                    type="button"
                    className="admin-profile-avatar-edit-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Đổi ảnh đại diện"
                  >
                    <i className="bi bi-camera"></i>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/*"
                onChange={handleAvatarChange}
              />

              {editMode && (
                <small className="text-muted d-block mt-2">
                  Nhấn icon camera để đổi ảnh đại diện
                </small>
              )}

              <h5 className="fw-bold mt-3 mb-1">{profile.fullName || "--"}</h5>
              <div className="text-muted small mb-2">@{profile.username}</div>

              <span className="badge rounded-pill text-bg-danger px-3 py-2">
                <i className="bi bi-shield-check me-1"></i>
                Admin
              </span>
            </div>

            <hr />

            <div className="admin-profile-meta">
              <div className="admin-profile-meta-item">
                <i className="bi bi-envelope text-muted me-2"></i>
                <span className="text-muted small">{profile.email || "--"}</span>
              </div>
              <div className="admin-profile-meta-item">
                <i className="bi bi-calendar-check text-muted me-2"></i>
                <span className="text-muted small">
                  Tham gia: {formatDateTime(profile.createdAt)}
                </span>
              </div>
              <div className="admin-profile-meta-item">
                <i className="bi bi-clock-history text-muted me-2"></i>
                <span className="text-muted small">
                  Cập nhật: {formatDateTime(profile.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Detail / edit card */}
          <div className="admin-table-card admin-profile-detail-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">
                {editMode ? "Chỉnh sửa thông tin" : "Thông tin tài khoản"}
              </h5>

              {!editMode && (
                <button className="btn btn-primary btn-sm" onClick={handleEdit}>
                  <i className="bi bi-pencil me-1"></i>
                  Chỉnh sửa
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ tên..."
                    maxLength={100}
                    disabled={saving}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email..."
                    disabled={saving}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>
                        Lưu thay đổi
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            ) : (
              <div className="admin-profile-info-grid">
                <div className="admin-profile-info-row">
                  <span className="admin-profile-info-label">
                    <i className="bi bi-person me-2 text-muted"></i>
                    Họ và tên
                  </span>
                  <span className="admin-profile-info-value">
                    {profile.fullName || "--"}
                  </span>
                </div>

                <div className="admin-profile-info-row">
                  <span className="admin-profile-info-label">
                    <i className="bi bi-at me-2 text-muted"></i>
                    Username
                  </span>
                  <span className="admin-profile-info-value">
                    {profile.username || "--"}
                  </span>
                </div>

                <div className="admin-profile-info-row">
                  <span className="admin-profile-info-label">
                    <i className="bi bi-envelope me-2 text-muted"></i>
                    Email
                  </span>
                  <span className="admin-profile-info-value">
                    {profile.email || "--"}
                  </span>
                </div>

                <div className="admin-profile-info-row">
                  <span className="admin-profile-info-label">
                    <i className="bi bi-shield-check me-2 text-muted"></i>
                    Vai trò
                  </span>
                  <span>
                    <span className="badge rounded-pill text-bg-danger">
                      Admin
                    </span>
                  </span>
                </div>

                <div className="admin-profile-info-row">
                  <span className="admin-profile-info-label">
                    <i className="bi bi-toggle-on me-2 text-muted"></i>
                    Trạng thái
                  </span>
                  <span>
                    <span className="badge rounded-pill text-bg-success">
                      Hoạt động
                    </span>
                  </span>
                </div>

                <div className="admin-profile-info-row">
                  <span className="admin-profile-info-label">
                    <i className="bi bi-calendar me-2 text-muted"></i>
                    Ngày tạo tài khoản
                  </span>
                  <span className="admin-profile-info-value">
                    {formatDateTime(profile.createdAt)}
                  </span>
                </div>

                <div className="admin-profile-info-row">
                  <span className="admin-profile-info-label">
                    <i className="bi bi-clock me-2 text-muted"></i>
                    Cập nhật lần cuối
                  </span>
                  <span className="admin-profile-info-value">
                    {formatDateTime(profile.updatedAt)}
                  </span>
                </div>
              </div>
            )}

            {!editMode && (
              <div className="admin-profile-actions mt-4">
                <hr />
                <div className="d-flex gap-2 flex-wrap">
                  <Link to="/admin/change-password" className="btn btn-outline-warning btn-sm">
                    <i className="bi bi-key me-1"></i>
                    Đổi mật khẩu
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;
