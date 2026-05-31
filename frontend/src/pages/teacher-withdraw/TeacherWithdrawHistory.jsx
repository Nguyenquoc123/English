import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyWithdrawals } from "../../api/teacherApi";
import "./TeacherWithdraw.css";

function TeacherWithdrawHistory() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyWithdrawals();
      const data = res.data?.result ?? res.data?.data ?? res.data;
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được lịch sử rút tiền");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "PAID":
        return "Đã thanh toán";
      case "REJECTED":
        return "Từ chối";
      default:
        return status || "--";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "text-bg-warning";
      case "PAID":
        return "text-bg-success";
      case "REJECTED":
        return "text-bg-danger";
      default:
        return "text-bg-secondary";
    }
  };

  return (
    <div className="teacher-withdraw-page">
      <div className="teacher-withdraw-header">
        <div>
          <h2>Lịch sử rút tiền</h2>
          <p>Theo dõi trạng thái các yêu cầu rút tiền của bạn.</p>
        </div>
        <Link to="/teacher/withdrawals/create" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1" />
          Tạo yêu cầu mới
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="teacher-withdraw-card">
        {loading ? (
          <div className="teacher-withdraw-loading">
            <div className="spinner-border text-primary" />
            <span>Đang tải...</span>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="teacher-withdraw-empty">
            <i className="bi bi-wallet2" />
            <h5>Chưa có yêu cầu rút tiền</h5>
            <p>Tạo yêu cầu đầu tiên khi bạn có doanh thu khả dụng.</p>
            <Link to="/teacher/withdrawals/create" className="btn btn-primary">
              Tạo yêu cầu rút tiền
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Số tiền</th>
                  <th>Ngân hàng</th>
                  <th>Số TK</th>
                  <th>Trạng thái</th>
                  <th>Ngày yêu cầu</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w, idx) => (
                  <tr key={w.withdrawalId}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{formatCurrency(w.amount)}</td>
                    <td>{w.bankName || "--"}</td>
                    <td>{w.accountNumber || "--"}</td>
                    <td>
                      <span className={`badge rounded-pill ${getStatusClass(w.status)}`}>
                        {getStatusLabel(w.status)}
                      </span>
                    </td>
                    <td>{formatDateTime(w.requestedAt)}</td>
                    <td>
                      {w.status === "REJECTED" && w.rejectReason
                        ? w.rejectReason
                        : w.status === "PAID"
                          ? formatDateTime(w.paidAt)
                          : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherWithdrawHistory;
