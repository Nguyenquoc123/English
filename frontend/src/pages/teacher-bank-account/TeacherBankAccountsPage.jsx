import { useEffect, useState } from "react";
import "./TeacherBankAccountsPage.css";
import BankSelectField from "../../components/BankSelectField/BankSelectField";
import {
  resolveBankName,
  splitBankNameForForm,
} from "../../constants/vietnamBanks";

const API_BASE = "http://localhost:8080";

function TeacherBankAccountsPage() {
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

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    const authHeaders = () => {
        const token = getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        loadBankAccounts();
    }, []);

    const loadBankAccounts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE}/bank-account`, {
                method: "GET",
                headers: authHeaders(),
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            const result = data?.result || data?.data || data || [];

            if (!response.ok) {
                setError(data?.message || "Không thể tải danh sách tài khoản ngân hàng");
                return;
            }

            setBankAccounts(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
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
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        if (!resolveBankName(form.bankSelect, form.customBankName)) {
            return "Vui lòng chọn ngân hàng";
        }

        if (!form.accountNumber.trim()) {
            return "Vui lòng nhập số tài khoản";
        }

        if (!/^[0-9]{6,30}$/.test(form.accountNumber.trim())) {
            return "Số tài khoản chỉ gồm số và từ 6 đến 30 ký tự";
        }

        if (!form.accountName.trim()) {
            return "Vui lòng nhập tên chủ tài khoản";
        }

        return "";
    };

    const saveBankAccount = async (e) => {
        e.preventDefault();

        const validateMessage = validateForm();

        if (validateMessage) {
            setError(validateMessage);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                bankName: resolveBankName(form.bankSelect, form.customBankName),
                accountNumber: form.accountNumber.trim(),
                accountName: form.accountName.trim().toUpperCase(),
                isDefault: Boolean(form.isDefault),
            };

            const isEdit = Boolean(editingAccount);

            const url = isEdit
                ? `${API_BASE}/bank-account/${editingAccount.bankAccountId}`
                : `${API_BASE}/bank-account`;

            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                body: JSON.stringify(payload),
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                setError(data?.message || "Lưu tài khoản ngân hàng thất bại");
                return;
            }

            setShowModal(false);
            setEditingAccount(null);
            await loadBankAccounts();
        } catch (err) {
            console.error(err);
            setError("Lỗi hệ thống, vui lòng thử lại");
        } finally {
            setSaving(false);
        }
    };

    const setDefaultAccount = async (account) => {
        try {
            setError("");

            const response = await fetch(
                `${API_BASE}/bank-account/${account.bankAccountId}/default`,
                {
                    method: "PATCH",
                    headers: authHeaders(),
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                setError(data?.message || "Không thể đặt tài khoản mặc định");
                return;
            }

            await loadBankAccounts();
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        }
    };

    const deleteBankAccount = async (account) => {
        const confirmDelete = window.confirm(
            `Bạn có chắc muốn xóa tài khoản ${account.bankName} - ${account.accountNumber}?`
        );

        if (!confirmDelete) return;

        try {
            setError("");

            const response = await fetch(
                `${API_BASE}/bank-account/${account.bankAccountId}`,
                {
                    method: "DELETE",
                    headers: authHeaders(),
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                setError(data?.message || "Xóa tài khoản ngân hàng thất bại");
                return;
            }

            await loadBankAccounts();
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        }
    };

    const maskAccountNumber = (accountNumber) => {
        if (!accountNumber) return "";

        if (accountNumber.length <= 4) return accountNumber;

        return `${"*".repeat(Math.max(accountNumber.length - 4, 0))}${accountNumber.slice(-4)}`;
    };

    return (
        <div className="teacher-bank-page">
            <div className="container-fluid px-0">
                

                {error && !showModal && (
                    <div className="alert alert-danger d-flex align-items-center gap-2">
                        <i className="bi bi-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white px-4 py-3">
                        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                            <div>
                                <h5 className="fw-bold mb-1">Danh sách tài khoản</h5>
                                <small className="text-muted">
                                    {bankAccounts.length} tài khoản ngân hàng
                                </small>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={openCreateModal}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Thêm tài khoản ngân hàng mới
                            </button>
                        </div>
                    </div>

                    <div className="card-body p-4">
                        {loading ? (
                            <div className="text-center text-muted py-5">
                                <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                Đang tải tài khoản ngân hàng...
                            </div>
                        ) : bankAccounts.length === 0 ? (
                            <div className="bank-empty-box">
                                <div className="bank-empty-icon">
                                    <i className="bi bi-bank"></i>
                                </div>

                                <h5 className="fw-bold mb-2">Chưa có tài khoản ngân hàng</h5>
                                <p className="text-muted mb-3">
                                    Thêm tài khoản ngân hàng để nhận tiền rút doanh thu.
                                </p>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={openCreateModal}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Thêm tài khoản đầu tiên
                                </button>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {bankAccounts.map((account) => (
                                    <div className="col-12 col-lg-6" key={account.bankAccountId}>
                                        <div
                                            className={
                                                account.isDefault
                                                    ? "bank-account-card default"
                                                    : "bank-account-card"
                                            }
                                        >
                                            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                                                <div className="bank-icon">
                                                    <i className="bi bi-bank2"></i>
                                                </div>

                                                {account.isDefault && (
                                                    <span className="badge rounded-pill text-bg-success">
                                                        Mặc định
                                                    </span>
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
                                                        <i className="bi bi-check2-circle me-1"></i>
                                                        Đặt mặc định
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => openEditModal(account)}
                                                >
                                                    <i className="bi bi-pencil-square me-1"></i>
                                                    Sửa
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => deleteBankAccount(account)}
                                                >
                                                    <i className="bi bi-trash me-1"></i>
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
                                    <div>
                                        <h5 className="modal-title fw-bold">
                                            {editingAccount
                                                ? "Cập nhật tài khoản ngân hàng"
                                                : "Thêm tài khoản ngân hàng mới"}
                                        </h5>
                                        <small className="text-muted">
                                            Thông tin này dùng để nhận tiền rút doanh thu.
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeModal}
                                        disabled={saving}
                                    ></button>
                                </div>

                                <div className="modal-body p-4">
                                    {error && (
                                        <div className="alert alert-danger d-flex align-items-center gap-2">
                                            <i className="bi bi-exclamation-triangle"></i>
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <BankSelectField
                                        bankSelect={form.bankSelect}
                                        customBankName={form.customBankName}
                                        onBankSelectChange={(value) => handleChange("bankSelect", value)}
                                        onCustomBankNameChange={(value) =>
                                            handleChange("customBankName", value)
                                        }
                                        disabled={saving}
                                        selectId="teacherBankSelect"
                                        customId="teacherCustomBankName"
                                    />

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Số tài khoản <span className="text-danger">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nhập số tài khoản"
                                            value={form.accountNumber}
                                            onChange={(e) =>
                                                handleChange(
                                                    "accountNumber",
                                                    e.target.value.replace(/\D/g, "")
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Tên chủ tài khoản <span className="text-danger">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control text-uppercase"
                                            placeholder="Ví dụ: NGUYEN VAN A"
                                            value={form.accountName}
                                            onChange={(e) => handleChange("accountName", e.target.value)}
                                        />
                                    </div>

                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            id="isDefaultBankAccount"
                                            checked={form.isDefault}
                                            onChange={(e) => handleChange("isDefault", e.target.checked)}
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor="isDefaultBankAccount"
                                        >
                                            Đặt làm tài khoản mặc định
                                        </label>
                                    </div>
                                </div>

                                <div className="modal-footer px-4 py-3">
                                    <button
                                        type="button"
                                        className="btn btn-light border"
                                        onClick={closeModal}
                                        disabled={saving}
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Đang lưu...
                                            </>
                                        ) : editingAccount ? (
                                            "Cập nhật"
                                        ) : (
                                            "Thêm tài khoản"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
}

export default TeacherBankAccountsPage;