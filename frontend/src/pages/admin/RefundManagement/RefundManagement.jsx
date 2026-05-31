import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPendingRefundRequests,
  reviewRefund,
} from "../../../api/adminApi";
import RefundBankInfo from "../../../components/RefundBankInfo/RefundBankInfo";
import AdminUserLink from "../../../components/admin/AdminUserLink";
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

    const internalNote = approve
      ? window.prompt("Ghi chú nội bộ admin (không bắt buộc):") || ""
      : "";

    try {
      setReviewingId(transactionId);
      await reviewRefund(transactionId, approve, note.trim(), internalNote.trim());
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
            Danh sách học viên gửi yêu cầu hoàn tiền — kiểm tra tiến độ học, lý do,
            STK ngân hàng rồi duyệt hoặc từ chối.
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
                <th>Khóa học / GV</th>
                <th>Số tiền</th>
                <th>Tiến độ</th>
                <th>STK hoàn</th>
                <th>Lý do</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center text-muted py-5">
                    Đang tải...
                  </td>
                </tr>
              ) : refunds.length === 0 ? null : (
                refunds.map((r, idx) => (
                  <tr key={r.refundRequestId}>
                    <td>{idx + 1}</td>
                    <td>#{r.refundRequestId}</td>
                    <td>#{r.transactionId}</td>
                    <td>
                      <AdminUserLink
                        userId={r.studentId}
                        className="fw-semibold d-inline-block"
                      >
                        {r.studentFullName || r.studentUsername}
                      </AdminUserLink>
                      <small className="text-muted d-block">@{r.studentUsername}</small>
                      <small className="text-muted d-block">{r.studentEmail}</small>
                      {r.studentPhone ? (
                        <small className="text-muted d-block">SĐT: {r.studentPhone}</small>
                      ) : null}
                    </td>
                    <td>
                      {r.courseId ? (
                        <Link
                          to={`/admin/courses/${r.courseId}/review`}
                          className="text-decoration-none text-primary fw-semibold"
                          title="Xem chi tiết khóa học"
                        >
                          {r.courseTitle || "Khóa học"}
                          <i className="bi bi-box-arrow-up-right ms-1 small opacity-75" />
                        </Link>
                      ) : (
                        <div>{r.courseTitle || "--"}</div>
                      )}
                      {r.teacherName ? (
                        <small className="text-muted d-block">GV: {r.teacherName}</small>
                      ) : null}
                      {r.courseId ? (
                        <small className="text-muted d-block">ID khóa: {r.courseId}</small>
                      ) : null}
                    </td>
                    <td className="fw-semibold">{formatPrice(r.amount)}</td>
                    <td>
                      <div>
                        {r.completedLessons ?? 0}/{r.totalLessons ?? 0} bài
                      </div>
                      {r.progressPercent != null ? (
                        <small className="text-muted d-block">
                          {Number(r.progressPercent).toFixed(1)}%
                        </small>
                      ) : null}
                      {r.purchaseAt ? (
                        <small className="text-muted d-block">
                          Mua: {formatDateTime(r.purchaseAt)}
                        </small>
                      ) : null}
                    </td>
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
                      <div className="fw-semibold small">
                        {r.reasonLabel || r.reasonCode || "--"}
                      </div>
                      {r.detailDescription ? (
                        <span className="text-muted small d-block">{r.detailDescription}</span>
                      ) : r.reason ? (
                        <span className="text-muted small d-block">{r.reason}</span>
                      ) : null}
                    </td>
                    <td>
                      <div>{formatDateTime(r.createdAt)}</div>
                      {r.refundDeadlineAt ? (
                        <small className="text-muted d-block">
                          Hạn: {formatDateTime(r.refundDeadlineAt)}
                        </small>
                      ) : null}
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RefundManagement;
