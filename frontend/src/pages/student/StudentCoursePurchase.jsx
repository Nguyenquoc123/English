import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudentCoursePurchase.css";
import { getFileUrl } from "../../utils/fileurl";

function StudentCoursePurchase() {
    const navigate = useNavigate();
    const { courseId } = useParams();

    const API_BASE = "http://localhost:8080";

    const [course, setCourse] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

    const [loading, setLoading] = useState(false);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    const [paymentInfo, setPaymentInfo] = useState(null);
    const [creatingPayment, setCreatingPayment] = useState(false);

    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    useEffect(() => {
        loadCourseDetail();
    }, [courseId]);

    const loadCourseDetail = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                alert("Vui lòng đăng nhập để mua khóa học");
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE}/khoa-hoc/chi-tiet-khoa-hoc-student/${courseId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                setError(data?.message || "Không thể tải thông tin khóa học");
                return;
            }

            const result = data.result || data.data || data;

            if (result.isEnrolled) {
                // alert("Bạn đã sở hữu khóa học này");
                navigate(`/khoa-hoc/${courseId}`);
                return;
            }

            setCourse(result);
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };



    const handleCreatePayment = async () => {
        try {
            setCreatingPayment(true);

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE}/khoa-hoc/${courseId}/tao-thanh-toan`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                alert(data?.message || "Không thể tạo mã thanh toán");
                return;
            }

            const result = data.result || data.data || data;

            setPaymentInfo(result);
            setShowPaymentModal(true);
        } catch (err) {
            console.error(err);
            alert("Lỗi hệ thống khi tạo thanh toán");
        } finally {
            setCreatingPayment(false);
        }
    };

    const formatPrice = (price) => {
        if (!price || Number(price) === 0) return "Miễn phí";
        return Number(price).toLocaleString("vi-VN") + " VNĐ";
    };

    const formatOldPrice = (price) => {
        if (!price) return "";
        return Number(price).toLocaleString("vi-VN") + " VNĐ";
    };

    const checkCourseAccess = async (transactionCode) => {
        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:8080/khoa-hoc/check-mua?transactionCode=${transactionCode}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Lỗi khi gọi API");
            }

            return await response.json();

        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleClick = async () => {
        console.log(paymentInfo.paymentCode)
        const hasAccess = await checkCourseAccess(paymentInfo.paymentCode);

        if (hasAccess) {
            navigate(`/khoa-hoc/${courseId}`);
        } else {
            alert("Giao dịch chưa thành công. Vui lòng nhấn lại sau ít phút");
        }
    };

    const getAccessTypeText = () => {
        if (!course) return "";
        if (course.accessType === "FREE" || course.courseType === "FREE") {
            return "Miễn phí";
        }
        return "Có phí";
    };

    if (loading) {
        return (
            <div className="student-purchase-page">
                <div className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary mb-3"></div>
                    <div>Đang tải thông tin thanh toán...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-purchase-page">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="student-purchase-page">
                <div className="alert alert-warning">Không tìm thấy khóa học.</div>
            </div>
        );
    }

    return (
        <div className="student-purchase-page">
            <div className="purchase-breadcrumb">
                <span>Khóa học</span>
                <i className="bi bi-chevron-right"></i>
                <span>Chi tiết khóa học</span>
                <i className="bi bi-chevron-right"></i>
                <strong>Mua khóa học</strong>
            </div>

            <div className="purchase-heading">
                <h2>Mua khóa học</h2>
                <p>Xác nhận thông tin khóa học và chọn phương thức thanh toán để hoàn tất đăng ký học.</p>
            </div>

            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="purchase-course-card">
                        <div className="purchase-cover">
                            {course.thumbnailUrl ? (
                                <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} />
                            ) : (
                                <div className="purchase-cover-placeholder">
                                    <i className="bi bi-book"></i>
                                    <span>ENGLISH COURSE</span>
                                </div>
                            )}

                            <div className="purchase-cover-overlay">
                                <span>{course.levelName || "Chưa có cấp độ"}</span>
                                <span>{getAccessTypeText()}</span>
                            </div>
                        </div>

                        <div className="purchase-course-body">
                            <h3>{course.title}</h3>

                            <div className="purchase-section-title">Thông tin khóa học</div>

                            <p className="purchase-short-description">
                                {course.shortDescription || "Khóa học chưa có mô tả ngắn."}
                            </p>

                            <div className="purchase-info-grid">
                                <div>
                                    <div className="purchase-info-icon bg-blue">
                                        <i className="bi bi-layers"></i>
                                    </div>
                                    <span>Cấp độ</span>
                                    <strong>{course.levelName || "--"}</strong>
                                </div>

                                <div>
                                    <div className="purchase-info-icon bg-purple">
                                        <i className="bi bi-journal-text"></i>
                                    </div>
                                    <span>Bài học</span>
                                    <strong>{course.lessonCount || 0} bài học</strong>
                                </div>

                                <div>
                                    <div className="purchase-info-icon bg-orange">
                                        <i className="bi bi-star-fill"></i>
                                    </div>
                                    <span>Đánh giá</span>
                                    <strong>{course.rating || 0}/5 điểm</strong>
                                </div>

                                <div>
                                    <div className="purchase-info-icon bg-gray">
                                        <i className="bi bi-people"></i>
                                    </div>
                                    <span>Học viên</span>
                                    <strong>{course.studentCount || 0} học viên</strong>
                                </div>
                            </div>

                            <div className="purchase-teacher-box">
                                <div className="purchase-teacher-avatar">
                                    {course.teacherAvatarUrl ? (
                                        <img
                                            src={getFileUrl(course.teacherAvatarUrl)}
                                            alt={course.teacherName}
                                        />
                                    ) : (
                                        <span>{course.teacherName?.charAt(0) || "G"}</span>
                                    )}
                                </div>

                                <div>
                                    <span>Giảng viên</span>
                                    <strong>{course.teacherName || "Giáo viên"}</strong>
                                </div>

                                <div className="purchase-course-price ms-auto">
                                    <span>Giá khóa học</span>
                                    <strong>{formatPrice(course.price)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="payment-card">
                        <h4>Thông tin thanh toán</h4>

                        <div className="payment-section">
                            <label className="payment-label">Phương thức thanh toán</label>

                            <button
                                type="button"
                                className={
                                    paymentMethod === "BANK_TRANSFER"
                                        ? "payment-method active"
                                        : "payment-method"
                                }
                                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                            >
                                <div>
                                    <i className="bi bi-bank"></i>
                                    <span>Chuyển khoản ngân hàng</span>
                                </div>

                                <i className="bi bi-check-circle-fill"></i>
                            </button>


                        </div>

                        <div className="payment-summary">
                            <div className="payment-summary-title">Tóm tắt thanh toán</div>

                            <div className="payment-row">
                                <span>Giá khóa học</span>
                                <strong>{formatPrice(course.price)}</strong>
                            </div>

                            {course.originalPrice && Number(course.originalPrice) > Number(course.price) && (
                                <div className="payment-row old-row">
                                    <span>Giá gốc</span>
                                    <strong>{formatOldPrice(course.originalPrice)}</strong>
                                </div>
                            )}

                            <div className="payment-divider"></div>

                            <div className="payment-row total-row">
                                <span>Tổng tiền</span>
                                <strong>{formatPrice(course.price)}</strong>
                            </div>
                        </div>

                        <div className="payment-note">
                            <i className="bi bi-shield-check"></i>
                            <span>
                                Sau khi thanh toán thành công, hệ thống sẽ tự động cấp quyền truy cập khóa học cho tài khoản của bạn.
                            </span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary w-100 payment-button"
                            onClick={handleCreatePayment}
                            disabled={creatingPayment}
                        >
                            {creatingPayment ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Đang tạo mã QR...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-qr-code me-1"></i>
                                    Thanh toán
                                </>
                            )}
                        </button>


                        <button
                            type="button"
                            className="btn btn-outline-primary w-100 mt-2"
                            onClick={() => navigate(`/courses/${courseId}`)}
                            disabled={paying}
                        >
                            <i className="bi bi-arrow-left me-1"></i>
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>

            {showPaymentModal && paymentInfo && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-card">
                        <div className="payment-modal-header">
                            <div>
                                <h5>Quét mã QR để chuyển khoản</h5>
                                <p>Vui lòng chuyển đúng số tiền và đúng nội dung bên dưới.</p>
                            </div>

                            <button
                                type="button"
                                className="payment-modal-close"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="payment-modal-body">
                            <div className="payment-status-row">
                                <span>Trạng thái</span>
                                <strong className="badge text-bg-warning">
                                    {paymentInfo.status}
                                </strong>
                            </div>

                            <div className="qr-image-box">
                                <img src={paymentInfo.qrUrl} alt="QR thanh toán khóa học" />
                            </div>

                            <div className="qr-info-box">
                                <div>
                                    <span>Ngân hàng</span>
                                    <strong>{paymentInfo.bankName}</strong>
                                </div>

                                <div>
                                    <span>Số tài khoản</span>
                                    <strong>{paymentInfo.accountNumber}</strong>
                                </div>

                                <div>
                                    <span>Chủ tài khoản</span>
                                    <strong>{paymentInfo.accountName}</strong>
                                </div>

                                <div>
                                    <span>Số tiền</span>
                                    <strong>{formatPrice(paymentInfo.amount)}</strong>
                                </div>

                                <div>
                                    <span>Nội dung chuyển khoản</span>
                                    <strong className="payment-code">
                                        {paymentInfo.paymentCode}
                                    </strong>
                                </div>
                            </div>

                            <div className="alert alert-info mt-3 mb-0">
                                Sau khi bạn chuyển khoản đúng số tiền và đúng nội dung, hệ thống sẽ tự
                                động xác nhận thanh toán khi nhận được webhook từ SePay.
                            </div>
                        </div>

                        <div className="payment-modal-footer">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={() => handleClick()}
                            >
                                Đã chuyển
                            </button>

                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                Đóng
                            </button>

                            {/* <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => window.open(paymentInfo.qrUrl, "_blank")}
                            >
                                <i className="bi bi-box-arrow-up-right me-1"></i>
                                Mở QR
                            </button> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentCoursePurchase;