import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherEarningsPage.css";

function TeacherEarningsPage() {
    const API_BASE = "http://localhost:8080";

    const navigate = useNavigate();

    const [summary, setSummary] = useState({
        availableAmount: 0,
        pendingAmount: 0,
        totalAmount: 0,
    });

    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTeacherEarnings();
    }, []);

    const getToken = () => localStorage.getItem("token");

    const parseJsonSafely = async (response) => {
        try {
            return await response.json();
        } catch {
            return null;
        }
    };

    const loadTeacherEarnings = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            const response = await fetch(`${API_BASE}/teacher/earnings`, {
                method: "GET",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await parseJsonSafely(response);

            if (!response.ok) {
                setError(data?.message || "Không thể tải danh sách giao dịch");
                return;
            }

            const result = data?.result || data?.data || data;

            setSummary({
                availableAmount: result?.availableAmount || 0,
                pendingAmount: result?.pendingAmount || 0,
                totalAmount: result?.totalAmount || 0,
            });

            setTransactions(result?.transactions || []);
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => {
        return Number(amount || 0).toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    const formatDateTime = (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getStatusBadgeClass = (status) => {
        if (status === "AVAILABLE") {
            return "badge text-bg-success";
        }

        if (status === "PENDING") {
            return "badge text-bg-warning";
        }

        if (status === "WITHDRAWN") {
            return "badge text-bg-secondary";
        }

        return "badge text-bg-light text-dark";
    };

    const getStatusText = (status) => {
        if (status === "AVAILABLE") {
            return "Có sẵn";
        }

        if (status === "PENDING") {
            return "Đang chờ nhận";
        }

        if (status === "WITHDRAWN") {
            return "Đã rút";
        }

        return status || "Không xác định";
    };

    if (loading) {
        return (
            <div className="teacher-earnings-page">
                <div className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary mb-3"></div>
                    <div>Đang tải danh sách giao dịch...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="teacher-earnings-page">
            <div className="earnings-heading">
                <div>
                    <h4 className="fw-bold mb-1">Giao dịch nhận được</h4>
                    <p className="text-muted mb-0">
                        Theo dõi doanh thu từ các khóa học đã bán.
                    </p>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/teacher/earnings/withdrawals")}
                    >
                        <i className="bi bi-clock-history me-1"></i>
                        Lịch sử rút tiền
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={loadTeacherEarnings}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Làm mới
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mt-3">
                    <i className="bi bi-exclamation-triangle"></i>
                    <span>{error}</span>
                </div>
            )}

            <div className="row g-3 mt-2">
                <div className="col-md-4">
                    <div className="earning-summary-card available">
                        <div className="summary-icon">
                            <i className="bi bi-wallet2"></i>
                        </div>

                        <div>
                            <div className="summary-label">Số tiền có sẵn</div>
                            <div className="summary-value">
                                {formatMoney(summary.availableAmount)}
                            </div>
                            <div className="summary-note">Có thể yêu cầu rút tiền</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="earning-summary-card pending">
                        <div className="summary-icon">
                            <i className="bi bi-hourglass-split"></i>
                        </div>

                        <div>
                            <div className="summary-label">Số tiền chờ nhận</div>
                            <div className="summary-value">
                                {formatMoney(summary.pendingAmount)}
                            </div>
                            <div className="summary-note">Đang ở trạng thái pending</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="earning-summary-card total">
                        <div className="summary-icon">
                            <i className="bi bi-cash-stack"></i>
                        </div>

                        <div>
                            <div className="summary-label">Tổng doanh thu nhận</div>
                            <div className="summary-value">
                                {formatMoney(summary.totalAmount)}
                            </div>
                            <div className="summary-note">Sau khi trừ phí nền tảng</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mt-4">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="fw-bold mb-1">Danh sách giao dịch</h5>
                        <small className="text-muted">
                            Hiển thị các khoản giáo viên nhận được từ từng đơn hàng.
                        </small>
                    </div>

                    <span className="badge text-bg-light text-dark">
                        {transactions.length} giao dịch
                    </span>
                </div>

                <div className="card-body p-0">
                    {transactions.length === 0 ? (
                        <div className="empty-state">
                            <i className="bi bi-receipt"></i>
                            <h6>Chưa có giao dịch nào</h6>
                            <p className="text-muted mb-0">
                                Khi học viên mua khóa học, giao dịch sẽ hiển thị tại đây.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Mã GD</th>
                                        <th>Khóa học</th>
                                        <th className="text-end">Giá bán</th>
                                        <th className="text-end">Phí nền tảng</th>
                                        <th className="text-end">Thực nhận</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày tạo</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactions.map((item) => (
                                        <tr key={item.earningId}>
                                            <td>
                                                <strong>#{item.transactionId}</strong>
                                                <div className="small text-muted">
                                                    Item #{item.transactionItemId}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="fw-semibold">
                                                    {item.courseTitle || "Không có tên khóa học"}
                                                </div>
                                                <div className="small text-muted">
                                                    Course ID: {item.courseId}
                                                </div>
                                            </td>

                                            <td className="text-end">
                                                {formatMoney(item.grossAmount)}
                                            </td>

                                            <td className="text-end text-danger">
                                                -{formatMoney(item.platformFee)}
                                            </td>

                                            <td className="text-end fw-bold text-success">
                                                {formatMoney(item.netAmount)}
                                            </td>

                                            <td>
                                                <span className={getStatusBadgeClass(item.status)}>
                                                    {getStatusText(item.status)}
                                                </span>
                                            </td>

                                            <td>{formatDateTime(item.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherEarningsPage;