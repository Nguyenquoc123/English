import { Outlet } from "react-router-dom";
import TeacherSidebar from "../../compenents/teacher/TeacherSidebar";
import TeacherHeader from "../../compenents/teacher/TeacherHeader";
import Navbar from "../../components/layout/Navbar/Navbar";
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
        <TeacherHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TeacherLayout;