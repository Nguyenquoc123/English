function CourseDetailTabs({
  activeTab,
  setActiveTab,
  courseId,
  navigate,
  basePath,
  showApprovalTab = true,
  showRevenueTab = true,
}) {
  return (
    <ul className="nav detail-tabs mb-4">
      <li className="nav-item">
        <button
          type="button"
          className={activeTab === "overview" ? "nav-link active" : "nav-link"}
          onClick={() => setActiveTab("overview")}
        >
          <i className="bi bi-info-circle me-1"></i>
          Tổng quan
        </button>
      </li>

      <li className="nav-item">
        <button
          type="button"
          className="nav-link"
          onClick={() => navigate(`${basePath}/${courseId}/lessons`)}
        >
          <i className="bi bi-journal-text me-1"></i>
          Lesson
        </button>
      </li>

      <li className="nav-item">
        <button
          type="button"
          className="nav-link"
          onClick={() => navigate(`${basePath}/${courseId}/exams`)}
        >
          <i className="bi bi-clipboard-check me-1"></i>
          Bài thi
        </button>
      </li>

      {showApprovalTab && (
        <li className="nav-item">
          <button
            type="button"
            className={activeTab === "approval" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("approval")}
          >
            <i className="bi bi-shield-check me-1"></i>
            Duyệt khóa học
          </button>
        </li>
      )}

      {showRevenueTab && (
        <li className="nav-item">
          <button
            type="button"
            className="nav-link"
            onClick={() => navigate(`${basePath}/${courseId}/revenue`)}
          >
            <i className="bi bi-graph-up-arrow me-1"></i>
            Doanh thu
          </button>
        </li>
      )}
    </ul>
  );
}

export default CourseDetailTabs;