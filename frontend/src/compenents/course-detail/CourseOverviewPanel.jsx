function CourseOverviewPanel({
  course,
  getStatusBadge,
  onEdit,
  showEditButton = false,
}) {
  const formatDate = (value) => {
    if (!value) return "--";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("vi-VN");
    } catch {
      return value;
    }
  };

  const getCourseTypeText = (courseType) => {
    if (courseType === "PAID") return "Khóa học có phí";
    if (courseType === "FREE") return "Khóa học miễn phí";
    return courseType || "--";
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "--";

    const numberValue = Number(price);

    if (Number.isNaN(numberValue)) return price;

    return `${numberValue.toLocaleString("vi-VN")} VNĐ`;
  };

  return (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="info-card h-100">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h5 className="mb-1">Thông tin khóa học</h5>
              <p className="text-muted small mb-0">
                Tổng quan các thông tin cơ bản của khóa học.
              </p>
            </div>

            {showEditButton && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={onEdit}
              >
                <i className="bi bi-pencil-square me-1"></i>
                Chỉnh sửa
              </button>
            )}
          </div>

          <div className="course-overview-list">
            <div className="course-overview-item">
              <div className="overview-icon">
                <i className="bi bi-book"></i>
              </div>

              <div>
                <span>Tiêu đề khóa học</span>
                <strong>{course.title || "--"}</strong>
              </div>
            </div>

            <div className="course-overview-item">
              <div className="overview-icon">
                <i className="bi bi-bar-chart"></i>
              </div>

              <div>
                <span>Cấp độ</span>
                <strong>{course.levelName || "--"}</strong>
              </div>
            </div>

            <div className="course-overview-item">
              <div className="overview-icon">
                <i className="bi bi-patch-check"></i>
              </div>

              <div>
                <span>Trạng thái</span>
                <strong>
                  <span className={getStatusBadge(course.status)}>
                    {course.status || "--"}
                  </span>
                </strong>
              </div>
            </div>

            <div className="course-overview-item">
              <div className="overview-icon">
                <i className="bi bi-credit-card"></i>
              </div>

              <div>
                <span>Loại khóa học</span>
                <strong>{getCourseTypeText(course.courseType || course.accessType)}</strong>
              </div>
            </div>

            <div className="course-overview-item">
              <div className="overview-icon">
                <i className="bi bi-cash-coin"></i>
              </div>

              <div>
                <span>Giá khóa học</span>
                <strong>{formatPrice(course.price)}</strong>
              </div>
            </div>

            <div className="course-overview-item">
              <div className="overview-icon">
                <i className="bi bi-calendar-plus"></i>
              </div>

              <div>
                <span>Ngày tạo</span>
                <strong>{formatDate(course.createdAt)}</strong>
              </div>
            </div>

            <div className="course-overview-item">
              <div className="overview-icon">
                <i className="bi bi-clock-history"></i>
              </div>

              <div>
                <span>Cập nhật gần nhất</span>
                <strong>{formatDate(course.updatedAt)}</strong>
              </div>
            </div>

            <div className="course-overview-item">
              <div className="overview-icon">
                <i className="bi bi-send-check"></i>
              </div>

              <div>
                <span>Ngày gửi duyệt</span>
                <strong>{formatDate(course.submittedAt)}</strong>
              </div>
            </div>

            <div className="course-overview-item">
              <div className="overview-icon">
                <i className="bi bi-shield-check"></i>
              </div>

              <div>
                <span>Ngày duyệt</span>
                <strong>{formatDate(course.approvedAt || course.reviewedAt)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-7">
        <div className="info-card h-100">
          <div className="mb-4">
            <h5 className="mb-1">Mô tả khóa học</h5>
            <p className="text-muted small mb-0">
              Nội dung giới thiệu sẽ được hiển thị cho học viên.
            </p>
          </div>

          <div className="description-section">
            <div className="description-label">
              <i className="bi bi-card-text me-2"></i>
              Mô tả ngắn
            </div>

            <p className="course-description">
              {course.shortDescription || "Chưa có mô tả ngắn."}
            </p>
          </div>

          <div className="description-section mt-4">
            <div className="description-label">
              <i className="bi bi-file-richtext me-2"></i>
              Nội dung chi tiết
            </div>

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