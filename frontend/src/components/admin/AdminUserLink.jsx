import { Link } from "react-router-dom";

/**
 * Link tới Quản lý người dùng và tự mở modal chi tiết theo userId.
 */
function AdminUserLink({ userId, children, className = "" }) {
  if (!userId) {
    return <span className={className}>{children ?? "--"}</span>;
  }

  return (
    <Link
      to={`/admin/users?userId=${userId}`}
      className={`admin-user-link text-decoration-none text-primary ${className}`.trim()}
      title="Xem chi tiết người dùng"
    >
      {children}
      <i className="bi bi-box-arrow-up-right ms-1 small opacity-75" />
    </Link>
  );
}

export default AdminUserLink;
