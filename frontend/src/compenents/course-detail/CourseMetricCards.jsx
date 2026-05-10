function CourseMetricCards({ course, formatNumber, formatPrice }) {
  return (
    <div className="row g-3 my-4">
      <div className="col-xl col-md-4 col-sm-6">
        <div className="metric-card">
          <div className="metric-icon bg-blue">
            <i className="bi bi-people"></i>
          </div>
          <div>
            <span>Học viên</span>
            <strong>{formatNumber(course.studentCount)}</strong>
          </div>
        </div>
      </div>

      <div className="col-xl col-md-4 col-sm-6">
        <div className="metric-card">
          <div className="metric-icon bg-purple">
            <i className="bi bi-journal-text"></i>
          </div>
          <div>
            <span>Số lesson</span>
            <strong>{formatNumber(course.lessonCount)}</strong>
          </div>
        </div>
      </div>

      <div className="col-xl col-md-4 col-sm-6">
        <div className="metric-card">
          <div className="metric-icon bg-orange">
            <i className="bi bi-clipboard-check"></i>
          </div>
          <div>
            <span>Số bài thi</span>
            <strong>{formatNumber(course.examCount)}</strong>
          </div>
        </div>
      </div>

      <div className="col-xl col-md-4 col-sm-6">
        <div className="metric-card">
          <div className="metric-icon bg-green">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div>
            <span>Doanh thu</span>
            <strong>{formatPrice(course.revenue)}</strong>
          </div>
        </div>
      </div>

      <div className="col-xl col-md-4 col-sm-6">
        <div className="metric-card">
          <div className="metric-icon bg-yellow">
            <i className="bi bi-star-fill"></i>
          </div>
          <div>
            <span>Đánh giá</span>
            <strong>{course.rating || 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseMetricCards;