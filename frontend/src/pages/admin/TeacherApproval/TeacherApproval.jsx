import { useEffect, useState } from "react";
import { getPendingTeachers, getAllTeacherProfiles, approveTeacher } from "../../../api/adminApi";
import { getFileUrl } from "../../../utils/fileurl";
import "./TeacherApproval.css";

const STATUS_MAP = {
  PENDING: { className: "teacher-status-pending", label: "Chờ duyệt" },
  APPROVED: { className: "teacher-status-approved", label: "Đã duyệt" },
  REJECTED: { className: "teacher-status-rejected", label: "Từ chối" },
};

function getStatusMeta(status) {
  const key = status?.toUpperCase?.() || status;
  return STATUS_MAP[key] || { className: "teacher-status-default", label: status || "—" };
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeTeacherProfiles(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.result)
      ? payload.result
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return list.map((p) => ({
    ...p,
    phone: (p.phone || p.Phone || "").trim() || null,
  }));
}

function getPhone(profile) {
  const value = profile?.phone?.trim();
  return value || "—";
}

function TeacherApproval() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");
  const [detailProfile, setDetailProfile] = useState(null);
  const [rejectMode, setRejectMode] = useState(false);
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
        ? await getPendingTeachers()
        : await getAllTeacherProfiles();

      setProfiles(normalizeTeacherProfiles(res.data));
    } catch {
      setError("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (profile) => {
    setDetailProfile(profile);
    setRejectMode(false);
    setRejectReason("");
  };

  const closeDetail = () => {
    setDetailProfile(null);
    setRejectMode(false);
    setRejectReason("");
  };

  const handleApprove = async (profileId, status) => {
    if (status === "REJECTED" && !rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    const ok = window.confirm(
      `${status === "APPROVED" ? "Duyệt" : "Từ chối"} hồ sơ giáo viên này?`
    );
    if (!ok) return;

    try {
      setActionLoading(true);

      await approveTeacher(
        profileId,
        status,
        status === "APPROVED" ? null : rejectReason
      );

      closeDetail();
      loadData();
    } catch {
      alert("Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const startReject = (e, profile) => {
    e.stopPropagation();
    setDetailProfile(profile);
    setRejectMode(true);
    setRejectReason("");
  };

  const onRowClick = (profile) => {
    openDetail(profile);
  };

  const pendingCount = profiles.filter(
    (p) => (p.approvalStatus || "").toUpperCase() === "PENDING"
  ).length;

  return (
    <div className="admin-teacher-approval-page">
      <div className="admin-page-heading">
        <div>
          <h2>Duyệt đăng ký giáo viên</h2>
          <p>
            Bấm vào một dòng để xem đầy đủ hồ sơ. Dùng nút Duyệt / Từ chối ngay trên bảng hoặc trong cửa sổ chi tiết.
          </p>
        </div>

        <button type="button" className="btn btn-outline-secondary" onClick={loadData}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      <div className="admin-filter-card">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            type="button"
            className={`btn btn-sm ${tab === "pending" ? "btn-warning" : "btn-outline-secondary"}`}
            onClick={() => setTab("pending")}
          >
            <i className="bi bi-hourglass-split me-1"></i>
            Chờ duyệt
          </button>

          <button
            type="button"
            className={`btn btn-sm ${tab === "all" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setTab("all")}
          >
            <i className="bi bi-list-ul me-1"></i>
            Tất cả
          </button>

          {!loading && profiles.length > 0 && (
            <span className="teacher-approval-count text-muted ms-1">
              {profiles.length} hồ sơ
              {tab === "all" && pendingCount > 0 && ` · ${pendingCount} chờ duyệt`}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="admin-table-card teacher-approval-table-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0 fw-bold">Danh sách đăng ký giáo viên</h5>
            <small className="text-muted">
              {tab === "pending" ? "Các hồ sơ đang chờ admin xét duyệt" : "Toàn bộ hồ sơ đã gửi"}
            </small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle teacher-approval-table">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Thời gian đăng ký</th>
                <th>Trạng thái</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2" />
                    Đang tải danh sách...
                  </td>
                </tr>
              )}

              {!loading &&
                profiles.map((p, idx) => {
                  const statusMeta = getStatusMeta(p.approvalStatus);
                  const isPending = (p.approvalStatus || "").toUpperCase() === "PENDING";

                  return (
                    <tr
                      key={p.teacherProfileId}
                      className="teacher-approval-row"
                      onClick={() => onRowClick(p)}
                      title="Nhấn để xem chi tiết hồ sơ"
                    >
                      <td className="text-muted">{idx + 1}</td>
                      <td className="teacher-approval-cell-name">
                        <div className="teacher-cell-primary">{p.fullName || "—"}</div>
                        {p.phone && (
                          <div className="teacher-cell-phone d-lg-none">
                            <i className="bi bi-telephone" />
                            {p.phone}
                          </div>
                        )}
                      </td>
                      <td className="teacher-approval-cell-email">{p.email || "—"}</td>
                      <td className="teacher-approval-cell-phone">
                        {p.phone ? (
                          <a href={`tel:${p.phone}`} className="teacher-phone-link" onClick={(e) => e.stopPropagation()}>
                            <i className="bi bi-telephone me-1" />
                            {p.phone}
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-nowrap">{formatDateTime(p.createdAt)}</td>
                      <td>
                        <span className={`teacher-approval-status ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        {isPending ? (
                          <div className="teacher-approval-row-actions">
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              disabled={actionLoading}
                              onClick={() => handleApprove(p.teacherProfileId, "APPROVED")}
                              title="Duyệt"
                            >
                              <i className="bi bi-check-lg" />
                              <span className="d-none d-xl-inline ms-1">Duyệt</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={actionLoading}
                              onClick={(e) => startReject(e, p)}
                              title="Từ chối"
                            >
                              <i className="bi bi-x-lg" />
                              <span className="d-none d-xl-inline ms-1">Từ chối</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openDetail(p)}
                          >
                            <i className="bi bi-eye" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {!loading && profiles.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-5">
                    <i className="bi bi-inbox d-block mb-2 fs-3" />
                    Không có hồ sơ giáo viên nào trong mục này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailProfile && (
        <div className="teacher-detail-overlay" onClick={closeDetail}>
          <div
            className="teacher-detail-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-detail-title"
          >
            <div className="teacher-detail-header">
              <h5 id="teacher-detail-title" className="mb-0 fw-bold">
                Chi tiết hồ sơ giáo viên
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeDetail}
                aria-label="Đóng"
              />
            </div>

            <div className="teacher-detail-body">
              <div className="teacher-detail-profile">
                {detailProfile.avatarUrl ? (
                  <img
                    className="teacher-detail-avatar"
                    src={getFileUrl(detailProfile.avatarUrl)}
                    alt=""
                  />
                ) : (
                  <div className="teacher-detail-avatar-placeholder">
                    {(detailProfile.fullName || detailProfile.email || "?")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="teacher-detail-name">{detailProfile.fullName || "—"}</div>
                  <div className="teacher-detail-sub">
                    @{detailProfile.username || "—"}
                  </div>
                  <span
                    className={`teacher-approval-status ${getStatusMeta(detailProfile.approvalStatus).className}`}
                  >
                    {getStatusMeta(detailProfile.approvalStatus).label}
                  </span>
                </div>
              </div>

              <div className="teacher-detail-info">
                <div className="teacher-detail-info-row">
                  <span className="teacher-detail-label">Email</span>
                  <span>{detailProfile.email || "—"}</span>
                </div>
                <div className="teacher-detail-info-row">
                  <span className="teacher-detail-label">Số điện thoại</span>
                  <span>
                    {detailProfile.phone ? (
                      <a href={`tel:${detailProfile.phone}`} className="teacher-phone-link">
                        {detailProfile.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="teacher-detail-info-row">
                  <span className="teacher-detail-label">Thời gian đăng ký</span>
                  <span>{formatDateTime(detailProfile.createdAt)}</span>
                </div>
                <div className="teacher-detail-info-row">
                  <span className="teacher-detail-label">Người duyệt</span>
                  <span>{detailProfile.reviewedByName || "—"}</span>
                </div>
                <div className="teacher-detail-info-row">
                  <span className="teacher-detail-label">Thời gian duyệt</span>
                  <span>{formatDateTime(detailProfile.reviewedAt)}</span>
                </div>
                {detailProfile.rejectReason && (
                  <div className="teacher-detail-reject">
                    <i className="bi bi-x-circle-fill" />
                    <span>
                      <strong>Lý do từ chối:</strong> {detailProfile.rejectReason}
                    </span>
                  </div>
                )}
              </div>

              <div className="teacher-detail-section">
                <h6>Giới thiệu bản thân</h6>
                {detailProfile.bio ? (
                  <p className="teacher-detail-text">{detailProfile.bio}</p>
                ) : (
                  <p className="teacher-detail-empty">Chưa có nội dung</p>
                )}
              </div>

              <div className="teacher-detail-section">
                <h6>Kinh nghiệm &amp; chứng chỉ</h6>
                {detailProfile.experience ? (
                  <div
                    className="teacher-detail-html"
                    dangerouslySetInnerHTML={{ __html: detailProfile.experience }}
                  />
                ) : (
                  <p className="teacher-detail-empty">Chưa có nội dung</p>
                )}
              </div>

              {detailProfile.certificates?.length > 0 && (
                <div className="teacher-detail-section">
                  <h6>
                    Ảnh chứng chỉ đính kèm ({detailProfile.certificates.length})
                  </h6>
                  <div className="teacher-cert-thumbnails">
                    {detailProfile.certificates.map((c) => (
                      <a
                        key={c.certificateId}
                        href={getFileUrl(c.certificateUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="teacher-cert-link"
                        title="Mở ảnh chứng chỉ"
                      >
                        <img
                          src={getFileUrl(c.certificateUrl)}
                          alt="Chứng chỉ"
                          className="teacher-cert-thumb"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="teacher-detail-footer">
              {(detailProfile.approvalStatus || "").toUpperCase() === "PENDING" ? (
                rejectMode ? (
                  <div className="teacher-detail-reject-form w-100">
                    <label className="form-label fw-semibold small mb-1">
                      Lý do từ chối <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control mb-2"
                      rows={3}
                      placeholder="Nhập lý do từ chối..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="d-flex flex-wrap gap-2 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-light"
                        disabled={actionLoading}
                        onClick={() => setRejectMode(false)}
                      >
                        Huỷ
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={actionLoading}
                        onClick={() =>
                          handleApprove(detailProfile.teacherProfileId, "REJECTED")
                        }
                      >
                        {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2 justify-content-end w-100">
                    <button type="button" className="btn btn-light" onClick={closeDetail}>
                      Đóng
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      disabled={actionLoading}
                      onClick={() => {
                        setRejectMode(true);
                        setRejectReason("");
                      }}
                    >
                      <i className="bi bi-x-lg me-1" />
                      Từ chối
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={actionLoading}
                      onClick={() =>
                        handleApprove(detailProfile.teacherProfileId, "APPROVED")
                      }
                    >
                      <i className="bi bi-check-lg me-1" />
                      Duyệt hồ sơ
                    </button>
                  </div>
                )
              ) : (
                <div className="d-flex justify-content-end w-100">
                  <button type="button" className="btn btn-primary" onClick={closeDetail}>
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherApproval;
