import { useEffect, useState } from "react";
import { getPendingWithdrawals, getAllWithdrawals, reviewWithdrawal } from "../../../api/adminApi";
import "./Withdrawal.css";

function Withdrawal() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = tab === "pending"
        ? await getPendingWithdrawals()
        : await getAllWithdrawals();

      setWithdrawals(res.data || []);
    } catch {
      setError("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
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
    } catch {
      alert("Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "PENDING") return "badge rounded-pill text-bg-warning";
    if (status === "PAID") return "badge rounded-pill text-bg-success";
    if (status === "REJECTED") return "badge rounded-pill text-bg-danger";
    return "badge rounded-pill text-bg-secondary";
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
                <th className="text-end">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-5">
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
                      <div className="withdrawal-teacher-name">{w.teacherName || "--"}</div>
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
                        {w.status}
                      </span>
                    </td>

                    <td>{formatDateTime(w.requestedAt)}</td>

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
                                    onClick={() => { setSelected(null); setRejectReason(""); }}
                                  >
                                    Huỷ
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  disabled={actionLoading}
                                  onClick={() => handleReview(w.withdrawalId, "PAID")}
                                >
                                  Đã TT
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => { setSelected(w.withdrawalId); setRejectReason(""); }}
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                          </>
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
                  <td colSpan="9" className="text-center text-muted py-5">
                    Không có yêu cầu rút tiền nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Withdrawal;
