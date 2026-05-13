import { useEffect, useState } from "react";
import { getAllNotifications, createNotification } from "../../../api/adminApi";
import "./NotificationManagement.css";

function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formTargetType, setFormTargetType] = useState("ALL");
  const [formTargetValue, setFormTargetValue] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const res = await getAllNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Lỗi tải lịch sử thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!formTitle.trim()) {
      alert("Vui lòng nhập tiêu đề thông báo");
      return;
    }

    if (!formMessage.trim()) {
      alert("Vui lòng nhập nội dung thông báo");
      return;
    }

    if (formTargetType !== "ALL" && !formTargetValue.trim()) {
      alert("Vui lòng nhập đối tượng nhận thông báo");
      return;
    }

    if (formTargetType === "USER" && isNaN(Number(formTargetValue.trim()))) {
      alert("ID người dùng phải là số nguyên (ví dụ: 42)");
      return;
    }

    try {
      setSending(true);

      const targetValue = formTargetType === "ALL" ? null : formTargetValue.trim();

      await createNotification(formTitle, formMessage, formTargetType, targetValue);

      alert("Gửi thông báo thành công!");

      setFormTitle("");
      setFormMessage("");
      setFormTargetType("ALL");
      setFormTargetValue("");

      loadNotifications();
    } catch {
      alert("Gửi thất bại. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const getTargetTypeLabel = (type) => {
    if (type === "ALL") return "Toàn hệ thống";
    if (type === "ROLE") return "Theo vai trò";
    if (type === "USER") return "Người dùng cụ thể";
    return type;
  };

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  return (
    <div className="admin-notification-page">
      <div className="admin-page-heading">
        <div>
          <h2>Quản lý thông báo</h2>
          <p>
            Admin soạn và gửi thông báo đến người dùng, xem lịch sử thông báo đã gửi.
          </p>
        </div>
      </div>

      <div className="admin-notification-layout">
        <div className="admin-table-card">
          <h5 className="fw-bold mb-4">Soạn thông báo mới</h5>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Tiêu đề <span className="text-danger">*</span>
            </label>
            <input
              className="form-control"
              type="text"
              placeholder="Nhập tiêu đề thông báo..."
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Nội dung <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              placeholder="Nhập nội dung thông báo..."
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              rows={5}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Đối tượng nhận</label>
            <select
              className="form-select"
              value={formTargetType}
              onChange={(e) => {
                setFormTargetType(e.target.value);
                setFormTargetValue("");
              }}
            >
              <option value="ALL">Toàn hệ thống</option>
              <option value="ROLE">Theo vai trò</option>
              <option value="USER">Người dùng cụ thể</option>
            </select>
          </div>

          {formTargetType !== "ALL" && (
            <div className="mb-3">
              <label className="form-label fw-semibold">
                {formTargetType === "ROLE" ? "Tên vai trò" : "ID người dùng"}
                <span className="text-danger"> *</span>
              </label>
              <input
                className="form-control"
                type="text"
                placeholder={
                  formTargetType === "ROLE"
                    ? "Nhập tên vai trò: student / teacher / admin"
                    : "Nhập ID người dùng (số nguyên)"
                }
                value={formTargetValue}
                onChange={(e) => setFormTargetValue(e.target.value)}
              />
              <small className="text-muted">
                {formTargetType === "ROLE"
                  ? "Ví dụ: student, teacher, admin"
                  : "Ví dụ: 42 (userId của người dùng cần gửi)"}
              </small>
            </div>
          )}

          <button
            className="btn btn-primary w-100"
            disabled={sending}
            onClick={handleSend}
          >
            {sending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang gửi...
              </>
            ) : (
              <>
                <i className="bi bi-send me-1"></i>
                Gửi thông báo
              </>
            )}
          </button>
        </div>

        <div className="admin-table-card">
          <h5 className="fw-bold mb-3">Lịch sử thông báo đã gửi</h5>

          {loading && (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border spinner-border-sm text-primary me-2"></div>
              Đang tải...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="text-center text-muted py-5">
              Chưa có thông báo nào được gửi.
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <div className="notification-history-list">
              {notifications.map((n) => (
                <div className="notification-history-item" key={n.notificationId}>
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <strong className="notification-title">{n.title}</strong>

                    <span className="badge rounded-pill bg-primary-subtle text-primary flex-shrink-0">
                      {getTargetTypeLabel(n.targetType)}
                      {n.targetValue && `: ${n.targetValue}`}
                    </span>
                  </div>

                  <p className="notification-message text-muted mb-2">
                    {n.message && n.message.length > 120
                      ? n.message.substring(0, 120) + "..."
                      : n.message}
                  </p>

                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <i className="bi bi-person me-1"></i>
                      {n.createdByUsername || "admin"}
                    </small>
                    <small className="text-muted">{formatDateTime(n.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationManagement;
