function LessonFilterBox({
  keyword,
  setKeyword,
  status,
  setStatus,
  onSearch,
  onReset,
}) {
  return (
    <div className="card border-0 shadow-sm mb-4 lesson-filter-card">
      <div className="card-body">
        <h5 className="fw-bold mb-3">
          <i className="bi bi-funnel text-primary me-2"></i>
          Tìm kiếm và lọc bài học
        </h5>

        <form onSubmit={onSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Từ khóa tìm kiếm</label>

              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên bài học"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label">Trạng thái lesson</label>

              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>

            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                Tìm kiếm
              </button>
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={onReset}
              >
                Làm mới
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LessonFilterBox;