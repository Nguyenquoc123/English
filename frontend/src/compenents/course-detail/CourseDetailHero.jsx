import { getFileUrl } from "../../utils/fileurl";

function CourseDetailHero({
  course,
  getStatusBadge,
  formatPrice,
  actions,
  showRevenue = true,
}) {
  return (
    <div className="detail-hero-card">
      <div className="row g-4 align-items-stretch">
        <div className="col-lg-4">
          <div className="course-cover">
            <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} />

            
          </div>
        </div>

        <div className="col-lg-8">
          <div className="course-main-info h-100">
            <div className="d-flex justify-content-between gap-3 flex-wrap">
              <div>
                <div className="mb-2 d-flex gap-2 flex-wrap">
                  <span className="badge rounded-pill bg-primary-subtle text-primary">
                    {course.levelName || "Chưa có cấp độ"}
                  </span>

                  <span
                    className={
                      course.accessType === "FREE"
                        ? "badge rounded-pill bg-success-subtle text-success"
                        : "badge rounded-pill bg-info-subtle text-info"
                    }
                  >
                    {course.accessType || course.courseType || "N/A"}
                  </span>

                  <span className={getStatusBadge(course.status)}>
                    {course.status}
                  </span>
                </div>

                <h3>{course.title}</h3>

                <p className="text-muted mb-0">
                  Giảng viên:{" "}
                  <strong>{course.teacherName || "Chưa có thông tin"}</strong>
                </p>
              </div>

              
            </div>

            <div className="course-price-grid mt-4">
              <div className="price-box">
                <span>Giá khóa học</span>
                <strong>{formatPrice(course.price)}</strong>
              </div>

             
            </div>

            {actions && <div className="hero-actions mt-4">{actions}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailHero;