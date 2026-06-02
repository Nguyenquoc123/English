import NotificationBell from "../../components/NotificationBell/NotificationBell";

function TeacherHeader({ sidebarOpen, onToggleSidebar }) {
  return (
    <header className="teacher-layout-header bg-white px-4 py-3 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-light panel-menu-toggle teacher-menu-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Đóng menu" : "Mở menu chức năng"}
          aria-expanded={sidebarOpen}
        >
          <i className="bi bi-three-dots-vertical fs-5"></i>
        </button>

        <div>
          <h5 className="mb-0 fw-bold">Teacher Dashboard</h5>
          <small className="text-muted">
            Quản lý khóa học, bài học, kỳ thi và doanh thu
          </small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="teacher-header-notifications" title="Thông báo từ admin">
          <NotificationBell variant="light" />
        </div>

        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
            style={{ width: "42px", height: "42px" }}
          >
            GV
          </div>

          <div>
            <div className="fw-semibold">Giáo viên</div>
            <small className="text-muted">teacher@gmail.com</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TeacherHeader;