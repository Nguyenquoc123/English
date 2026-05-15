import { useEffect, useState } from "react";
import { getAllUsers, updateUserStatus, updateUserRole, createUser } from "../../../api/adminApi";
import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [modalRoleName, setModalRoleName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "", email: "", password: "", fullName: "",
    roleName: "student", status: "active"
  });
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllUsers(keyword, roleFilter, statusFilter);
      setUsers(res.data || []);
    } catch {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleReset = async () => {
    setKeyword("");
    setRoleFilter("");
    setStatusFilter("");
    try {
      setLoading(true);
      setError("");
      const res = await getAllUsers("", "", "");
      setUsers(res.data || []);
    } catch {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "banned" : "active";
    const ok = window.confirm(
      `${newStatus === "banned" ? "Khoá" : "Mở khoá"} tài khoản "${user.username}"?`
    );
    if (!ok) return;

    setActionLoading(user.userId);

    try {
      await updateUserStatus(user.userId, newStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === user.userId ? { ...u, status: newStatus } : u
        )
      );
      if (selectedUser?.userId === user.userId) {
        setSelectedUser((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      alert("Cập nhật thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setModalRoleName(user.roleName || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalRoleName("");
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!newRole) return;
    setUpdatingRoleId(userId);
    try {
      const res = await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? res.data : u))
      );
      if (selectedUser?.userId === userId) {
        setSelectedUser(res.data);
        setModalRoleName(res.data.roleName || "");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Đổi role thất bại");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const getRoleBadge = (role) => {
    if (role === "admin") return "badge rounded-pill text-bg-danger";
    if (role === "teacher") return "badge rounded-pill text-bg-success";
    if (role === "student") return "badge rounded-pill text-bg-primary";
    return "badge rounded-pill text-bg-secondary";
  };

  const getStatusBadge = (status) => {
    if (status === "active") return "badge rounded-pill text-bg-success";
    if (status === "banned") return "badge rounded-pill text-bg-danger";
    if (status === "pending") return "badge rounded-pill text-bg-warning";
    return "badge rounded-pill text-bg-secondary";
  };

  const getStatusLabel = (status) => {
    if (status === "active") return "Hoạt động";
    if (status === "banned") return "Đã khóa";
    if (status === "pending") return "Chờ xác minh";
    return status || "--";
  };

  const getRoleLabel = (role) => {
    if (role === "admin") return "Admin";
    if (role === "teacher") return "Giáo viên";
    if (role === "student") return "Học viên";
    return role || "--";
  };

  const validateCreateForm = () => {
    const errs = {};
    if (!createForm.username.trim()) errs.username = "Vui lòng nhập username";
    else if (createForm.username.length < 3) errs.username = "Username tối thiểu 3 ký tự";
    if (!createForm.email.trim()) errs.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) errs.email = "Email không hợp lệ";
    if (!createForm.password) errs.password = "Vui lòng nhập mật khẩu";
    else if (createForm.password.length < 6) errs.password = "Mật khẩu tối thiểu 6 ký tự";
    if (!createForm.roleName) errs.roleName = "Vui lòng chọn vai trò";
    return errs;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errs = validateCreateForm();
    if (Object.keys(errs).length > 0) { setCreateErrors(errs); return; }
    setCreating(true);
    try {
      const res = await createUser(createForm);
      setUsers(prev => [res.data, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ username: "", email: "", password: "", fullName: "", roleName: "student", status: "active" });
      setCreateErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || "Tạo người dùng thất bại";
      setCreateErrors({ general: msg });
    } finally {
      setCreating(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({ username: "", email: "", password: "", fullName: "", roleName: "student", status: "active" });
    setCreateErrors({});
  };

  const formatDate = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  // Stats computed client-side
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    banned: users.filter((u) => u.status === "banned").length,
    pending: users.filter((u) => u.status === "pending").length,
  };

  return (
    <div className="admin-user-page">
      <div className="admin-page-heading">
        <div>
          <h2>Quản lý người dùng</h2>
          <p>
            Admin xem danh sách toàn bộ người dùng trong hệ thống, lọc theo vai trò,
            trạng thái và khoá hoặc mở khoá tài khoản.
          </p>
        </div>

        <button className="btn btn-outline-secondary" onClick={loadUsers}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      {/* Stats bar */}
      <div className="user-stats">
        <div className="user-stat-card user-stat-total">
          <div className="user-stat-value">{stats.total}</div>
          <div className="user-stat-label">Tổng người dùng</div>
        </div>
        <div className="user-stat-card user-stat-active">
          <div className="user-stat-value">{stats.active}</div>
          <div className="user-stat-label">Đang hoạt động</div>
        </div>
        <div className="user-stat-card user-stat-banned">
          <div className="user-stat-value">{stats.banned}</div>
          <div className="user-stat-label">Bị khóa</div>
        </div>
        <div className="user-stat-card user-stat-pending">
          <div className="user-stat-value">{stats.pending}</div>
          <div className="user-stat-label">Chờ xác minh</div>
        </div>
      </div>

      {/* Filter card */}
      <div className="admin-filter-card">
        <form onSubmit={handleSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-lg-4 col-md-6">
              <label className="form-label fw-semibold">Tìm kiếm</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên, email hoặc username..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-semibold">Vai trò</label>
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                <option value="student">Học viên</option>
                <option value="teacher">Giáo viên</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="col-lg-2 col-md-6">
              <label className="form-label fw-semibold">Trạng thái</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="banned">Đã khóa</option>
                <option value="pending">Chờ xác minh</option>
              </select>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="d-flex gap-2 flex-wrap">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-search me-1"></i>
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={handleReset}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Xóa lọc
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Table card */}
      <div className="admin-table-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0 fw-bold">Danh sách người dùng</h5>
            <small className="text-muted">Tìm thấy {users.length} người dùng</small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle admin-user-table">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Username</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((user, idx) => (
                  <tr key={user.userId}>
                    <td>{idx + 1}</td>

                    <td>
                      <div className="user-info-cell">
                        {user.avatarUrl ? (
                          <img className="user-avatar" src={user.avatarUrl} alt="" />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {(user.fullName || user.username || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <span>{user.fullName || "--"}</span>
                      </div>
                    </td>

                    <td>{user.username}</td>
                    <td>{user.email}</td>

                    <td>
                      <span className={getRoleBadge(user.roleName)}>
                        {getRoleLabel(user.roleName)}
                      </span>
                    </td>

                    <td>
                      <span className={getStatusBadge(user.status)}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>

                    <td>{formatDate(user.createdAt)}</td>

                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Xem chi tiết"
                          onClick={() => handleOpenModal(user)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        {user.roleName !== "admin" && (
                          <button
                            className={
                              user.status === "active"
                                ? "btn btn-sm btn-outline-danger"
                                : "btn btn-sm btn-outline-success"
                            }
                            onClick={() => handleToggleStatus(user)}
                            disabled={actionLoading === user.userId}
                            title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          >
                            {actionLoading === user.userId ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : user.status === "active" ? (
                              <i className="bi bi-lock"></i>
                            ) : (
                              <i className="bi bi-unlock"></i>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-5">
                    Không có người dùng phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User detail modal */}
      {showModal && selectedUser && (
        <div className="user-modal-overlay" onClick={handleCloseModal}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h5 className="mb-0 fw-bold">Chi tiết người dùng</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
              ></button>
            </div>

            <div className="user-modal-body">
              {/* Avatar */}
              <div className="text-center mb-4">
                {selectedUser.avatarUrl ? (
                  <img
                    className="user-avatar-lg"
                    src={selectedUser.avatarUrl}
                    alt=""
                  />
                ) : (
                  <div className="user-avatar-placeholder-lg mx-auto">
                    {(selectedUser.fullName || selectedUser.username || "?")[0].toUpperCase()}
                  </div>
                )}
                <div className="mt-2 fw-semibold fs-5">{selectedUser.fullName || "--"}</div>
                <div className="text-muted small">{selectedUser.username}</div>
              </div>

              {/* Info grid */}
              <div className="user-modal-info">
                <div className="user-modal-info-row">
                  <span className="user-modal-info-label">Email</span>
                  <span className="user-modal-info-value">{selectedUser.email || "--"}</span>
                </div>
                <div className="user-modal-info-row">
                  <span className="user-modal-info-label">Vai trò</span>
                  <span>
                    <span className={getRoleBadge(selectedUser.roleName)}>
                      {getRoleLabel(selectedUser.roleName)}
                    </span>
                  </span>
                </div>
                <div className="user-modal-info-row">
                  <span className="user-modal-info-label">Trạng thái</span>
                  <span>
                    <span className={getStatusBadge(selectedUser.status)}>
                      {getStatusLabel(selectedUser.status)}
                    </span>
                  </span>
                </div>
                <div className="user-modal-info-row">
                  <span className="user-modal-info-label">Ngày tạo</span>
                  <span className="user-modal-info-value">{formatDateTime(selectedUser.createdAt)}</span>
                </div>
                <div className="user-modal-info-row">
                  <span className="user-modal-info-label">Cập nhật lần cuối</span>
                  <span className="user-modal-info-value">{formatDateTime(selectedUser.updatedAt)}</span>
                </div>
              </div>

              {/* Role change — only for non-admin users */}
              {selectedUser.roleName !== "admin" && (
                <div className="user-modal-role-section">
                  <label className="form-label fw-semibold mb-2">Đổi vai trò</label>
                  <div className="d-flex gap-2 align-items-center">
                    <select
                      className="form-select form-select-sm"
                      value={modalRoleName}
                      onChange={(e) => setModalRoleName(e.target.value)}
                      disabled={updatingRoleId === selectedUser.userId}
                    >
                      <option value="student">Học viên</option>
                      <option value="teacher">Giáo viên</option>
                    </select>
                    <button
                      className="btn btn-sm btn-primary text-nowrap"
                      onClick={() => handleRoleChange(selectedUser.userId, modalRoleName)}
                      disabled={
                        updatingRoleId === selectedUser.userId ||
                        modalRoleName === selectedUser.roleName
                      }
                    >
                      {updatingRoleId === selectedUser.userId ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Lock/unlock button */}
              {selectedUser.roleName !== "admin" && (
                <div className="mt-3">
                  <button
                    className={
                      selectedUser.status === "active"
                        ? "btn btn-outline-danger btn-sm w-100"
                        : "btn btn-outline-success btn-sm w-100"
                    }
                    onClick={() => handleToggleStatus(selectedUser)}
                    disabled={actionLoading === selectedUser.userId}
                  >
                    {actionLoading === selectedUser.userId ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Đang xử lý...
                      </>
                    ) : selectedUser.status === "active" ? (
                      <>
                        <i className="bi bi-lock me-1"></i>
                        Khóa tài khoản
                      </>
                    ) : (
                      <>
                        <i className="bi bi-unlock me-1"></i>
                        Mở khóa tài khoản
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="user-modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={handleCloseModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
