import { Outlet } from "react-router-dom";
import { useState } from "react";
import OurAdminSidebar from "./OurAdminSidebar";
import "../../../layouts/admin/AdminLayout.css";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <OurAdminSidebar
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
            className="btn btn-light shadow-sm"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list fs-5"></i>
          </button>

          <div>
            <h5 className="mb-0 fw-bold">Admin Portal</h5>
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
