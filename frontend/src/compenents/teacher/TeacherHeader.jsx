function TeacherHeader({ onOpenSidebar }) {
  return (
    <header className="bg-white border-bottom shadow-sm px-4 py-3 d-flex justify-content-between align-items-center sticky-top">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-light" onClick={onOpenSidebar}>
          <i className="bi bi-list fs-5"></i>
        </button>

        <div>
          <h5 className="mb-0 fw-bold">Teacher Dashboard</h5>
          <small className="text-muted">
            Quản lý khóa học, bài học, kỳ thi và doanh thu
          </small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-light rounded-circle">
          <i className="bi bi-bell"></i>
        </button>

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