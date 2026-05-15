function LessonTable({
  lessons,
  allLessons,
  loading,
  error,
  getStatusBadge,
  renderActions,
}) {
  return (
    <div className="card border-0 shadow-sm lesson-table-card">
      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-1">Danh sách bài học</h5>
          <small className="text-muted">
            Các bài học thuộc khóa học hiện tại, được sắp xếp theo thứ tự
            lessonOrder.
          </small>
        </div>

        <small className="text-muted">
          Hiển thị {lessons.length}/{allLessons.length} bài học
        </small>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 lesson-table">
          <thead className="table-light">
            <tr>
              <th style={{ width: "90px" }}>Thứ tự</th>
              <th>Bài học</th>
              <th>Trạng thái</th>
              <th>Video</th>
              <th>Từ vựng</th>
              <th>Ngữ pháp</th>
              <th>Ôn tập</th>
              <th>Ngày tạo</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  Đang tải danh sách bài học...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="9" className="text-center text-danger py-4">
                  {error}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              lessons.map((lesson) => (
                <tr key={lesson.lessonId}>
                  <td>
                    <span className="lesson-order">{lesson.lessonOrder}</span>
                  </td>

                  <td>
                    <div className="lesson-title-cell">
                      <strong>{lesson.title}</strong>
                      <span>{lesson.description || "Chưa có mô tả"}</span>
                    </div>
                  </td>

                  <td>
                    <span className={getStatusBadge(lesson.status)}>
                      {lesson.status}
                    </span>
                  </td>

                  <td>
                    <span className="lesson-count-badge">
                      {lesson.videoCount || 0} video
                    </span>
                  </td>

                  <td>
                    <span className="lesson-mini-badge bg-primary-subtle text-primary">
                      {lesson.vocabularyCount || 0}
                    </span>
                  </td>

                  <td>
                    <span className="lesson-mini-badge bg-purple-subtle">
                      {lesson.grammarCount || 0}
                    </span>
                  </td>

                  <td>
                    <span className="lesson-count-badge">
                      {lesson.practiceCount || 0} dạng
                    </span>
                  </td>

                  <td>
                    <span className="text-muted small">
                      {lesson.createdAt || "--"}
                    </span>
                  </td>

                  <td>
                    <div className="d-flex justify-content-end gap-1">
                      {renderActions && renderActions(lesson)}
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && !error && lessons.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
                  Không tìm thấy bài học phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer bg-white d-flex justify-content-between align-items-center">
        <small className="text-muted">Hiển thị {lessons.length} bài học</small>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-light" disabled>
            Prev
          </button>
          <button className="btn btn-sm btn-primary">1</button>
          <button className="btn btn-sm btn-light">2</button>
          <button className="btn btn-sm btn-light">Next</button>
        </div>
      </div>
    </div>
  );
}

export default LessonTable;