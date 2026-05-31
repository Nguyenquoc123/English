import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../../compenents/admin/AdminSidebar";
import "./AdminLayout.css";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="admin-main">
        <div className="admin-mini-bar">
          <button
            type="button"
            className="btn btn-light shadow-sm panel-menu-toggle"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Đóng menu" : "Mở menu chức năng"}
            aria-expanded={sidebarOpen}
          >
            <i className="bi bi-three-dots-vertical fs-5"></i>
          </button>

          <div>
            <h5 className="mb-0 fw-bold">Admin Panel</h5>
            <small className="text-muted">
              Quản lý hệ thống English LMS
            </small>
          </div>
        </div>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;