import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";
import { getFileUrl } from "../../utils/fileurl";

function StudentProfile() {
    const navigate = useNavigate();

    const API_BASE = "http://localhost:8080";

    const [profile, setProfile] = useState(null);
    const [registered, setRegistered] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    useEffect(() => {
        loadProfile();
        checkProfileTeacher();
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

            /*
              API gợi ý:
              GET /hosocanhan
      
              Response mẫu:
              {
                "userId": 1,
                "fullName": "Nguyễn Văn An",
                "username": "nguyenvanan",
                "email": "nguyenvanan@example.com",
                "avatarUrl": "/images/avatar.jpg",
                "role": "student",
                "status": "Active",
                "createdAt": "2026-04-20T09:30:00",
                "updatedAt": "2026-04-25T18:45:00"
              }
            */

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
                setError(data?.message || "Không thể tải hồ sơ cá nhân");
                return;
            }

            const result = data.result || data.data || data;
            setProfile(result);
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    const checkProfileTeacher = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/dang-nhap");
                return;
            }



            const response = await fetch(`${API_BASE}/teacher-profile/profile-registered`, {
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
                setError(data?.message || "Lỗi hệ thống");
                return;
            }

            const result = data.result || data.data || data;
            setRegistered(Boolean(data));
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };



    const formatDateTime = (value) => {
        if (!value) return "--";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
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
            return "student-profile-badge badge-active";
        }

        if (value === "locked" || value === "blocked") {
            return "student-profile-badge badge-locked";
        }

        if (value === "pending") {
            return "student-profile-badge badge-pending";
        }

        return "student-profile-badge badge-muted";
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

    if (loading) {
        return (
            <div className="student-profile-page">
                <div className="student-profile-loading">
                    <div className="spinner-border text-primary mb-3"></div>
                    <p>Đang tải hồ sơ cá nhân...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-profile-page">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="student-profile-page">
                <div className="alert alert-warning">Không tìm thấy hồ sơ cá nhân.</div>
            </div>
        );
    }

    return (
        <div className="student-profile-page">
            <div className="student-profile-heading">
                <div>
                    <h2>Hồ sơ cá nhân</h2>
                    <p>Xem thông tin tài khoản và quản lý hồ sơ học viên của bạn.</p>
                </div>

                <button
                    type="button"
                    className="btn btn-light student-back-btn"
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay lại
                </button>
            </div>

            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="student-profile-left-card">
                        <div className="student-avatar-wrapper">
                            {profile.avatarUrl ? (
                                <img
                                    src={getFileUrl(profile.avatarUrl)}
                                    alt={profile.fullName}
                                    className="student-profile-avatar"
                                />
                            ) : (
                                <div className="student-profile-avatar avatar-placeholder">
                                    {getInitialName()}
                                </div>
                            )}

                            <span className="online-dot"></span>
                        </div>

                        <h4>{profile.fullName || "Học viên"}</h4>
                        <p className="student-username">@{profile.username || "username"}</p>

                        <div className="student-profile-tags">
                            <span className="student-profile-badge badge-role">
                                {getRoleText(profile.role)}
                            </span>

                            <span className={getStatusBadge(profile.status)}>
                                {profile.status || "Active"}
                            </span>
                        </div>

                        <div className="profile-note-box">
                            <i className="bi bi-info-circle"></i>
                            <p>
                                Bạn có thể cập nhật thông tin cá nhân hoặc đổi mật khẩu để bảo
                                mật tài khoản.
                            </p>
                        </div>
                    </div>

                    <div className="student-security-card">
                        <div className="security-icon">
                            <i className="bi bi-shield-lock"></i>
                        </div>

                        <div>
                            <h5>Bảo mật tài khoản</h5>
                            <p>
                                Hãy đổi mật khẩu định kỳ và không chia sẻ thông tin đăng nhập
                                với người khác.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="student-profile-info-card">
                        <div className="profile-info-header">
                            <div>
                                <h4>Thông tin tài khoản</h4>
                                <p>Các thông tin cơ bản của tài khoản đang đăng nhập.</p>
                            </div>

                            <span className={getStatusBadge(profile.status)}>
                                {profile.status || "Active"}
                            </span>
                        </div>

                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <div className="info-label">
                                    <i className="bi bi-person"></i>
                                    Họ và tên
                                </div>
                                <strong>{profile.fullName || "--"}</strong>
                            </div>

                            <div className="profile-info-item">
                                <div className="info-label">
                                    <i className="bi bi-at"></i>
                                    Tên đăng nhập
                                </div>
                                <strong>{profile.username || "--"}</strong>
                            </div>

                            <div className="profile-info-item">
                                <div className="info-label">
                                    <i className="bi bi-envelope"></i>
                                    Email
                                </div>
                                <strong>{profile.email || "--"}</strong>
                            </div>

                            <div className="profile-info-item">
                                <div className="info-label">
                                    <i className="bi bi-person-badge"></i>
                                    Vai trò
                                </div>
                                <strong>{getRoleText(profile.role)}</strong>
                            </div>

                            <div className="profile-info-item">
                                <div className="info-label">
                                    <i className="bi bi-toggle-on"></i>
                                    Trạng thái tài khoản
                                </div>
                                <strong>
                                    <span className={getStatusBadge(profile.status)}>
                                        {profile.status || "Active"}
                                    </span>
                                </strong>
                            </div>

                            <div className="profile-info-item">
                                <div className="info-label">
                                    <i className="bi bi-calendar-plus"></i>
                                    Ngày tạo tài khoản
                                </div>
                                <strong>{formatDateTime(profile.createdAt)}</strong>
                            </div>

                            <div className="profile-info-item">
                                <div className="info-label">
                                    <i className="bi bi-clock-history"></i>
                                    Ngày cập nhật gần nhất
                                </div>
                                <strong>{formatDateTime(profile.updatedAt)}</strong>
                            </div>
                        </div>

                        <div className="profile-action-area">
                            <button
                                type="button"
                                className="btn btn-primary profile-action-btn"
                                onClick={() => navigate("/student/profile/update")}
                            >
                                <i className="bi bi-pencil me-2"></i>
                                Cập nhật hồ sơ
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-primary profile-action-btn"
                                onClick={() => navigate("/student/change-password")}
                            >
                                <i className="bi bi-lock me-2"></i>
                                Đổi mật khẩu
                            </button>
                            {!registered && <button
                                type="button"
                                className="btn btn-purple profile-action-btn"
                                onClick={() => navigate("/student/teacher-register")}
                            >
                                <i className="bi bi-mortarboard me-2"></i>
                                Đăng ký trở thành giáo viên
                            </button>}
                            {registered && <button
                                type="button"
                                className="btn btn-purple profile-action-btn"
                                onClick={() => navigate("/student/teacher-register/result")}
                            >
                                <i className="bi bi-clipboard-check me-2"></i>
                                Xem kết quả đăng ký
                            </button>}

                        </div>
                    </div>

                    <div className="student-profile-extra-card mt-4">
                        <div className="extra-card-icon">
                            <i className="bi bi-lightbulb"></i>
                        </div>

                        <div>
                            <h5>Gợi ý cho học viên</h5>
                            <p>
                                Hãy cập nhật ảnh đại diện và thông tin cá nhân để trải nghiệm
                                học tập trên hệ thống được cá nhân hóa tốt hơn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentProfile;