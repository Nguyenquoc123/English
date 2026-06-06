import React, { useEffect, useState } from "react";
import "./TeacherProfilePage.css";
import { getFileUrl } from "../../utils/fileurl";
import { useNavigate } from "react-router-dom";

const TeacherProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTeacherProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:8080/teacher-profile/profile-register", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            if (!response.ok) {
                throw new Error("Không thể tải hồ sơ giáo viên");
            }

            const data = await response.json();
            console.log(data);
            
            setProfile(data);
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeacherProfile();
    }, []);

    const formatDateTime = (dateTime) => {
        if (!dateTime) return "Chưa có";

        return new Date(dateTime).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const renderApprovalStatus = (status) => {
        if (!status) return <span className="status pending">Chưa có</span>;

        switch (status) {
            case "APPROVED":
                return <span className="status approved">Đã duyệt</span>;
            case "REJECTED":
                return <span className="status rejected">Bị từ chối</span>;
            case "PENDING":
                return <span className="status pending">Đang chờ duyệt</span>;
            default:
                return <span className="status pending">{status}</span>;
        }
    };

    if (loading) {
        return <div className="teacher-profile-container">Đang tải hồ sơ...</div>;
    }

    if (error) {
        return (
            <div className="teacher-profile-container">
                <div className="error-box">{error}</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="teacher-profile-container">
                <div className="error-box">Không tìm thấy hồ sơ giáo viên</div>
            </div>
        );
    }

    return (
        <div className="teacher-profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <img
                        src={getFileUrl(profile.avatarUrl) || "/default-avatar.png"}
                        alt="Avatar giáo viên"
                        className="avatar"
                    />

                    <div>
                        <h2>{profile.fullName || "Chưa cập nhật họ tên"}</h2>
                        <p className="username">@{profile.username}</p>
                        {renderApprovalStatus(profile.approvalStatus)}
                    </div>
                </div>

                <div className="section">
                    <h3>Thông tin tài khoản</h3>

                    <div className="info-grid">


                        <div className="info-item">
                            <label>Email</label>
                            <p>{profile.email}</p>
                        </div>

                        <div className="info-item">
                            <label>Số điện thoại</label>
                            <p>{profile.phone || "Chưa cập nhật"}</p>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <h3>Thông tin chuyên môn</h3>

                    <div className="info-item full">
                        <label>Giới thiệu</label>
                        <p>{profile.bio || "Chưa cập nhật"}</p>
                    </div>

                    <div className="info-item full">
                        <label>Kinh nghiệm</label>

                        {profile.experience ? (
                            <div
                                className="html-content"
                                dangerouslySetInnerHTML={{ __html: profile.experience }}
                            />
                        ) : (
                            <p>Chưa cập nhật</p>
                        )}
                    </div>
                </div>



                <div className="section">
                    <h3>Chứng chỉ</h3>

                    {profile.certificates && profile.certificates.length > 0 ? (
                        <div className="certificate-list">
                            {profile.certificates.map((certificate, index) => (
                                <div
                                    className="certificate-card"
                                    key={certificate.certificateId}
                                >
                                    {certificate.certificateUrl && (
                                        <a
                                            href={getFileUrl(certificate.certificateUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="certificate-image-link"
                                        >
                                            <img
                                                src={getFileUrl(certificate.certificateUrl)}
                                                alt={`Chứng chỉ ${index + 1}`}
                                                className="certificate-image"
                                            />
                                        </a>
                                    )}

                                    <div className="certificate-card-body">

                                        <a
                                            href={getFileUrl(certificate.certificateUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                        >
                                            Xem chứng chỉ
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Chưa có chứng chỉ nào</p>
                    )}
                </div>

                <div className="section">
                    <h3>Thời gian</h3>

                    <div className="info-grid">
                        <div className="info-item">
                            <label>Ngày tạo</label>
                            <p>{formatDateTime(profile.createdAt)}</p>
                        </div>

                        <div className="info-item">
                            <label>Cập nhật lần cuối</label>
                            <p>{formatDateTime(profile.updatedAt)}</p>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end">
                        <button className="btn btn-primary" onClick={() => navigate("/teacher/profile/update")}>Cập nhập hồ sơ</button>
                    </div>
                </div>

                {/* <div className="action-area">
          <button onClick={fetchTeacherProfile}>Tải lại hồ sơ</button>
        </div> */}
            </div>
        </div>
    );
};

export default TeacherProfilePage;