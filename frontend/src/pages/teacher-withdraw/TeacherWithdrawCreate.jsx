import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createWithdrawal, getWithdrawalSummary } from "../../api/teacherApi";
import "./TeacherWithdraw.css";

function TeacherWithdrawCreate() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [amount, setAmount] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getWithdrawalSummary();
      const data = res.data?.result ?? res.data?.data ?? res.data;
      setSummary(data);
      if (data?.bankAccounts?.length) {
        const defaultAccount =
          data.bankAccounts.find((a) => a.isDefault) || data.bankAccounts[0];
        setBankAccountId(String(defaultAccount.bankAccountId));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được thông tin rút tiền");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const availableBalance = Number(summary?.availableBalance || 0);
  const hasBankAccount = (summary?.bankAccounts?.length || 0) > 0;

  const parsedAmount = useMemo(() => {
    const raw = String(amount || "").replace(/\D/g, "");
    return raw ? Number(raw) : 0;
  }, [amount]);

  const handleUseAll = () => {
    if (availableBalance > 0) {
      setAmount(String(Math.floor(availableBalance)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!hasBankAccount) {
      setError("Vui lòng thêm tài khoản ngân hàng trước khi rút tiền");
      return;
    }

    if (parsedAmount <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (parsedAmount > availableBalance) {
      setError("Số tiền vượt quá số dư khả dụng");
      return;
    }

    const ok = window.confirm(
      `Gửi yêu cầu rút ${formatCurrency(parsedAmount)}? Admin sẽ chuyển khoản sau khi duyệt.`
    );
    if (!ok) return;

    try {
      setSubmitting(true);
      await createWithdrawal(parsedAmount, Number(bankAccountId));
      setSuccess("Đã gửi yêu cầu rút tiền. Vui lòng chờ admin xử lý.");
      setAmount("");
      await loadSummary();
    } catch (err) {
      setError(err.response?.data?.message || "Gửi yêu cầu rút tiền thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="teacher-withdraw-page">
      <div className="teacher-withdraw-header">
        <div>
          <h2>Tạo yêu cầu rút tiền</h2>
          <p>Rút doanh thu khóa học về tài khoản ngân hàng đã đăng ký.</p>
        </div>
        <Link to="/teacher/withdrawals" className="btn btn-outline-primary">
          <i className="bi bi-clock-history me-1" />
          Lịch sử rút tiền
        </Link>
      </div>

      {loading ? (
        <div className="teacher-withdraw-loading">
          <div className="spinner-border text-primary" />
          <span>Đang tải...</span>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="teacher-withdraw-card">
              <h5 className="fw-bold mb-3">Số dư doanh thu</h5>
              <div className="balance-item">
                <span>Tổng doanh thu</span>
                <strong>{formatCurrency(summary?.totalRevenue)}</strong>
              </div>
              <div className="balance-item">
                <span>Đang chờ duyệt</span>
                <strong className="text-warning">
                  {formatCurrency(summary?.pendingWithdrawalAmount)}
                </strong>
              </div>
              <div className="balance-item highlight">
                <span>Khả dụng để rút</span>
                <strong className="text-success">
                  {formatCurrency(summary?.availableBalance)}
                </strong>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="teacher-withdraw-card">
              {!hasBankAccount ? (
                <div className="teacher-withdraw-empty">
                  <i className="bi bi-bank2" />
                  <h5>Chưa có tài khoản ngân hàng</h5>
                  <p>Thêm STK nhận tiền trước khi tạo yêu cầu rút.</p>
                  <Link to="/teacher/bank" className="btn btn-primary">
                    Thêm tài khoản ngân hàng
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger py-2">{error}</div>
                  )}
                  {success && (
                    <div className="alert alert-success py-2">{success}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Tài khoản nhận tiền
                    </label>
                    <select
                      className="form-select"
                      value={bankAccountId}
                      onChange={(e) => setBankAccountId(e.target.value)}
                      disabled={submitting}
                    >
                      {summary.bankAccounts.map((acc) => (
                        <option key={acc.bankAccountId} value={acc.bankAccountId}>
                          {acc.bankName} — {acc.accountNumber} — {acc.accountName}
                          {acc.isDefault ? " (Mặc định)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Số tiền rút (VND)
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập số tiền"
                        value={amount}
                        onChange={(e) =>
                          setAmount(e.target.value.replace(/\D/g, ""))
                        }
                        disabled={submitting || availableBalance <= 0}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleUseAll}
                        disabled={submitting || availableBalance <= 0}
                      >
                        Rút tất cả
                      </button>
                    </div>
                    <small className="text-muted">
                      Tối đa: {formatCurrency(availableBalance)}
                    </small>
                  </div>

                  <div className="teacher-withdraw-note">
                    <i className="bi bi-info-circle me-2" />
                    Sau khi gửi yêu cầu, khoản tiền sẽ được chuyển vào tài khoản
                    đã đăng ký trong vòng 01 ngày làm việc.
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary mt-3"
                    disabled={
                      submitting || availableBalance <= 0 || parsedAmount <= 0
                    }
                  >
                    {submitting ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherWithdrawCreate;
