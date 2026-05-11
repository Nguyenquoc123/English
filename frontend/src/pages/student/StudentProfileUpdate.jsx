import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentProfileUpdate.css";
import { getFileUrl } from "../../utils/fileurl";

function StudentProfileUpdate() {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080";

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/hosocanhan`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Không thể tải thông tin hồ sơ");
        return;
      }

      const result = data.result || data.data || data;

      setProfile(result);

      setFormData({
        fullName: result.fullName || "",
        email: result.email || "",
      });

      if (result.avatarUrl) {
        setAvatarPreview(getFileUrl(result.avatarUrl));
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  

  const getInitialName = () => {
    const name = formData.fullName || profile?.fullName;

    if (!name) return "HV";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  const getRoleText = (role) => {
    const value = String(role || "").toLowerCase();

    if (value === "student") return "Học viên";
    if (value === "teacher") return "Giáo viên";
    if (value === "admin") return "Quản trị viên";

    return role || "--";
  };

  const getStatusBadge = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "active") {
      return "profile-update-badge badge-active";
    }

    if (value === "locked" || value === "blocked") {
      return "profile-update-badge badge-locked";
    }

    if (value === "pending") {
      return "profile-update-badge badge-pending";
    }

    return "profile-update-badge badge-muted";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ảnh đại diện không được vượt quá 5MB");
      return;
    }

    setAvatarFile(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert("Họ và tên không được để trống");
      return false;
    }

    if (formData.fullName.trim().length < 2) {
      alert("Họ và tên phải có ít nhất 2 ký tự");
      return false;
    }

    if (!formData.email.trim()) {
      alert("Email không được để trống");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      alert("Email không hợp lệ");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const submitData = new FormData();

      const requestData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
      };

      submitData.append(
        "data",
        new Blob([JSON.stringify(requestData)], {
          type: "application/json",
        })
      );

      if (avatarFile) {
        submitData.append("avatarFile", avatarFile);
      }

      const response = await fetch(`${API_BASE}/hosocanhan`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Cập nhật hồ sơ thất bại");
        return;
      }

      alert("Cập nhật hồ sơ thành công");

      navigate("/student/profile");
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="student-profile-update-page">
        <div className="profile-update-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-profile-update-page">
        <div className="container">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="student-profile-update-page">
        <div className="container">
          <div className="alert alert-warning">Không tìm thấy hồ sơ cá nhân.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile-update-page">
      <div className="profile-update-container">
        <div className="profile-update-heading">
          <div>
            <h2>Cập nhật hồ sơ cá nhân</h2>
            <p>Quản lý và điều chỉnh thông tin cá nhân của bạn để duy trì hồ sơ học tập tốt nhất.</p>
          </div>

          <button
            type="button"
            className="btn btn-light profile-back-btn"
            onClick={() => navigate("/student/profile")}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="profile-avatar-card">
                <h5>Ảnh đại diện</h5>
                <p>Cập nhật ảnh đại diện để cá nhân hóa tài khoản của bạn.</p>

                <div className="avatar-preview-wrapper">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="avatar-preview-img"
                    />
                  ) : (
                    <div className="avatar-preview-placeholder">
                      {getInitialName()}
                    </div>
                  )}

                  <span className="avatar-status-dot"></span>
                </div>

                <label className="avatar-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    hidden
                  />

                  <div className="upload-icon">
                    <i className="bi bi-cloud-arrow-up"></i>
                  </div>

                  <strong>Chọn ảnh đại diện mới</strong>
                  <span>Hỗ trợ JPG, PNG, JPEG. Kích thước khuyến nghị 400x400px.</span>
                </label>

                <div className="selected-file-text">
                  {avatarFile ? (
                    <>
                      <i className="bi bi-check-circle text-success me-1"></i>
                      {avatarFile.name}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-info-circle me-1"></i>
                      Chưa chọn ảnh mới.
                    </>
                  )}
                </div>

                <div className="avatar-note-box">
                  <strong>Ghi chú:</strong>
                  <span>
                    Ảnh đại diện sẽ hiển thị trên hồ sơ, bình luận và các hoạt động học tập của bạn.
                  </span>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="profile-form-card">
                <div className="profile-form-header">
                  <div>
                    <h5>Thông tin cá nhân</h5>
                    <p>Cập nhật các thông tin cơ bản của tài khoản.</p>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">Họ và tên</label>
                    <div className="input-icon-box">
                      <i className="bi bi-person"></i>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Tên đăng nhập</label>
                    <div className="input-icon-box readonly-box">
                      <i className="bi bi-at"></i>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.username || ""}
                        readOnly
                      />
                      <span className="readonly-label">Readonly</span>
                    </div>
                    <small className="form-hint">Không thể thay đổi tên đăng nhập.</small>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <div className="input-icon-box">
                      <i className="bi bi-envelope"></i>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Vai trò</label>
                    <div className="input-icon-box readonly-box">
                      <i className="bi bi-briefcase"></i>
                      <input
                        type="text"
                        className="form-control"
                        value={getRoleText(profile.role)}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Trạng thái tài khoản</label>
                    <div className="status-readonly-box">
                      <i className="bi bi-shield-check"></i>
                      <span className={getStatusBadge(profile.status)}>
                        {profile.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-warning-box">
                  <i className="bi bi-shield-exclamation"></i>
                  <span>
                    Sau khi cập nhật email, hệ thống có thể yêu cầu xác thực lại email để đảm bảo bảo mật tài khoản.
                  </span>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="btn btn-light profile-action-btn"
                    onClick={() => navigate("/student/profile")}
                    disabled={saving}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Quay lại
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary profile-action-btn save-btn"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentProfileUpdate;