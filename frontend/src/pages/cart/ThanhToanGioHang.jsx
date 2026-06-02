import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFileUrl } from "../../utils/fileurl";
import "./ThanhToanGioHang.css";

function ThanhToanGioHang() {
    const navigate = useNavigate();

    const API_BASE = "http://localhost:8080";

    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

    const [loading, setLoading] = useState(false);
    const [creatingPayment, setCreatingPayment] = useState(false);
    const [error, setError] = useState("");

    const [paymentInfo, setPaymentInfo] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    useEffect(() => {
        loadCartItems();
    }, []);

    const loadCartItems = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                alert("Vui lòng đăng nhập để thanh toán");
                navigate("/dang-nhap");
                return;
            }

            const response = await fetch(`${API_BASE}/gio-hang/khoa-hoc`, {
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
                setError(data?.message || "Không thể tải giỏ hàng");
                return;
            }

            const result = data.result || data.data || data;
            const items = Array.isArray(result) ? result : result.items || [];

            if (items.length === 0) {
                setCartItems([]);
                return;
            }

            setCartItems(items);
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            return sum + Number(item.price || 0);
        }, 0);
    }, [cartItems]);

    const formatPrice = (price) => {
        if (!price || Number(price) === 0) return "Miễn phí";
        return Number(price).toLocaleString("vi-VN") + " VNĐ";
    };

    const handleCreatePayment = async () => {
        try {
            if (cartItems.length === 0) {
                alert("Giỏ hàng đang trống");
                return;
            }

            setCreatingPayment(true);

            const token = getToken();

            if (!token) {
                navigate("/dang-nhap");
                return;
            }

            const courseIds = cartItems.map((item) => item.courseId);

            const response = await fetch(`${API_BASE}/khoa-hoc/tao-thanh-toan`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseIds: courseIds,
                }),
            });

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

    const checkCartPayment = async (transactionCode) => {
        try {
            const token = getToken();

            const response = await fetch(
                `${API_BASE}/khoa-hoc/check-mua?transactionCode=${transactionCode}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Lỗi khi kiểm tra thanh toán");
            }
            window.dispatchEvent(new Event('cartChanged'));
            return await response.json();
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleConfirmPaid = async () => {
        if (!paymentInfo?.paymentCode) {
            alert("Chưa có mã giao dịch");
            return;
        }

        const result = await checkCartPayment(paymentInfo.paymentCode);

        const success =
            result === true ||
            result?.result === true ||
            result?.data === true ||
            result?.status === "SUCCESS";

        if (success) {
            alert("Thanh toán thành công. Khóa học đã được thêm vào tài khoản của bạn.");
            navigate("/khoa-hoc-da-mua");
        } else {
            alert(
                "Hệ thống chưa nhận được xác nhận từ ngân hàng (webhook SePay).\n\n" +
                    "• Đảm bảo đã chuyển đúng số tiền và nội dung CK (ví dụ SEVQR8)\n" +
                    "• Giữ ngrok và backend đang chạy\n" +
                    "• Kiểm tra tab Lịch sử gửi trên SePay (phải là 200, không phải 401)\n\n" +
                    "Thử lại sau 1–2 phút hoặc bấm Gửi lại webhook trên SePay."
            );
        }
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

    if (cartItems.length === 0) {
        return (
            <div className="student-purchase-page">
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-cart-x display-4 text-muted"></i>
                        <h5 className="fw-bold mt-3">Giỏ hàng đang trống</h5>
                        <p className="text-muted">
                            Bạn chưa có khóa học nào để thanh toán.
                        </p>
                        <Link to="/danh-sach-khoa-hoc" className="btn btn-primary">
                            Khám phá khóa học
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-purchase-page">
            <div className="purchase-breadcrumb">
                <button
                    type="button"
                    className="purchase-breadcrumb-link"
                    onClick={() => navigate("/gio-hang")}
                >
                    Giỏ hàng
                </button>

                <i className="bi bi-chevron-right"></i>

                <strong>Thanh toán</strong>
            </div>



            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="purchase-course-card">
                        <div className="purchase-course-body w-100">
                            <div className="purchase-section-title">
                                Danh sách khóa học
                            </div>

                            <div className="list-group list-group-flush">
                                {cartItems.map((item) => (
                                    <div
                                        className="list-group-item px-0 py-3"
                                        key={item.cartItemId}
                                    >
                                        <div className="d-flex gap-3">
                                            <div style={{ width: 120, flexShrink: 0 }}>
                                                {item.thumbnailUrl ? (
                                                    <img
                                                        src={getFileUrl(item.thumbnailUrl)}
                                                        alt={item.title}
                                                        className="rounded"
                                                        style={{
                                                            width: "120px",
                                                            height: "75px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded bg-light d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "120px",
                                                            height: "75px",
                                                        }}
                                                    >
                                                        <i className="bi bi-book text-muted"></i>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-grow-1">
                                                <button
                                                    type="button"
                                                    className="purchase-course-title-link text-start"
                                                    onClick={() => navigate(`/khoa-hoc/${item.courseId}`)}
                                                >
                                                    {item.title}
                                                </button>

                                                <p className="text-muted small mb-2">
                                                    {item.shortDescription || "Khóa học chưa có mô tả ngắn."}
                                                </p>

                                                <div className="d-flex flex-wrap gap-2">
                                                    {item.teacherName && (
                                                        <span className="badge text-bg-light">
                                                            <i className="bi bi-person me-1"></i>
                                                            {item.teacherName}
                                                        </span>
                                                    )}

                                                    {item.levelName && (
                                                        <span className="badge text-bg-light">
                                                            <i className="bi bi-layers me-1"></i>
                                                            {item.levelName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-end" style={{ minWidth: 120 }}>
                                                <strong className="text-primary">
                                                    {formatPrice(item.price)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="payment-card">
                        <h4>Thông tin thanh toán</h4>

                        <div className="payment-section">
                            <label className="payment-label">
                                Phương thức thanh toán
                            </label>

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
                                    <span>Chuyển khoản ngân hàng(Vietinbank)</span>
                                </div>

                                <i className="bi bi-check-circle-fill"></i>
                            </button>
                        </div>

                        <div className="payment-summary">
                            <div className="payment-summary-title">
                                Tóm tắt thanh toán
                            </div>

                            <div className="payment-row">
                                <span>Số khóa học</span>
                                <strong>{cartItems.length}</strong>
                            </div>



                            <div className="payment-divider"></div>

                            <div className="payment-row total-row">
                                <span>Tổng tiền</span>
                                <strong>{formatPrice(totalAmount)}</strong>
                            </div>
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
                                <img src={paymentInfo.qrUrl} alt="QR thanh toán giỏ hàng" />
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
                                Sau khi bạn chuyển khoản đúng số tiền và đúng nội dung, vui lòng nhấn vào nút đã thanh toán để kiểm tra.
                            </div>
                        </div>

                        <div className="payment-modal-footer">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleConfirmPaid}
                            >
                                Đã thanh toán
                            </button>

                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ThanhToanGioHang;