import { Outlet } from "react-router-dom";
import TeacherSidebar from "../../compenents/teacher/TeacherSidebar";
import TeacherHeader from "../../compenents/teacher/TeacherHeader";
import AppBreadcrumbBar from "../../components/layout/AppBreadcrumbBar/AppBreadcrumbBar";
import { BreadcrumbSuppressInline } from "../../context/BreadcrumbContext";
import "../teacher/TeacherLayout.css";

import { useState } from "react";

function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="teacher-layout">
      <TeacherSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="teacher-main">
        <div className="layout-sticky-top layout-sticky-top--teacher">
          <TeacherHeader onOpenSidebar={() => setSidebarOpen(true)} />
          <AppBreadcrumbBar variant="teacher" />
        </div>

        <main className="p-4">
          <BreadcrumbSuppressInline>
            <Outlet />
          </BreadcrumbSuppressInline>
        </main>
      </div>
    </div>
  );
}

export default TeacherLayout;
