import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherWithdrawalPage.css";

function TeacherWithdrawalPage() {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080";

  const [withdrawals, setWithdrawals] = useState([]);
  const [summary, setSummary] = useState({
    totalRequestedAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
    rejectedAmount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWithdrawalHistory();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const parseJsonSafely = async (response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const loadWithdrawalHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_BASE}/teacher/withdrawals`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        setError(data?.message || "Không thể tải lịch sử rút tiền");
        return;
      }

      const result = data?.result || data?.data || data;

      setSummary({
        totalRequestedAmount: result?.totalRequestedAmount || 0,
        pendingAmount: result?.pendingAmount || 0,
        approvedAmount: result?.approvedAmount || 0,
        paidAmount: result?.paidAmount || 0,
        rejectedAmount: result?.rejectedAmount || 0,
      });

      setWithdrawals(result?.withdrawals || []);
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

  const getStatusText = (status) => {
    if (status === "PENDING") return "Đang chờ duyệt";
    if (status === "APPROVED") return "Đã duyệt";
    if (status === "REJECTED") return "Đã từ chối";
    if (status === "PAID") return "Đã thanh toán";
    return status || "Không xác định";
  };

  const getStatusBadgeClass = (status) => {
    if (status === "PENDING") return "badge text-bg-warning";
    if (status === "APPROVED") return "badge text-bg-primary";
    if (status === "REJECTED") return "badge text-bg-danger";
    if (status === "PAID") return "badge text-bg-success";
    return "badge text-bg-secondary";
  };

  if (loading) {
    return (
      <div className="teacher-withdrawal-history-page">
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải lịch sử rút tiền...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-withdrawal-history-page">
      <div className="withdrawal-history-heading">
        <div>
          <h4 className="fw-bold mb-1">Lịch sử rút tiền</h4>
          <p className="text-muted mb-0">
            Theo dõi các yêu cầu rút tiền của bạn.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/teacher/earnings")}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Quay lại giao dịch
          </button>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={loadWithdrawalHistory}
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
        <div className="col-md-3">
          <div className="withdrawal-summary-card total">
            <div className="summary-label">Tổng yêu cầu</div>
            <div className="summary-value">
              {formatMoney(summary.totalRequestedAmount)}
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="withdrawal-summary-card pending">
            <div className="summary-label">Đang chờ duyệt</div>
            <div className="summary-value">
              {formatMoney(summary.pendingAmount)}
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="withdrawal-summary-card approved">
            <div className="summary-label">Đã duyệt</div>
            <div className="summary-value">
              {formatMoney(summary.approvedAmount)}
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="withdrawal-summary-card paid">
            <div className="summary-label">Đã thanh toán</div>
            <div className="summary-value">
              {formatMoney(summary.paidAmount)}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-1">Danh sách yêu cầu rút tiền</h5>
            <small className="text-muted">
              Các bản ghi được lấy từ bảng withdrawals của giáo viên hiện tại.
            </small>
          </div>

          <span className="badge text-bg-light text-dark">
            {withdrawals.length} yêu cầu
          </span>
        </div>

        <div className="card-body p-0">
          {withdrawals.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-cash-coin"></i>
              <h6>Chưa có yêu cầu rút tiền nào</h6>
              <p className="text-muted mb-0">
                Khi bạn gửi yêu cầu rút tiền, lịch sử sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Mã yêu cầu</th>
                    <th>Ngân hàng</th>
                    <th>Tài khoản</th>
                    <th className="text-end">Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày yêu cầu</th>
                    <th>Ngày duyệt</th>
                    <th>Ngày thanh toán</th>
                    <th>Lý do từ chối</th>
                    <th>Minh chứng</th>
                  </tr>
                </thead>

                <tbody>
                  {withdrawals.map((item) => (
                    <tr key={item.withdrawalId}>
                      <td>
                        <strong>#{item.withdrawalId}</strong>
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {item.bankName || "—"}
                        </div>
                      </td>

                      <td>
                        <div>{item.accountNumber || "—"}</div>
                        <div className="small text-muted">
                          {item.accountName || "—"}
                        </div>
                      </td>

                      <td className="text-end fw-bold">
                        {formatMoney(item.amount)}
                      </td>

                      <td>
                        <span className={getStatusBadgeClass(item.status)}>
                          {getStatusText(item.status)}
                        </span>
                      </td>

                      <td>{formatDateTime(item.requestedAt)}</td>

                      <td>{formatDateTime(item.reviewedAt)}</td>

                      <td>{formatDateTime(item.paidAt)}</td>

                      <td className="withdrawal-reject-reason">
                        {item.rejectReason || "—"}
                      </td>

                      <td>
                        {item.proofImageUrl ? (
                          <a
                            href={item.proofImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            Xem
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
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

export default TeacherWithdrawalPage;