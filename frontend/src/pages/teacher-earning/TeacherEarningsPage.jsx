import { useEffect, useState } from "react";
import "./TeacherEarningsPage.css";

function TeacherEarningsPage() {
    const API_BASE = "http://localhost:8080";

    const [summary, setSummary] = useState({
        availableAmount: 0,
        pendingAmount: 0,
        totalAmount: 0,
    });

    const [withdrawals, setWithdrawals] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);

    const [loading, setLoading] = useState(false);
    const [bankLoading, setBankLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const [withdrawForm, setWithdrawForm] = useState({
        amount: "",
        bankAccountId: "",
    });

    useEffect(() => {
        loadTeacherEarnings();
    }, []);

    const getToken = () => localStorage.getItem("token");

    const authHeaders = () => {
        const token = getToken();

        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

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

            const response = await fetch(`${API_BASE}/teacher/earnings`, {
                method: "GET",
                headers: authHeaders(),
            });

            const data = await parseJsonSafely(response);

            if (!response.ok) {
                setError(data?.message || "Không thể tải thông tin doanh thu");
                return;
            }

            const result = data?.result || data?.data || data;

            setSummary({
                availableAmount: result?.availableAmount || 0,
                pendingAmount: result?.pendingAmount || 0,
                totalAmount: result?.totalAmount || 0,
            });

            setWithdrawals(result?.withdrawns || result?.withdrawals || []);
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    const loadBankAccounts = async () => {
        try {
            setBankLoading(true);
            setError("");

            const response = await fetch(`${API_BASE}/bank-account`, {
                method: "GET",
                headers: authHeaders(),
            });

            const data = await parseJsonSafely(response);
            const result = data?.result || data?.data || data || [];

            if (!response.ok) {
                setError(data?.message || "Không thể tải danh sách tài khoản ngân hàng");
                return;
            }

            const list = Array.isArray(result) ? result : [];

            setBankAccounts(list);

            if (list.length > 0) {
                setWithdrawForm((prev) => ({
                    ...prev,
                    bankAccountId: prev.bankAccountId || String(list[0].bankAccountId || list[0].id),
                }));
            }
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        } finally {
            setBankLoading(false);
        }
    };

    const openWithdrawModal = async () => {
        setWithdrawForm({
            amount: "",
            bankAccountId: "",
        });

        setShowWithdrawModal(true);
        await loadBankAccounts();
    };

    const closeWithdrawModal = () => {
        if (submitting) return;

        setShowWithdrawModal(false);
        setWithdrawForm({
            amount: "",
            bankAccountId: "",
        });
    };

    const handleWithdrawFormChange = (e) => {
        const { name, value } = e.target;

        if (name === "amount") {
            const rawAmount = parseNumberInput(value);

            setWithdrawForm((prev) => ({
                ...prev,
                amount: rawAmount,
            }));

            return;
        }

        setWithdrawForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitWithdraw = async (e) => {
        e.preventDefault();

        const amount = Number(withdrawForm.amount || 0);
        const availableAmount = Number(summary.availableAmount || 0);

        if (!amount || amount <= 0) {
            alert("Vui lòng nhập số tiền cần rút hợp lệ");
            return;
        }

        if (amount > availableAmount) {
            alert("Số tiền rút không được lớn hơn số dư hiện tại");
            return;
        }

        if (!withdrawForm.bankAccountId) {
            alert("Vui lòng chọn tài khoản ngân hàng");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const payload = {
                amount: amount,
                bankAccountId: Number(withdrawForm.bankAccountId),
            };


            const response = await fetch(`${API_BASE}/withdraw/create`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await parseJsonSafely(response);

            if (!response.ok) {
                alert(data?.message || "Không thể tạo yêu cầu rút tiền");
                return;
            }

            alert("Tạo yêu cầu rút tiền thành công");

            closeWithdrawModal();
            await loadTeacherEarnings();
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        } finally {
            setSubmitting(false);
        }
    };

    const formatMoney = (amount) => {
        return Number(amount || 0).toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    const formatNumberInput = (value) => {
        if (!value) return "";

        return String(value)
            .replace(/\D/g, "")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const parseNumberInput = (value) => {
        return String(value || "").replace(/\D/g, "");
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

    const getWithdrawalStatusBadgeClass = (status) => {
        if (status === "PENDING") return "badge text-bg-warning";
        if (status === "APPROVED") return "badge text-bg-info";
        if (status === "COMPLETED") return "badge text-bg-success";
        if (status === "REJECTED") return "badge text-bg-danger";
        if (status === "CANCELED" || status === "CANCELLED") return "badge text-bg-secondary";

        return "badge text-bg-light text-dark";
    };

    const getWithdrawalStatusText = (status) => {
        if (status === "PENDING") return "Chờ xử lý";
        if (status === "APPROVED") return "Đã duyệt";
        if (status === "COMPLETED") return "Đã chuyển tiền";
        if (status === "REJECTED") return "Bị từ chối";
        if (status === "CANCELED" || status === "CANCELLED") return "Đã hủy";

        return status || "Không xác định";
    };

    if (loading) {
        return (
            <div className="teacher-earnings-page">
                <div className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary mb-3"></div>
                    <div>Đang tải thông tin rút tiền...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="teacher-earnings-page">
            <div className="earnings-heading">
                <div>
                    <h4 className="fw-bold mb-1">Doanh thu & rút tiền</h4>
                    <p className="text-muted mb-0">
                        Theo dõi số dư và các yêu cầu rút tiền của bạn.
                    </p>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openWithdrawModal}
                        disabled={Number(summary.availableAmount || 0) <= 0}
                    >
                        <i className="bi bi-wallet2 me-1"></i>
                        Rút tiền
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
                            <div className="summary-label">Số tiền đang chờ</div>
                            <div className="summary-value">
                                {formatMoney(summary.pendingAmount)}
                            </div>
                            <div className="summary-note">Yêu cầu rút tiền đang xử lý</div>
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
                        <h5 className="fw-bold mb-1">Các lần rút tiền</h5>
                        <small className="text-muted">
                            Danh sách yêu cầu rút tiền của giáo viên.
                        </small>
                    </div>

                    <span className="badge text-bg-light text-dark">
                        {withdrawals.length} yêu cầu
                    </span>
                </div>

                <div className="card-body p-0">
                    {withdrawals.length === 0 ? (
                        <div className="empty-state">
                            <i className="bi bi-wallet2"></i>
                            <h6>Chưa có yêu cầu rút tiền</h6>
                            <p className="text-muted mb-0">
                                Khi bạn tạo yêu cầu rút tiền, lịch sử sẽ hiển thị tại đây.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Mã yêu cầu</th>
                                        <th className="text-end">Số tiền</th>
                                        <th>Ngân hàng</th>
                                        <th>Chủ tài khoản</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày yêu cầu</th>
                                        <th>Ngày xử lý</th>
                                        <th>Ghi chú</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {withdrawals.map((item) => (
                                        <tr key={item.withdrawalId}>
                                            <td>
                                                <strong>#{item.withdrawalId}</strong>
                                            </td>

                                            <td className="text-end fw-bold text-success">
                                                {formatMoney(item.totalAmount || item.amount)}
                                            </td>

                                            <td>
                                                <div className="fw-semibold">
                                                    {item.bankName || "—"}
                                                </div>
                                                <div className="small text-muted">
                                                    {item.accountNumber || item.bankAccountNumber || "—"}
                                                </div>
                                            </td>

                                            <td>{item.accountName || item.bankAccountName || "—"}</td>

                                            <td>
                                                <span className={getWithdrawalStatusBadgeClass(item.status)}>
                                                    {getWithdrawalStatusText(item.status)}
                                                </span>
                                            </td>

                                            <td>
                                                {formatDateTime(item.requestedAt || item.createdAt)}
                                            </td>

                                            <td>{formatDateTime(item.reviewedAt || item.processedAt)}</td>

                                            <td>{item.rejectReason || item.note || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showWithdrawModal && (
                <>
                    <div
                        className="modal fade show"
                        style={{ display: "block" }}
                        tabIndex="-1"
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow">
                                <form onSubmit={handleSubmitWithdraw}>
                                    <div className="modal-header">
                                        <h5 className="modal-title fw-bold">
                                            Yêu cầu rút tiền
                                        </h5>

                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={closeWithdrawModal}
                                            disabled={submitting}
                                        ></button>
                                    </div>

                                    <div className="modal-body">
                                        <div className="alert alert-primary mb-3">
                                            <div className="small mb-1">
                                                Số dư hiện tại
                                            </div>
                                            <div className="fw-bold fs-5">
                                                {formatMoney(summary.availableAmount)}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Số tiền cần rút
                                            </label>
                                            <input
                                                type="text"
                                                name="amount"
                                                className="form-control"
                                                placeholder="Nhập số tiền cần rút"
                                                value={formatNumberInput(withdrawForm.amount)}
                                                onChange={handleWithdrawFormChange}
                                                inputMode="numeric"
                                                disabled={submitting}
                                                required
                                            />

                                            <div className="form-text">
                                                Số tiền rút tối thiểu là 10.000đ
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Tài khoản ngân hàng
                                            </label>

                                            {bankLoading ? (
                                                <div className="form-control text-muted">
                                                    Đang tải tài khoản ngân hàng...
                                                </div>
                                            ) : (
                                                <select
                                                    name="bankAccountId"
                                                    className="form-select"
                                                    value={withdrawForm.bankAccountId}
                                                    onChange={handleWithdrawFormChange}
                                                    disabled={submitting || bankAccounts.length === 0}
                                                    required
                                                >
                                                    <option value="">
                                                        Chọn tài khoản ngân hàng
                                                    </option>

                                                    {bankAccounts.map((account) => {
                                                        const id =
                                                            account.bankAccountId ||
                                                            account.id;

                                                        return (
                                                            <option key={id} value={id}>
                                                                {account.bankName} -{" "}
                                                                {account.accountNumber ||
                                                                    account.bankAccountNumber}{" "}
                                                                -{" "}
                                                                {account.accountName ||
                                                                    account.bankAccountName}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            )}

                                            {bankAccounts.length === 0 && !bankLoading && (
                                                <div className="form-text text-danger">
                                                    Bạn chưa có tài khoản ngân hàng. Vui lòng thêm tài khoản trước khi rút tiền.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={closeWithdrawModal}
                                            disabled={submitting}
                                        >
                                            Hủy
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                submitting ||
                                                bankLoading ||
                                                bankAccounts.length === 0
                                            }
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-send me-1"></i>
                                                    Gửi yêu cầu
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </div>
    );
}

export default TeacherEarningsPage;