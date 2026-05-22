import { useCallback, useEffect, useRef, useState } from "react";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../api/notificationApi";
import "./NotificationBell.css";

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell({ variant = "light" }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const wrapperRef = useRef(null);

  const loadUnreadCount = useCallback(async () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("english_token");
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await getUnreadNotificationCount();
      const count = res.data?.count ?? res.data?.result?.count ?? 0;
      setUnreadCount(Number(count) || 0);
      setLoadError("");
    } catch (err) {
      setUnreadCount(0);
      if (err.response?.status !== 401) {
        setLoadError("Không tải được số thông báo");
      }
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("english_token");
    if (!token) {
      setItems([]);
      setLoadError("Vui lòng đăng nhập để xem thông báo");
      return;
    }
    try {
      setLoading(true);
      setLoadError("");
      const res = await getMyNotifications();
      const list = Array.isArray(res.data) ? res.data : res.data?.result ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      setItems([]);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "Không có quyền xem thông báo"
          : "Không tải được thông báo");
      setLoadError(typeof msg === "string" ? msg : "Không tải được thông báo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadNotifications();
      await loadUnreadCount();
    }
  };

  const handleMarkRead = async (item) => {
    if (item.isRead) return;
    try {
      await markNotificationRead(item.notificationReceiverId);
      setItems((prev) =>
        prev.map((n) =>
          n.notificationReceiverId === item.notificationReceiverId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`notification-bell notification-bell--${variant}`} ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={toggleOpen}
        aria-label="Thông báo từ admin"
        title="Thông báo từ admin"
        aria-expanded={open}
      >
        <i className="bi bi-bell" />
        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-bell-dropdown">
          <div className="notification-bell-dropdown-header">
            <strong>Thông báo</strong>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={handleMarkAllRead}
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div className="notification-bell-dropdown-body">
            {loading && (
              <div className="notification-bell-empty text-muted">Đang tải...</div>
            )}

            {loadError && (
              <div className="notification-bell-empty text-danger small px-2">
                {loadError}
              </div>
            )}

            {!loading && !loadError && items.length === 0 && (
              <div className="notification-bell-empty text-muted">
                <i className="bi bi-inbox d-block mb-2 fs-4" />
                Chưa có thông báo
              </div>
            )}

            {!loading &&
              items.map((item) => (
                <button
                  key={item.notificationReceiverId}
                  type="button"
                  className={`notification-bell-item ${item.isRead ? "is-read" : "is-unread"}`}
                  onClick={() => handleMarkRead(item)}
                >
                  <div className="notification-bell-item-title">{item.title}</div>
                  <div className="notification-bell-item-message">{item.message}</div>
                  <small className="text-muted">{formatDateTime(item.createdAt)}</small>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
