import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPendingRefundRequests,
  reviewRefund,
} from "../../../api/adminApi";
import RefundBankInfo from "../../../components/RefundBankInfo/RefundBankInfo";
import AdminUserLink from "../../../components/admin/AdminUserLink";
import "../TransactionManagement/TransactionManagement.css";
import { toast } from "react-toastify";
function RefundManagement() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [error, setError] = useState("");
  const [transferRefund, setTransferRefund] = useState(null);
  const [sseMessage, setSseMessage] = useState("");

  useEffect(() => {
    loadRefunds();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8080/webhooks/sepay/sse");

    eventSource.onopen = () => {
      console.log("SSE opened");
    };

    eventSource.addEventListener("CONNECTED", (event) => {
      console.log("Admin SSE connected:", event.data);
    });

    eventSource.addEventListener("PAID", (event) => {
      const data = JSON.parse(event.data);

      console.log("SSE PAID:", data);

      setSseMessage(data.message || "Đã chuyển tiền thành công.");
      toast.success(data.message );

      setTransferRefund(null);

      setTimeout(() => {
        loadRefunds();
      }, 500);
    });

    eventSource.addEventListener("FAILED", (event) => {
      const data = JSON.parse(event.data);

      console.log("SSE FAILED:", data);

      setSseMessage(data.message);
      toast.error(data.message);

      setTimeout(() => {
        loadRefunds();
      }, 500);
    });

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPendingRefundRequests();
      const data = res.data?.result ?? res.data?.data ?? res.data;
      console.log(data);

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

  const getRefundStatus = (refund) =>
    String(refund.status || refund.refundStatus || "").toUpperCase();

  const renderRefundStatus = (refund) => {
    const status = getRefundStatus(refund);

    const statusMap = {
      PENDING: {
        label: "Chờ duyệt",
        className: "badge bg-warning text-dark",
      },
      APPROVED: {
        label: "Đã duyệt - chờ chuyển tiền",
        className: "badge bg-primary",
      },
      PAID: {
        label: "Đã hoàn tiền",
        className: "badge bg-success",
      },
      REJECTED: {
        label: "Đã từ chối",
        className: "badge bg-danger",
      },
      FAILED: {
        label: "Chuyển tiền thất bại",
        className: "badge bg-danger",
      },

      // Các trạng thái bên teacher_earnings
      AVAILABLE: {
        label: "Có thể rút",
        className: "badge bg-success",
      },
      WITHDRAWN: {
        label: "Đã rút",
        className: "badge bg-secondary",
      },
      CANCELLED: {
        label: "Đã hủy",
        className: "badge bg-danger",
      },
      REFUNDED: {
        label: "Đã hoàn tiền",
        className: "badge bg-info text-dark",
      },
    };

    const item = statusMap[status] || {
      label: status || "Không xác định",
      className: "badge bg-secondary",
    };

    return <span className={item.className}>{item.label}</span>;
  };


  const handleTransfer = (refund) => {
    setTransferRefund(refund);
  };

  const closeTransferModal = () => {
    setTransferRefund(null);
  };

  const renderActionButtons = (refund) => {
    const status = getRefundStatus(refund);
    const isReviewing = reviewingId === refund.refundRequestId;

    if (status === "PENDING") {
      return (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-success"
            disabled={isReviewing}
            onClick={() => handleReview(refund.refundRequestId, true)}
          >
            Duyệt
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            disabled={isReviewing}
            onClick={() => handleReview(refund.refundRequestId, false)}
          >
            Từ chối
          </button>
        </div>
      );
    }

    if (status === "APPROVED") {
      return (
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => handleTransfer(refund)}
        >
          Chuyển tiền
        </button>
      );
    }

    return <span className="text-muted small">--</span>;
  };

  const handleReview = async (transactionId, approve) => {
    console.log(transactionId);

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

      {transferRefund && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
          onClick={closeTransferModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title">
                    Quét QR chuyển tiền hoàn tiền #{transferRefund.refundRequestId}
                  </h5>
                  <small className="text-muted">
                    Admin quét mã QR bằng app ngân hàng để chuyển tiền cho học viên.
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Đóng"
                  onClick={closeTransferModal}
                />
              </div>

              <div className="modal-body">
                <div className="row g-4 align-items-center">
                  <div className="col-md-5 text-center">
                    {transferRefund.qrPay ? (
                      <img
                        src={transferRefund.qrPay}
                        alt={`QR chuyển khoản hoàn tiền #${transferRefund.refundRequestId}`}
                        className="img-fluid border rounded p-2 bg-white"
                        style={{ maxWidth: 280 }}
                      />
                    ) : (
                      <div className="alert alert-warning mb-0">
                        Chưa có mã QR chuyển khoản cho yêu cầu này.
                      </div>
                    )}
                  </div>

                  <div className="col-md-7">
                    <div className="mb-3">
                      <div className="text-muted small">Số tiền</div>
                      <div className="fs-4 fw-bold text-danger">
                        {formatPrice(transferRefund.amount)}
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th className="bg-light" style={{ width: 160 }}>Ngân hàng</th>
                            <td>{transferRefund.refundBankName || "--"}</td>
                          </tr>
                          <tr>
                            <th className="bg-light">Số tài khoản</th>
                            <td className="fw-semibold">
                              {transferRefund.refundAccountNumber || "--"}
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-light">Chủ tài khoản</th>
                            <td>{transferRefund.refundAccountName || "--"}</td>
                          </tr>
                          <tr>
                            <th className="bg-light">Nội dung CK</th>
                            <td className="fw-semibold">
                              {transferRefund.paymentCode || `REFUND${transferRefund.refundRequestId}`}
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-light">Học viên</th>
                            <td>
                              {transferRefund.studentFullName || transferRefund.studentUsername || "--"}
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-light">Khóa học</th>
                            <td>{transferRefund.courseTitle || "--"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeTransferModal}
                >
                  Đóng
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeTransferModal}
                >
                  Kiểm tra
                </button>
                {transferRefund.qrPay ? (
                  <a
                    className="btn btn-primary"
                    href={transferRefund.qrPay}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mở QR
                  </a>
                ) : null}
              </div>
            </div>
          </div>
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
                {/* <th>STK hoàn</th> */}
                <th>Lý do</th>
                <th>Trạng thái</th>

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
                    <td>#{r.transactionItemId}</td>
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
                    {/* <td style={{ minWidth: 220 }}>
                      <RefundBankInfo
                        bankName={r.refundBankName}
                        accountNumber={r.refundAccountNumber}
                        accountName={r.refundAccountName}
                        studentName={r.studentFullName || r.studentUsername}
                        studentPhone={r.studentPhone}
                        amount={formatPrice(r.amount)}
                      />
                    </td> */}
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
                    <td>{renderRefundStatus(r)}</td>
                    <td>{renderActionButtons(r)}</td>
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
