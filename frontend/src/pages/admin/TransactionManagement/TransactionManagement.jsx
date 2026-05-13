import { useEffect, useState } from "react";
import { getAllTransactions } from "../../../api/adminApi";
import "./TransactionManagement.css";

function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllTransactions();
      setTransactions(res.data || []);
    } catch {
      setError("Lỗi tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const successCount = transactions.filter((t) => t.status === "SUCCESS").length;
  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;
  const failedCount = transactions.filter((t) => t.status === "FAILED").length;

  const totalRevenue = transactions
    .filter((t) => t.status === "SUCCESS")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const filteredTransactions = transactions
    .filter((t) => (tab === "all" ? true : t.status === tab))
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (t.username || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q) ||
        (t.targetName || "").toLowerCase().includes(q)
      );
    });

  const getStatusBadge = (status) => {
    if (status === "SUCCESS") return "badge rounded-pill text-bg-success";
    if (status === "PENDING") return "badge rounded-pill text-bg-warning";
    if (status === "FAILED") return "badge rounded-pill text-bg-danger";
    return "badge rounded-pill text-bg-secondary";
  };

  const getStatusLabel = (status) => {
    if (status === "SUCCESS") return "Thành công";
    if (status === "PENDING") return "Đang chờ";
    if (status === "FAILED") return "Thất bại";
    return status || "--";
  };

  const getTargetTypeBadge = (targetType) => {
    if (targetType === "COURSE") return "badge rounded-pill bg-primary-subtle text-primary";
    if (targetType === "EXAM") return "badge rounded-pill bg-info-subtle text-info";
    return "badge rounded-pill bg-secondary-subtle text-secondary";
  };

  const getTargetTypeLabel = (targetType) => {
    if (targetType === "COURSE") return "Khóa học";
    if (targetType === "EXAM") return "Kỳ thi";
    return targetType || "--";
  };

  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return "--";
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

  return (
    <div className="admin-transaction-page">
      <div className="admin-page-heading">
        <div>
          <h2>Quản lý giao dịch</h2>
          <p>
            Admin xem lịch sử toàn bộ giao dịch thanh toán của học viên trong hệ thống.
          </p>
        </div>

        <button className="btn btn-outline-secondary" onClick={loadTransactions}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="admin-stat-icon bg-primary-subtle text-primary">
                <i className="bi bi-currency-exchange"></i>
              </div>
              <div>
                <div className="text-muted small">Tổng doanh thu</div>
                <h5 className="fw-bold mb-0">{formatPrice(totalRevenue)}</h5>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="admin-stat-icon bg-success-subtle text-success">
                <i className="bi bi-check-circle"></i>
              </div>
              <div>
                <div className="text-muted small">Thành công</div>
                <h4 className="fw-bold mb-0">{successCount}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="admin-stat-icon bg-warning-subtle text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div>
                <div className="text-muted small">Đang chờ</div>
                <h4 className="fw-bold mb-0">{pendingCount}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="admin-stat-icon bg-danger-subtle text-danger">
                <i className="bi bi-x-circle"></i>
              </div>
              <div>
                <div className="text-muted small">Thất bại</div>
                <h4 className="fw-bold mb-0">{failedCount}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-filter-card">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${tab === "all" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setTab("all")}
            >
              Tất cả ({transactions.length})
            </button>
            <button
              className={`btn btn-sm ${tab === "SUCCESS" ? "btn-success" : "btn-outline-secondary"}`}
              onClick={() => setTab("SUCCESS")}
            >
              Thành công ({successCount})
            </button>
            <button
              className={`btn btn-sm ${tab === "PENDING" ? "btn-warning" : "btn-outline-secondary"}`}
              onClick={() => setTab("PENDING")}
            >
              Đang chờ ({pendingCount})
            </button>
            <button
              className={`btn btn-sm ${tab === "FAILED" ? "btn-danger" : "btn-outline-secondary"}`}
              onClick={() => setTab("FAILED")}
            >
              Thất bại ({failedCount})
            </button>
          </div>

          <div className="ms-auto">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo username, email, tên sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
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
            <h5 className="mb-0 fw-bold">Danh sách giao dịch</h5>
            <small className="text-muted">
              Hiển thị {filteredTransactions.length} giao dịch
            </small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle admin-transaction-table">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>ID GD</th>
                <th>Học viên</th>
                <th>Email</th>
                <th>Loại</th>
                <th>Sản phẩm</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải danh sách giao dịch...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredTransactions.map((t, idx) => (
                  <tr key={t.transactionId}>
                    <td>{idx + 1}</td>

                    <td>
                      <span className="transaction-id-cell">#{t.transactionId}</span>
                    </td>

                    <td className="fw-semibold">{t.username || "--"}</td>

                    <td>
                      <span className="text-muted small">{t.email || "--"}</span>
                    </td>

                    <td>
                      <span className={getTargetTypeBadge(t.targetType)}>
                        {getTargetTypeLabel(t.targetType)}
                      </span>
                    </td>

                    <td>
                      <div className="transaction-product-cell">{t.targetName || "--"}</div>
                    </td>

                    <td className="fw-semibold">{formatPrice(t.amount)}</td>

                    <td>
                      <span className={getStatusBadge(t.status)}>
                        {getStatusLabel(t.status)}
                      </span>
                    </td>

                    <td>{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))}

              {!loading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-5">
                    Không có giao dịch nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>
        {`
          .admin-stat-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          }
        `}
      </style>
    </div>
  );
}

export default TransactionManagement;
