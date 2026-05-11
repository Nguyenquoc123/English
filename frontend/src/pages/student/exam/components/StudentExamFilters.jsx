function StudentExamFilters({
  keyword,
  setKeyword,
  status,
  setStatus,
  onSearch,
  onReset,
  compact = false,
}) {
  return (
    <form className="student-exam-filter-card" onSubmit={onSearch}>
      <div className="filter-title">
        <i className="bi bi-funnel"></i>
        Tìm kiếm và lọc bài thi
      </div>

      <div className="row g-3 align-items-end">
        <div className={compact ? "col-lg-6 col-md-6" : "col-lg-5 col-md-6"}>
          <label className="form-label">Từ khóa</label>

          <div className="student-exam-search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="form-control"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập tên bài thi..."
            />
          </div>
        </div>

        <div className={compact ? "col-lg-4 col-md-6" : "col-lg-3 col-md-6"}>
          <label className="form-label">Trạng thái</label>

          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Draft">Draft</option>
            <option value="Hidden">Hidden</option>
          </select>
        </div>

        <div className={compact ? "col-lg-2" : "col-lg-4"}>
          <div className="student-exam-filter-actions">
            <button type="submit" className="btn btn-primary">
              Tìm kiếm
            </button>

            {!compact && (
              <button type="button" className="btn btn-light" onClick={onReset}>
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

export default StudentExamFilters;