import { useEffect, useState } from "react";
import {
  getPendingRefundRequests,
  reviewRefund,
} from "../../../api/adminApi";
import RefundBankInfo from "../../../components/RefundBankInfo/RefundBankInfo";
import "../TransactionManagement/TransactionManagement.css";

function RefundManagement() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPendingRefundRequests();
      const data = res.data?.result ?? res.data?.data ?? res.data;
      setRefunds(Array.isArray(data) ? data : []);
    } catch (err) {
      setRefunds([]);
      const status = err.response?.status;
      setError(
        err.response?.data?.message ||
          (status === 401 || status === 403
            ? "Phiên đăng nhập admin hết hạn — vui lòng đăng nhập lại"
            : `Không tải được danh sách yêu cầu hoàn tiền${status ? ` (${status})` : ""}`)
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    if (amount == null) return "--";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  const handleReview = async (transactionId, approve) => {
    const note = window.prompt(
      approve
        ? "Ghi chú duyệt hoàn tiền (không bắt buộc):"
        : "Nhập lý do từ chối hoàn tiền:"
    );
    if (note === null) return;

    try {
      setReviewingId(transactionId);
      await reviewRefund(transactionId, approve, note.trim());
      await loadRefunds();
      alert(approve ? "Đã duyệt hoàn tiền" : "Đã từ chối hoàn tiền");
    } catch (err) {
      alert(err.response?.data?.message || "Xử lý hoàn tiền thất bại");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="admin-transaction-page">
      <div className="admin-page-heading">
        <div>
          <h2>Yêu cầu hoàn tiền</h2>
          <p>
            Danh sách học viên gửi yêu cầu hoàn tiền — xem đủ STK ngân hàng để
            chuyển khoản hoàn, sau đó bấm Duyệt.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadRefunds}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Tải lại
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && refunds.length === 0 && (
        <div className="alert alert-info">
          Hiện chưa có yêu cầu hoàn tiền nào đang chờ duyệt.
        </div>
      )}

      <div className="admin-table-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle admin-transaction-table">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Mã YC</th>
                <th>ID GD</th>
                <th>Học viên</th>
                <th>Khóa học</th>
                <th>Số tiền</th>
                <th>Thông tin chuyển khoản hoàn</th>
                <th>Lý do</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-5">
                    Đang tải...
                  </td>
                </tr>
              )}

              {!loading &&
                refunds.map((r, idx) => (
                  <tr key={r.refundRequestId}>
                    <td>{idx + 1}</td>
                    <td>#{r.refundRequestId}</td>
                    <td>#{r.transactionId}</td>
                    <td>
                      <div className="fw-semibold">
                        {r.studentFullName || r.studentUsername}
                      </div>
                      <small className="text-muted d-block">@{r.studentUsername}</small>
                      <small className="text-muted d-block">{r.studentEmail}</small>
                      {r.studentPhone && (
                        <small className="text-muted d-block">SĐT: {r.studentPhone}</small>
                      )}
                    </td>
                    <td>{r.courseTitle || "--"}</td>
                    <td className="fw-semibold">{formatPrice(r.amount)}</td>
                    <td style={{ minWidth: 220 }}>
                      <RefundBankInfo
                        bankName={r.refundBankName}
                        accountNumber={r.refundAccountNumber}
                        accountName={r.refundAccountName}
                        studentName={r.studentFullName || r.studentUsername}
                        studentPhone={r.studentPhone}
                        amount={formatPrice(r.amount)}
                      />
                    </td>
                    <td>
                      <span className="text-muted small">{r.reason || "--"}</span>
                    </td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          disabled={reviewingId === r.transactionId}
                          onClick={() => handleReview(r.transactionId, true)}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={reviewingId === r.transactionId}
                          onClick={() => handleReview(r.transactionId, false)}
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RefundManagement;
