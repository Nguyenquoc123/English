import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import "./StudentTeacherRegister.css";
import { getFileUrl } from "../../utils/fileurl";

function StudentTeacherRegister() {
  const navigate = useNavigate();
  const editor = useRef(null);

  const API_BASE = "http://localhost:8080";

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    bio: "",
    experience: "",
  });

  const [certificateFiles, setCertificateFiles] = useState([]);
  const [certificatePreviews, setCertificatePreviews] = useState([]);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  const joditConfig = useMemo(
    () => ({
      readonly: false,
      height: 260,
      placeholder:
        "Nhập kinh nghiệm giảng dạy, quá trình học tập, chứng chỉ, thành tích hoặc các khóa học đã từng phụ trách...",
      toolbarAdaptive: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "link",
        "image",
        "|",
        "align",
        "undo",
        "redo",
      ],
    }),
    []
  );

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      certificatePreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [certificatePreviews]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);

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

      const data = await response.json();
      const result = data.result || data.data || data;

      if (!response.ok) {
        alert(result?.message || "Không thể tải thông tin cá nhân");
        return;
      }

      setProfile(result);
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server");
    } finally {
      setLoadingProfile(false);
    }
  };

  

  const getInitialName = () => {
    if (!profile?.fullName) return "HV";

    const parts = profile.fullName.trim().split(" ");

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

    return role || "Học viên";
  };

  const handleBioChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      bio: e.target.value,
    }));
  };

  const handleExperienceChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      experience: value,
    }));
  };

  const handleCertificateChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const maxFileSize = 5 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const validFiles = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} không hợp lệ. Chỉ hỗ trợ JPG, JPEG, PNG, WEBP.`);
        continue;
      }

      if (file.size > maxFileSize) {
        alert(`File ${file.name} vượt quá 5MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const totalFiles = certificateFiles.length + validFiles.length;

    if (totalFiles > 5) {
      alert("Bạn chỉ được tải tối đa 5 ảnh chứng chỉ.");
      return;
    }

    const newPreviews = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      previewUrl: URL.createObjectURL(file),
    }));

    setCertificateFiles((prev) => [...prev, ...validFiles]);
    setCertificatePreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  const handleRemoveCertificate = (index) => {
    const removedPreview = certificatePreviews[index];

    if (removedPreview?.previewUrl) {
      URL.revokeObjectURL(removedPreview.previewUrl);
    }

    setCertificateFiles((prev) => prev.filter((_, i) => i !== index));
    setCertificatePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (size) => {
    if (!size) return "0 KB";

    const kb = size / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
  };

  const validateForm = () => {
    if (!formData.bio.trim()) {
      alert("Vui lòng nhập giới thiệu bản thân");
      return false;
    }

    if (formData.bio.trim().length < 20) {
      alert("Giới thiệu bản thân nên có ít nhất 20 ký tự");
      return false;
    }

    const plainExperience = stripHtml(formData.experience).trim();

    if (!plainExperience) {
      alert("Vui lòng nhập kinh nghiệm giảng dạy");
      return false;
    }

    if (plainExperience.length < 30) {
      alert("Kinh nghiệm giảng dạy nên có ít nhất 30 ký tự");
      return false;
    }

    if (certificateFiles.length === 0) {
      alert("Vui lòng tải lên ít nhất 1 ảnh chứng chỉ");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const ok = window.confirm("Bạn có chắc muốn gửi hồ sơ đăng ký giáo viên?");
    if (!ok) return;

    try {
      setSubmitting(true);

      const token = getToken();

      if (!token) {
        navigate("/dang-nhap");
        return;
      }

      const submitData = new FormData();

      const requestData = {
        bio: formData.bio.trim(),
        experience: formData.experience,
      };

      submitData.append(
        "data",
        new Blob([JSON.stringify(requestData)], {
          type: "application/json",
        })
      );

      certificateFiles.forEach((file) => {
        submitData.append("certificateFiles", file);
      });

      /*
        API gợi ý:
        POST /teacher-profiles/register
        multipart/form-data:
        - data: JSON { bio, experience }
        - certificateFiles: nhiều ảnh chứng chỉ
      */

      const response = await fetch(`${API_BASE}/teacher-profile/register`, {
        method: "POST",
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
        alert(data?.message || "Gửi hồ sơ đăng ký giáo viên thất bại");
        return;
      }

      alert("Gửi hồ sơ đăng ký giáo viên thành công. Vui lòng chờ admin xét duyệt.");

      navigate("/student/teacher-register/result");
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống khi gửi hồ sơ đăng ký giáo viên");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="teacher-register-page">
        <div className="teacher-register-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải thông tin cá nhân...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-register-page">
      <div className="teacher-register-container">
        <div className="teacher-register-heading">
          <div>
            <button
              type="button"
              className="teacher-register-back-link"
              onClick={() => navigate("/student/profile")}
            >
              <i className="bi bi-arrow-left"></i>
              Quay lại
            </button>

            <h2>Đăng ký trở thành giáo viên</h2>
            <p>
              Hoàn thiện hồ sơ giảng dạy để gửi yêu cầu xét duyệt trở thành giáo viên
              trên hệ thống.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="teacher-register-profile-card">
                <div className="profile-title">
                  <i className="bi bi-person"></i>
                  Thông tin cá nhân
                </div>

                <div className="profile-avatar-wrapper">
                  {profile?.avatarUrl ? (
                    <img
                      src={getFileUrl(profile.avatarUrl)}
                      alt={profile.fullName}
                      className="profile-avatar-img"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {getInitialName()}
                    </div>
                  )}

                  <span className="profile-status-dot"></span>
                </div>

                <h4>{profile?.fullName || "Học viên"}</h4>
                <p>{profile?.email || "email@example.com"}</p>

                <span className="role-badge">{getRoleText(profile?.role)}</span>

                <div className="profile-note">
                  <i className="bi bi-info-circle"></i>
                  <span>
                    Hồ sơ của bạn sẽ được admin xét duyệt trước khi kích hoạt quyền
                    giáo viên.
                  </span>
                </div>
              </div>

              <div className="teacher-register-guide-card mt-4">
                <div className="guide-title">
                  <i className="bi bi-patch-check"></i>
                  Lưu ý khi gửi hồ sơ
                </div>

                <ul>
                  <li>
                    <i className="bi bi-check-circle"></i>
                    Thông tin giới thiệu nên ngắn gọn, tập trung vào chuyên môn.
                  </li>

                  <li>
                    <i className="bi bi-check-circle"></i>
                    Kinh nghiệm nên nêu rõ thời gian và lĩnh vực giảng dạy.
                  </li>

                  <li>
                    <i className="bi bi-check-circle"></i>
                    Chứng chỉ nên rõ nét, đúng chuyên môn tiếng Anh hoặc sư phạm.
                  </li>

                  <li>
                    <i className="bi bi-check-circle"></i>
                    Sau khi gửi, hồ sơ có thể được xét duyệt trong 2-3 ngày làm việc.
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="teacher-register-form-card">
                <div className="form-card-header">
                  <div>
                    <h4>
                      <i className="bi bi-file-earmark-text me-2"></i>
                      Hồ sơ đăng ký giáo viên
                    </h4>
                    <p>Điền thông tin giảng dạy và tải lên chứng chỉ liên quan.</p>
                  </div>

                  <span className="status-pending-badge">
                    Trạng thái: Chưa gửi
                  </span>
                </div>

                <div className="form-section">
                  <label className="form-label">Giới thiệu bản thân</label>

                  <textarea
                    className="form-control bio-textarea"
                    rows="5"
                    value={formData.bio}
                    onChange={handleBioChange}
                    placeholder="Nhập giới thiệu ngắn về bản thân, chuyên môn, phong cách giảng dạy..."
                    maxLength={2000}
                  ></textarea>

                  <div className="text-counter">
                    {formData.bio.length}/2000 ký tự
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Kinh nghiệm giảng dạy</label>

                  <div className="jodit-wrapper">
                    <JoditEditor
                      ref={editor}
                      value={formData.experience}
                      config={joditConfig}
                      onBlur={handleExperienceChange}
                      onChange={() => {}}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Ảnh chứng chỉ</label>

                  <label className="certificate-upload-box">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      multiple
                      hidden
                      onChange={handleCertificateChange}
                    />

                    <div className="upload-cloud-icon">
                      <i className="bi bi-cloud-arrow-up"></i>
                    </div>

                    <strong>Kéo thả chứng chỉ vào đây hoặc click để tải lên</strong>
                    <span>Hỗ trợ JPG, PNG, JPEG, WEBP. Tối đa 5 ảnh, mỗi ảnh dưới 5MB.</span>
                  </label>

                  <div className="certificate-upload-meta">
                    <span>
                      Đã chọn {certificateFiles.length}/5 ảnh chứng chỉ
                    </span>
                  </div>

                  {certificatePreviews.length > 0 && (
                    <div className="certificate-preview-grid">
                      {certificatePreviews.map((item, index) => (
                        <div className="certificate-preview-item" key={item.id}>
                          <div className="certificate-image-box">
                            <img src={item.previewUrl} alt={item.fileName} />

                            <button
                              type="button"
                              className="remove-certificate-btn"
                              onClick={() => handleRemoveCertificate(index)}
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>

                          <div className="certificate-file-info">
                            <strong>{item.fileName}</strong>
                            <span>{formatFileSize(item.fileSize)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="teacher-register-actions">
                  <button
                    type="button"
                    className="btn btn-light action-btn"
                    onClick={() => navigate("/student/profile")}
                    disabled={submitting}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Quay lại
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang gửi hồ sơ...
                      </>
                    ) : (
                      <>
                        Gửi hồ sơ
                        <i className="bi bi-send ms-2"></i>
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

export default StudentTeacherRegister;