function CourseOverviewPanel({
  course,
  getStatusBadge,
  onEdit,
  showEditButton = false,
}) {
  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <div className="info-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Thông tin khóa học</h5>

            {showEditButton && (
              <button className="btn btn-sm btn-outline-primary" onClick={onEdit}>
                Chỉnh sửa
              </button>
            )}
          </div>

          <div className="info-grid">
            <div>
              <span>Tiêu đề khóa học</span>
              <strong>{course.title}</strong>
            </div>

            <div>
              <span>Cấp độ</span>
              <strong>{course.levelName || "--"}</strong>
            </div>

            <div>
              <span>Trạng thái</span>
              <strong>
                <span className={getStatusBadge(course.status)}>
                  {course.status}
                </span>
              </strong>
            </div>

            <div>
              <span>Ngày tạo</span>
              <strong>{course.createdAt || "--"}</strong>
            </div>

            <div>
              <span>Cập nhật gần nhất</span>
              <strong>{course.updatedAt || "--"}</strong>
            </div>

            <div>
              <span>Đường dẫn</span>
              <strong>{course.slug || "--"}</strong>
            </div>

            <div>
              <span>Ngày gửi duyệt</span>
              <strong>{course.submittedAt || "--"}</strong>
            </div>

            <div>
              <span>Ngày duyệt</span>
              <strong>{course.approvedAt || course.reviewedAt || "--"}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="info-card">
          <h5>Mô tả khóa học</h5>

          <p className="course-description">
            {course.shortDescription || "Chưa có mô tả ngắn."}
          </p>

          <div className="content-note">
            <strong>Nội dung chi tiết:</strong>

            {course.description ? (
              <div
                className="course-description-html"
                dangerouslySetInnerHTML={{ __html: course.description }}
              ></div>
            ) : (
              <p className="text-muted mb-0 mt-2">
                Chưa có mô tả chi tiết.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseOverviewPanel;