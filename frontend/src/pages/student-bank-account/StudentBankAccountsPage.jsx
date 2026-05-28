import { useEffect, useState } from "react";
import "../teacher-bank-account/TeacherBankAccountsPage.css";
import BankSelectField from "../../components/BankSelectField/BankSelectField";
import {
  resolveBankName,
  splitBankNameForForm,
} from "../../constants/vietnamBanks";
import {
  createStudentBankAccount,
  deleteStudentBankAccount,
  getMyStudentBankAccounts,
  setDefaultStudentBankAccount,
  updateStudentBankAccount,
} from "../../api/studentBankApi";

function StudentBankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState({
    bankSelect: "",
    customBankName: "",
    accountNumber: "",
    accountName: "",
    isDefault: false,
  });

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyStudentBankAccounts();
      const data = res.data?.result ?? res.data?.data ?? res.data;
      setBankAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.message ||
          data?.error ||
          (err.response?.status === 404
            ? "API chưa sẵn sàng — hãy khởi động lại backend (Spring Boot)"
            : null) ||
          (err.response?.status === 500
            ? "Lỗi server — hãy chạy migrations/create_student_bank_accounts.sql trên DB"
            : null) ||
          "Không thể tải danh sách tài khoản ngân hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    setForm({
      bankSelect: "",
      customBankName: "",
      accountNumber: "",
      accountName: "",
      isDefault: bankAccounts.length === 0,
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    const bankParts = splitBankNameForForm(account.bankName);
    setForm({
      bankSelect: bankParts.bankSelect,
      customBankName: bankParts.customBankName,
      accountNumber: account.accountNumber || "",
      accountName: account.accountName || "",
      isDefault: Boolean(account.isDefault),
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingAccount(null);
    setError("");
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const bankName = resolveBankName(form.bankSelect, form.customBankName);
    if (!bankName) return "Vui lòng chọn ngân hàng";
    if (!form.accountNumber.trim()) return "Vui lòng nhập số tài khoản";
    if (!/^[0-9]{6,30}$/.test(form.accountNumber.trim())) {
      return "Số tài khoản chỉ gồm số và từ 6 đến 30 ký tự";
    }
    if (!form.accountName.trim()) return "Vui lòng nhập tên chủ tài khoản";
    return "";
  };

  const saveBankAccount = async (e) => {
    e.preventDefault();
    const validateMessage = validateForm();
    if (validateMessage) {
      setError(validateMessage);
      return;
    }

    const payload = {
      bankName: resolveBankName(form.bankSelect, form.customBankName),
      accountNumber: form.accountNumber.trim(),
      accountName: form.accountName.trim(),
      isDefault: Boolean(form.isDefault),
    };

    try {
      setSaving(true);
      setError("");
      if (editingAccount) {
        await updateStudentBankAccount(
          editingAccount.studentBankAccountId,
          payload
        );
      } else {
        await createStudentBankAccount(payload);
      }
      setShowModal(false);
      setEditingAccount(null);
      await loadBankAccounts();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.message ||
          data?.error ||
          (err.response?.status === 500
            ? "Lỗi server — hãy chạy migrations/create_student_bank_accounts.sql trên DB và khởi động lại backend"
            : null) ||
          (err.response?.status === 403
            ? "Không có quyền truy cập — vui lòng đăng nhập lại bằng tài khoản học viên"
            : null) ||
          "Lưu tài khoản ngân hàng thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  const setDefaultAccount = async (account) => {
    try {
      setError("");
      await setDefaultStudentBankAccount(account.studentBankAccountId);
      await loadBankAccounts();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đặt tài khoản mặc định");
    }
  };

  const deleteBankAccount = async (account) => {
    const ok = window.confirm("Bạn có chắc muốn xóa tài khoản ngân hàng này?");
    if (!ok) return;

    try {
      setError("");
      await deleteStudentBankAccount(account.studentBankAccountId);
      await loadBankAccounts();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể xóa tài khoản");
    }
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return "";
    if (accountNumber.length <= 4) return accountNumber;
    return `${"*".repeat(Math.max(accountNumber.length - 4, 0))}${accountNumber.slice(-4)}`;
  };

  return (
    <div className="teacher-bank-page">
      <div className="container py-4">
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Tài khoản nhận hoàn tiền</h2>
          <p className="text-muted mb-0">
            Thêm STK để admin chuyển khoản khi duyệt yêu cầu hoàn tiền khóa học.
          </p>
        </div>

        {error && !showModal && (
          <div className="alert alert-danger d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle" />
            <span>{error}</span>
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-header bg-white px-4 py-3">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
              <div>
                <h5 className="fw-bold mb-1">Danh sách tài khoản</h5>
                <small className="text-muted">
                  {bankAccounts.length} tài khoản
                </small>
              </div>
              <button type="button" className="btn btn-primary" onClick={openCreateModal}>
                <i className="bi bi-plus-circle me-2" />
                Thêm tài khoản
              </button>
            </div>
          </div>

          <div className="card-body p-4">
            {loading ? (
              <div className="text-center text-muted py-5">Đang tải...</div>
            ) : bankAccounts.length === 0 ? (
              <div className="bank-empty-box">
                <div className="bank-empty-icon">
                  <i className="bi bi-bank" />
                </div>
                <h5 className="fw-bold mb-2">Chưa có tài khoản</h5>
                <p className="text-muted mb-3">
                  Bạn cần ít nhất một tài khoản mặc định trước khi gửi yêu cầu hoàn tiền.
                </p>
                <button type="button" className="btn btn-primary" onClick={openCreateModal}>
                  Thêm tài khoản đầu tiên
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {bankAccounts.map((account) => (
                  <div className="col-12 col-lg-6" key={account.studentBankAccountId}>
                    <div
                      className={
                        account.isDefault
                          ? "bank-account-card default"
                          : "bank-account-card"
                      }
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div className="bank-icon">
                          <i className="bi bi-bank2" />
                        </div>
                        {account.isDefault && (
                          <span className="badge rounded-pill text-bg-success">Mặc định</span>
                        )}
                      </div>
                      <h5 className="fw-bold mb-2">{account.bankName}</h5>
                      <div className="bank-info-list">
                        <div className="bank-info-row">
                          <span>Chủ tài khoản</span>
                          <strong>{account.accountName}</strong>
                        </div>
                        <div className="bank-info-row">
                          <span>Số tài khoản</span>
                          <strong>{maskAccountNumber(account.accountNumber)}</strong>
                        </div>
                      </div>
                      <div className="d-flex justify-content-end align-items-center gap-2 flex-wrap mt-4">
                        {!account.isDefault && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => setDefaultAccount(account)}
                          >
                            Đặt mặc định
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditModal(account)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteBankAccount(account)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block bank-modal-backdrop" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <form onSubmit={saveBankAccount}>
                <div className="modal-header px-4 py-3">
                  <h5 className="modal-title fw-bold">
                    {editingAccount ? "Cập nhật tài khoản" : "Thêm tài khoản nhận hoàn tiền"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    disabled={saving}
                  />
                </div>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <BankSelectField
                    bankSelect={form.bankSelect}
                    customBankName={form.customBankName}
                    onBankSelectChange={(value) => handleChange("bankSelect", value)}
                    onCustomBankNameChange={(value) => handleChange("customBankName", value)}
                    disabled={saving}
                    selectId="studentBankSelect"
                    customId="studentCustomBankName"
                  />
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Số tài khoản</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.accountNumber}
                      onChange={(e) =>
                        handleChange("accountNumber", e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên chủ tài khoản</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      value={form.accountName}
                      onChange={(e) => handleChange("accountName", e.target.value)}
                    />
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="studentDefaultBank"
                      checked={form.isDefault}
                      onChange={(e) => handleChange("isDefault", e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="studentDefaultBank">
                      Đặt làm tài khoản mặc định
                    </label>
                  </div>
                </div>
                <div className="modal-footer px-4 py-3">
                  <button type="button" className="btn btn-light border" onClick={closeModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Đang lưu..." : editingAccount ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show" />}
    </div>
  );
}

export default StudentBankAccountsPage;
