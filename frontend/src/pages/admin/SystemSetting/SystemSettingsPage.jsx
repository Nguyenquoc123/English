import { useEffect, useState } from "react";
import axios from "axios";
import "./SystemSettingsPage.css";

function SystemSettingsPage() {
    const API_BASE = "http://localhost:8080";

    const [settings, setSettings] = useState([]);
    const [editingValues, setEditingValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const token = getToken();

            const { data } = await axios.get(`${API_BASE}/admin/system-settings`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            setSettings(data || []);

            const values = {};
            (data || []).forEach((item) => {
                values[item.settingId] = item.settingValue;
            });

            setEditingValues(values);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data;
            setError(typeof msg === "string" ? msg : "Không thể tải cấu hình hệ thống.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeValue = (settingId, value) => {
        setEditingValues((prev) => ({
            ...prev,
            [settingId]: value,
        }));
    };

    const handleSave = async (setting) => {
        setError("");
        setMessage("");

        const newValue = editingValues[setting.settingId];

        if (newValue === undefined || String(newValue).trim() === "") {
            setError("Giá trị cấu hình không được để trống.");
            return;
        }

        try {
            setSavingId(setting.settingId);

            const token = getToken();

            const { data } = await axios.put(
                `${API_BASE}/admin/system-settings/${setting.settingId}`,
                {
                    settingValue: String(newValue).trim(),
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            setSettings((prev) =>
                prev.map((item) =>
                    item.settingId === setting.settingId ? data : item
                )
            );

            setEditingValues((prev) => ({
                ...prev,
                [setting.settingId]: data.settingValue,
            }));

            setMessage(`Đã cập nhật ${setting.settingKey} thành công.`);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data;
            setError(typeof msg === "string" ? msg : "Cập nhật cấu hình thất bại.");
        } finally {
            setSavingId(null);
        }
    };

    const handleResetValue = (setting) => {
        setEditingValues((prev) => ({
            ...prev,
            [setting.settingId]: setting.settingValue,
        }));
    };

    const formatDate = (value) => {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString("vi-VN");
    };

    const getSettingLabel = (key) => {
        switch (key) {
            case "PLATFORM_FEE_PERCENT":
                return "Phí hệ thống";
            case "MIN_WITHDRAW_AMOUNT":
                return "Số tiền rút tối thiểu";
            case "AI_DAILY_LIMIT_STUDENT":
                return "Giới hạn AI học viên";
            case "AI_DAILY_LIMIT_TEACHER":
                return "Giới hạn AI giáo viên";
            case "AI_DAILY_LIMIT_ADMIN":
                return "Giới hạn AI admin";
            default:
                return key;
        }
    };

    const getValueSuffix = (key) => {
        if (key === "PLATFORM_FEE_PERCENT") {
            return "%";
        }

        if (key === "MIN_WITHDRAW_AMOUNT") {
            return "VNĐ";
        }

        if (key.startsWith("AI_DAILY_LIMIT")) {
            return "lượt/ngày";
        }

        return "";
    };

    return (
        <div className="system-settings-page">
            <div className="system-settings-header">
                <div>
                    <h1>Cấu hình hệ thống</h1>
                    <p>Quản lý phí nền tảng, giới hạn AI và các tham số vận hành.</p>
                </div>

                <button
                    type="button"
                    className="system-settings-refresh-btn"
                    onClick={fetchSettings}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                    Làm mới
                </button>
            </div>

            {message && (
                <div className="system-settings-alert success">
                    <i className="bi bi-check-circle"></i>
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div className="system-settings-alert error">
                    <i className="bi bi-exclamation-circle"></i>
                    <span>{error}</span>
                </div>
            )}

            <div className="system-settings-card">
                {loading ? (
                    <div className="system-settings-loading">
                        <span className="spinner-border spinner-border-sm"></span>
                        Đang tải cấu hình...
                    </div>
                ) : (
                    <div className="system-settings-table-wrap">
                        <table className="system-settings-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Cấu hình</th>
                                    <th>Key</th>
                                    <th>Giá trị</th>
                                    <th>Mô tả</th>
                                    <th>Cập nhật</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {settings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="system-settings-empty">
                                            Chưa có cấu hình nào.
                                        </td>
                                    </tr>
                                ) : (
                                    settings.map((setting, index) => {
                                        const currentValue =
                                            editingValues[setting.settingId] ?? "";

                                        const changed =
                                            String(currentValue) !==
                                            String(setting.settingValue);

                                        return (
                                            <tr key={setting.settingId}>
                                                <td>{index + 1}</td>

                                                <td>
                                                    <div className="system-settings-name">
                                                        {getSettingLabel(setting.settingKey)}
                                                    </div>
                                                </td>

                                                <td>
                                                    <code>{setting.settingKey}</code>
                                                </td>

                                                <td>
                                                    <div className="system-settings-value-cell">
                                                        <input
                                                            type="text"
                                                            value={currentValue}
                                                            onChange={(e) =>
                                                                handleChangeValue(
                                                                    setting.settingId,
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                        {getValueSuffix(setting.settingKey) && (
                                                            <span>
                                                                {getValueSuffix(
                                                                    setting.settingKey
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="system-settings-description">
                                                        {setting.description || "-"}
                                                    </div>
                                                </td>

                                                <td>{formatDate(setting.updatedAt)}</td>

                                                <td>
                                                    <div className="system-settings-actions">
                                                        <button
                                                            type="button"
                                                            className="system-settings-save-btn"
                                                            onClick={() => handleSave(setting)}
                                                            disabled={
                                                                !changed ||
                                                                savingId === setting.settingId
                                                            }
                                                        >
                                                            {savingId === setting.settingId ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm"></span>
                                                                    Lưu
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-save"></i>
                                                                    Lưu
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="system-settings-reset-btn"
                                                            onClick={() =>
                                                                handleResetValue(setting)
                                                            }
                                                            disabled={!changed}
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SystemSettingsPage;