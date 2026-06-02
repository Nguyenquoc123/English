import { useEffect, useState } from "react";
import { getPendingWithdrawals, getAllWithdrawals, reviewWithdrawal, approveWithdrawal } from "../../../api/adminApi";
import AdminUserLink from "../../../components/admin/AdminUserLink";
import "./Withdrawal.css";
import { toast } from "react-toastify";

function Withdrawal() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [sseMessage, setSseMessage] = useState("");

  useEffect(() => {
    loadData();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8080/webhooks/sepay/sse");

    eventSource.addEventListener("CONNECTED", (event) => {
      console.log("Admin SSE connected:", event.data);
    });

    eventSource.addEventListener("PAID", (event) => {
      const data = JSON.parse(event.data);

      setSseMessage(data.message || "Đã chuyển tiền cho giáo viên thành công.");

      if (paymentModal?.paymentCode === data.transactionCode) {
        setPaymentModal(null);
      }
      console.log(data);
      console.log(paymentModal);

      toast.success(data.message)
      setTimeout(() => {
        setPaymentModal(null);
        window.location.reload();
      }, 500);

      // loadData();
    });

    eventSource.addEventListener("FAILED", (event) => {
      const data = JSON.parse(event.data);

      setSseMessage(data.message || "Chuyển tiền thất bại hoặc số tiền không khớp.");

      // loadData();
    });

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = tab === "pending"
        ? await getPendingWithdrawals()
        : await getAllWithdrawals();

      const data = res.data?.result ?? res.data?.data ?? res.data;
      console.log(data);

      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err) {
      const status = err.response?.status;
      setError(
        err.response?.data?.message ||
        (status === 401 || status === 403
          ? "Phiên đăng nhập admin hết hạn — vui lòng đăng nhập lại"
          : "Lỗi tải dữ liệu yêu cầu rút tiền")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    const ok = window.confirm("Duyệt yêu cầu rút tiền này?");
    if (!ok) return;

    try {
      setActionLoading(true);

      const res = await approveWithdrawal(withdrawalId);
      const approvedWithdrawal = res.data?.result ?? res.data?.data ?? res.data;
      console.log(approvedWithdrawal);


      setPaymentModal(approvedWithdrawal);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Duyệt yêu cầu rút tiền thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async (withdrawalId, status) => {
    if (status === "REJECTED" && !rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    const labels = {
      PAID: "Xác nhận đã thanh toán",
      REJECTED: "Từ chối",
    };

    const ok = window.confirm(`${labels[status]} yêu cầu rút tiền này?`);
    if (!ok) return;

    try {
      setActionLoading(true);

      await reviewWithdrawal(withdrawalId, status, status === "PAID" ? null : rejectReason);

      setSelected(null);
      setRejectReason("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "PENDING") return "badge rounded-pill text-bg-warning";
    if (status === "APPROVED") return "badge rounded-pill text-bg-info";
    if (status === "PAID") return "badge rounded-pill text-bg-success";
    if (status === "REJECTED") return "badge rounded-pill text-bg-danger";
    return "badge rounded-pill text-bg-secondary";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "PAID":
        return "Đã thanh toán";
      case "REJECTED":
        return "Từ chối";
      default:
        return status || "--";
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  return (
    <div className="admin-withdrawal-page">
      <div className="admin-page-heading">
        <div>
          <h2>Quản lý rút tiền</h2>
          <p>
            Admin xét duyệt các yêu cầu rút tiền của giáo viên.
            Xác nhận đã chuyển khoản hoặc từ chối với lý do cụ thể.
          </p>
        </div>

        <button className="btn btn-outline-secondary" onClick={loadData}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      <div className="admin-filter-card">
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${tab === "pending" ? "btn-warning" : "btn-outline-secondary"}`}
            onClick={() => setTab("pending")}
          >
            <i className="bi bi-hourglass-split me-1"></i>
            Chờ duyệt
          </button>

          <button
            className={`btn btn-sm ${tab === "all" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setTab("all")}
          >
            <i className="bi bi-list-ul me-1"></i>
            Tất cả
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="admin-table-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0 fw-bold">Danh sách yêu cầu rút tiền</h5>
            <small className="text-muted">Tìm thấy {withdrawals.length} yêu cầu</small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle admin-withdrawal-table">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Giáo viên</th>
                <th>Ngân hàng</th>
                <th>Số TK</th>
                <th>Chủ TK</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày yêu cầu</th>
                <th>Ngày xử lý</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải danh sách yêu cầu rút tiền...
                  </td>
                </tr>
              )}

              {!loading &&
                withdrawals.map((w, idx) => (
                  <tr key={w.withdrawalId}>
                    <td>{idx + 1}</td>

                    <td>
                      <AdminUserLink userId={w.teacherId} className="d-inline-block">
                        <span className="withdrawal-teacher-name">{w.teacherName || "--"}</span>
                      </AdminUserLink>
                      <div className="withdrawal-teacher-email text-muted small">
                        {w.teacherEmail || "--"}
                      </div>
                    </td>

                    <td>{w.bankName || "--"}</td>
                    <td>{w.accountNumber || "--"}</td>
                    <td>{w.accountHolder || "--"}</td>

                    <td className="fw-semibold">{formatPrice(w.amount)}</td>

                    <td>
                      <span className={getStatusBadge(w.status)}>
                        {getStatusLabel(w.status)}
                      </span>
                    </td>

                    <td>{formatDateTime(w.requestedAt)}</td>
                    <td>{formatDateTime(w.reviewedAt || w.paidAt)}</td>

                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        {w.status === "PENDING" && (
                          <>
                            {selected === w.withdrawalId ? (
                              <div className="withdrawal-reject-form">
                                <input
                                  className="form-control form-control-sm mb-1"
                                  placeholder="Lý do từ chối..."
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                />

                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    disabled={actionLoading}
                                    onClick={() => handleReview(w.withdrawalId, "REJECTED")}
                                  >
                                    {actionLoading ? "..." : "Từ chối"}
                                  </button>

                                  <button
                                    className="btn btn-sm btn-light"
                                    onClick={() => {
                                      setSelected(null);
                                      setRejectReason("");
                                    }}
                                  >
                                    Huỷ
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  disabled={actionLoading}
                                  onClick={() => handleApprove(w.withdrawalId)}
                                >
                                  {actionLoading ? "..." : "Duyệt"}
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {
                                    setSelected(w.withdrawalId);
                                    setRejectReason("");
                                  }}
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {w.status === "APPROVED" && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => setPaymentModal(w)}
                          >
                            Chuyển tiền
                          </button>
                        )}

                        {w.rejectReason && (
                          <div className="withdrawal-reject-reason text-muted small">
                            {w.rejectReason}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && withdrawals.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-5">
                    Không có yêu cầu rút tiền nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {paymentModal && (
        <div className="withdrawal-modal-backdrop">
          <div className="withdrawal-payment-modal">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="fw-bold mb-1">Thanh toán yêu cầu rút tiền</h5>
                <small className="text-muted">
                  Quét mã QR để chuyển tiền cho giáo viên.
                </small>
              </div>

              <button
                className="btn btn-sm btn-light"
                onClick={() => setPaymentModal(null)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>



            <div className="text-center">
              {paymentModal.qrPay ? (
                <img
                  src={paymentModal.qrPay}
                  alt="QR thanh toán"
                  className="withdrawal-qr-image"
                />
              ) : (
                <div className="alert alert-warning mb-0">
                  Không có mã QR thanh toán.
                </div>
              )}
            </div>

            <div className="withdrawal-payment-info mb-3">
              <div>
                <strong>Mã giao dịch:</strong> {paymentModal.paymentCode || "--"}
              </div>
              <div>
                <strong>Ngân hàng:</strong> {paymentModal.bankName || "--"}
              </div>
              <div>
                <strong>Số tài khoản:</strong> {paymentModal.accountNumber || "--"}
              </div>
              <div>
                <strong>Chủ tài khoản:</strong> {paymentModal.accountHolder || "--"}
              </div>
              <div>
                <strong>Số tiền:</strong> {formatPrice(paymentModal.amount)}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                className="btn btn-light"
                onClick={() => setPaymentModal(null)}
              >
                Đóng
              </button>

              <button
                className="btn btn-success"
                disabled={actionLoading}
                onClick={() => handleReview(paymentModal.withdrawalId, "PAID")}
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận đã chuyển tiền"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Withdrawal;
