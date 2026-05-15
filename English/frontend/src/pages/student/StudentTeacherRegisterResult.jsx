import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentTeacherRegisterResult.css";

function StudentTeacherRegisterResult() {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080";

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  useEffect(() => {
    loadRegisterResult();
  }, []);

  const loadRegisterResult = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/teacher-profile/profile-register`, {
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

      const body = data?.result || data?.data || data;

      if (!response.ok) {
        setError(body?.message || "Không thể tải kết quả đăng ký giáo viên");
        return;
      }

      setResult(body);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    if (url.startsWith("/")) {
      return API_BASE + url;
    }

    return `${API_BASE}/${url}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "Chưa có";

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

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
  };

  const getStatusInfo = () => {
    const status = String(result?.approvalStatus || "").toLowerCase();

    if (status === "approved") {
      return {
        label: "Đã được duyệt",
        className: "status-approved",
        icon: "bi bi-check-circle-fill",
        description:
          "Hồ sơ giáo viên của bạn đã được admin xét duyệt thành công.",
      };
    }

    if (status === "rejected") {
      return {
        label: "Bị từ chối",
        className: "status-rejected",
        icon: "bi bi-x-circle-fill",
        description:
          "Hồ sơ của bạn chưa được duyệt. Vui lòng xem lý do và gửi lại hồ sơ.",
      };
    }

    return {
      label: "Đang chờ duyệt",
      className: "status-pending",
      icon: "bi bi-clock-fill",
      description:
        "Hồ sơ của bạn đã được gửi và đang chờ admin xét duyệt.",
    };
  };

  const getStepClass = (step) => {
    const status = String(result?.approvalStatus || "").toLowerCase();

    if (step === 1) return "step-item completed";

    if (step === 2) {
      if (status === "pending") return "step-item active";
      if (status === "approved") return "step-item completed";
      if (status === "rejected") return "step-item rejected";
    }

    if (step === 3) {
      if (status === "approved") return "step-item completed";
      if (status === "rejected") return "step-item rejected";
    }

    return "step-item";
  };

  const getInitialName = () => {
    if (!result?.fullName) return "HV";

    const parts = result.fullName.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  const handleRegisterAgain = () => {
    navigate("/student/teacher-register?mode=again");
  };

  if (loading) {
    return (
      <div className="teacher-register-result-page">
        <div className="result-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải kết quả đăng ký...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-register-result-page">
        <div className="result-container">
          <button
            type="button"
            className="result-back-link"
            onClick={() => navigate("/student/profile")}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại
          </button>

          <div className="alert alert-danger">{error}</div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/student/teacher-register")}
          >
            Đăng ký trở thành giáo viên
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="teacher-register-result-page">
        <div className="result-container">
          <div className="alert alert-warning">
            Không tìm thấy hồ sơ đăng ký giáo viên.
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const isRejected = String(result.approvalStatus || "").toLowerCase() === "rejected";
  const isApproved = String(result.approvalStatus || "").toLowerCase() === "approved";

  return (
    <div className="teacher-register-result-page">
      <div className="result-container">
        <div className="result-heading">
          <button
            type="button"
            className="result-back-link"
            onClick={() => navigate("/student/profile")}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại
          </button>

          <div className="result-heading-row">
            <div>
              <h2>Kết quả đăng ký trở thành giáo viên</h2>
              <p>Theo dõi trạng thái xét duyệt hồ sơ đăng ký giáo viên của bạn.</p>
            </div>

            {isRejected && (
              <button
                type="button"
                className="btn btn-primary register-again-top-btn"
                onClick={handleRegisterAgain}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Đăng ký lại
              </button>
            )}
          </div>
        </div>

        <div className={`result-status-card ${statusInfo.className}`}>
          <div className="status-left">
            <div className="status-icon">
              <i className={statusInfo.icon}></i>
            </div>

            <div>
              <span>Trạng thái xét duyệt</span>
              <h5>{statusInfo.label}</h5>
              <p>{statusInfo.description}</p>
            </div>
          </div>

          <div className="result-stepper">
            <div className={getStepClass(1)}>
              <div className="step-circle">
                <i className="bi bi-check-lg"></i>
              </div>
              <span>Đã gửi hồ sơ</span>
            </div>

            <div className="step-line"></div>

            <div className={getStepClass(2)}>
              <div className="step-circle">
                <i className={isRejected ? "bi bi-x-lg" : "bi bi-hourglass-split"}></i>
              </div>
              <span>{isRejected ? "Bị từ chối" : "Đang xét duyệt"}</span>
            </div>

            <div className="step-line"></div>

            <div className={getStepClass(3)}>
              <div className="step-circle">
                <i className={isApproved ? "bi bi-check-lg" : "bi bi-award"}></i>
              </div>
              <span>Hoàn tất xét duyệt</span>
            </div>
          </div>
        </div>

        {isRejected && (
          <div className="reject-reason-card">
            <div className="reject-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <div>
              <h5>Lý do từ chối</h5>
              <p>{result.rejectReason || "Admin chưa nhập lý do từ chối cụ thể."}</p>

              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={handleRegisterAgain}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Cập nhật và gửi lại hồ sơ
              </button>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="approved-card">
            <div className="approved-icon">
              <i className="bi bi-patch-check-fill"></i>
            </div>

            <div>
              <h5>Chúc mừng! Hồ sơ của bạn đã được duyệt</h5>
              <p>
                Bạn đã có thể sử dụng các chức năng dành cho giáo viên như tạo
                khóa học, quản lý bài học, bài thi và doanh thu.
              </p>

              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() => navigate("/teacher/courses")}
              >
                Vào trang giáo viên
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        )}

        <div className="row g-4 mt-1">
          <div className="col-lg-4">
            <div className="result-profile-card">
              <div className="card-title">
                <i className="bi bi-person"></i>
                Thông tin cá nhân
              </div>

              <div className="result-avatar-wrapper">
                {result.avatarUrl ? (
                  <img
                    src={getFileUrl(result.avatarUrl)}
                    alt={result.fullName}
                    className="result-avatar-img"
                  />
                ) : (
                  <div className="result-avatar-placeholder">
                    {getInitialName()}
                  </div>
                )}

                <span className="result-avatar-dot"></span>
              </div>

              <h4>{result.fullName || "Học viên"}</h4>
              <p>{result.email || "--"}</p>

              <div className="profile-info-list">
                <div>
                  <span>Họ và tên</span>
                  <strong>{result.fullName || "--"}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{result.email || "--"}</strong>
                </div>

                <div>
                  <span>Tên đăng nhập</span>
                  <strong>{result.username || "--"}</strong>
                </div>

                <div>
                  <span>Thời gian gửi</span>
                  <strong>{formatDateTime(result.createdAt)}</strong>
                </div>

                <div>
                  <span>Thời gian cập nhật</span>
                  <strong>{formatDateTime(result.updatedAt)}</strong>
                </div>

                <div>
                  <span>Người xét duyệt</span>
                  <strong>{result.reviewedByName || "Chưa có"}</strong>
                </div>

                <div>
                  <span>Thời gian xét duyệt</span>
                  <strong>{formatDateTime(result.reviewedAt)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="result-detail-card">
              <div className="card-title">
                <i className="bi bi-file-earmark-text"></i>
                Thông tin hồ sơ
              </div>

              <div className="result-section">
                <h6>Giới thiệu bản thân</h6>
                <div className="bio-box">
                  {result.bio || "Chưa có nội dung giới thiệu."}
                </div>
              </div>

              <div className="result-section">
                <h6>Kinh nghiệm</h6>

                {result.experience ? (
                  <div
                    className="experience-html-box"
                    dangerouslySetInnerHTML={{ __html: result.experience }}
                  ></div>
                ) : (
                  <div className="empty-box">Chưa có nội dung kinh nghiệm.</div>
                )}

                {result.experience && stripHtml(result.experience).length === 0 && (
                  <div className="empty-box">Chưa có nội dung kinh nghiệm.</div>
                )}
              </div>

              <div className="result-section">
                <div className="certificate-title-row">
                  <h6>Danh sách chứng chỉ</h6>
                  <span>{result.certificates?.length || 0} ảnh</span>
                </div>

                {result.certificates && result.certificates.length > 0 ? (
                  <div className="certificate-result-grid">
                    {result.certificates.map((certificate, index) => (
                      <div
                        className="certificate-result-item"
                        key={certificate.certificateId || index}
                      >
                        <img
                          src={getFileUrl(certificate.certificateUrl)}
                          alt={`Chứng chỉ ${index + 1}`}
                        />

                        <div className="certificate-overlay">
                          <span>Chứng chỉ {index + 1}</span>

                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                getFileUrl(certificate.certificateUrl),
                                "_blank"
                              )
                            }
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-box">Chưa có ảnh chứng chỉ.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="result-note-card">
          <i className="bi bi-info-circle"></i>

          <div>
            {isRejected ? (
              <p>
                Hồ sơ của bạn đã bị từ chối. Vui lòng đọc kỹ lý do, cập nhật
                thông tin phù hợp và gửi lại hồ sơ để admin xét duyệt lần nữa.
              </p>
            ) : isApproved ? (
              <p>
                Hồ sơ của bạn đã được duyệt. Bạn có thể chuyển sang khu vực giáo
                viên để bắt đầu tạo và quản lý khóa học.
              </p>
            ) : (
              <p>
                Admin sẽ xem xét thông tin hồ sơ và chứng chỉ của bạn trong vòng
                2-3 ngày làm việc. Bạn sẽ nhận được thông báo khi có kết quả xét
                duyệt.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentTeacherRegisterResult;