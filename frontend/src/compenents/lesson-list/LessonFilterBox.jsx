import { useNavigate } from "react-router-dom";

function LessonFilterBox({
  courseId,
  keyword,
  setKeyword,
  status,
  setStatus,
  onSearch
}) {
  const navigate = useNavigate();

  return (
    <div className="card border-0 shadow-sm mb-4 lesson-filter-card">
      <div className="card-body">
       

        <form onSubmit={onSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Từ khóa tìm kiếm</label>

              <div className="input-group">
               

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
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="HIDDEN">Hidden</option>
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
                className="btn btn-primary w-100"
                onClick={() => {
                  navigate(`/teacher/courses/${courseId}/lessons/create`);
                }}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Thêm bài học
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LessonFilterBox;