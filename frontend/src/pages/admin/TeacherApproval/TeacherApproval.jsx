import { useEffect, useState } from "react";
import { getPendingTeachers, getAllTeacherProfiles, approveTeacher } from "../../../api/adminApi";
import "./TeacherApproval.css";

function TeacherApproval() {
  const [profiles, setProfiles] = useState([]);
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
        ? await getPendingTeachers()
        : await getAllTeacherProfiles();

      setProfiles(res.data || []);
    } catch {
      setError("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profileId, status) => {
    if (status === "REJECTED" && !rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    const ok = window.confirm(
      `${status === "APPROVED" ? "Duyệt" : "Từ chối"} giáo viên này?`
    );
    if (!ok) return;

    try {
      setActionLoading(true);

      await approveTeacher(
        profileId,
        status,
        status === "APPROVED" ? null : rejectReason
      );

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
    if (status === "APPROVED") return "badge rounded-pill text-bg-success";
    if (status === "REJECTED") return "badge rounded-pill text-bg-danger";
    return "badge rounded-pill text-bg-secondary";
  };

  return (
    <div className="admin-teacher-approval-page">
      <div className="admin-page-heading">
        <div>
          <h2>Duyệt đăng ký giáo viên</h2>
          <p>
            Admin xét duyệt hồ sơ đăng ký giáo viên, chấp thuận hoặc từ chối với lý do cụ thể.
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

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải danh sách hồ sơ...</div>
        </div>
      )}

      {!loading && profiles.length === 0 && (
        <div className="admin-table-card text-center text-muted py-5">
          Không có hồ sơ nào.
        </div>
      )}

      {!loading && profiles.length > 0 && (
        <div className="teacher-approval-grid">
          {profiles.map((p) => (
            <div className="admin-table-card teacher-approval-card" key={p.teacherProfileId}>
              <div className="teacher-approval-header">
                <div className="teacher-approval-avatar">
                  {(p.fullName || p.email || "?")[0].toUpperCase()}
                </div>

                <div className="flex-grow-1">
                  <div className="fw-bold">{p.fullName || "--"}</div>
                  <div className="text-muted small">{p.email || "--"}</div>
                </div>

                <span className={getStatusBadge(p.approvalStatus)}>
                  {p.approvalStatus}
                </span>
              </div>

              <div className="mb-2">
                <small className="text-muted">Bio:</small>
                <div className="small">{p.bio || "--"}</div>
              </div>

              <div className="mb-3">
                <small className="text-muted">Kinh nghiệm:</small>
                <div className="small">{p.experience || "--"}</div>
              </div>

              {p.certificates && p.certificates.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted fw-semibold">Chứng chỉ:</small>
                  <div className="teacher-cert-thumbnails">
                    {p.certificates.map((c) => (
                      <a
                        key={c.certificateId}
                        href={`http://localhost:8080/${c.certificateUrl}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={`http://localhost:8080/${c.certificateUrl}`}
                          alt="cert"
                          className="teacher-cert-thumb"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {p.rejectReason && (
                <div className="alert alert-danger py-2 small mb-3">
                  Lý do từ chối: {p.rejectReason}
                </div>
              )}

              {p.approvalStatus === "PENDING" && (
                <div>
                  {selected === p.teacherProfileId ? (
                    <div>
                      <textarea
                        className="form-control form-control-sm mb-2"
                        placeholder="Nhập lý do từ chối..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                      />
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={actionLoading}
                          onClick={() => handleApprove(p.teacherProfileId, "REJECTED")}
                        >
                          {actionLoading ? "..." : "Xác nhận từ chối"}
                        </button>

                        <button
                          className="btn btn-sm btn-light"
                          onClick={() => {
                            setSelected(null);
                            setRejectReason("");
                          }}
                        >
                          Huỷ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-success"
                        disabled={actionLoading}
                        onClick={() => handleApprove(p.teacherProfileId, "APPROVED")}
                      >
                        Duyệt
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelected(p.teacherProfileId);
                          setRejectReason("");
                        }}
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherApproval;
