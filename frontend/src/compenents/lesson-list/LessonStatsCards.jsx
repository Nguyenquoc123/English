function LessonStatsCards({ allLessons }) {
  const countByStatus = (statusValue) => {
    return allLessons.filter((lesson) => lesson.status === statusValue).length;
  };

  return (
    <div className="row g-3 mb-4">
      <div className="col-lg-3 col-md-6">
        <div className="lesson-stat-card">
          <div className="lesson-stat-icon bg-blue">
            <i className="bi bi-list-task"></i>
          </div>
          <div>
            <span>Tổng bài học</span>
            <strong>{allLessons.length}</strong>
          </div>
        </div>
      </div>

      <div className="col-lg-3 col-md-6">
        <div className="lesson-stat-card">
          <div className="lesson-stat-icon bg-gray">
            <i className="bi bi-pencil"></i>
          </div>
          <div>
            <span>Draft</span>
            <strong>{countByStatus("Draft")}</strong>
          </div>
        </div>
      </div>

      <div className="col-lg-3 col-md-6">
        <div className="lesson-stat-card">
          <div className="lesson-stat-icon bg-green">
            <i className="bi bi-check-circle"></i>
          </div>
          <div>
            <span>Published</span>
            <strong>{countByStatus("Published")}</strong>
          </div>
        </div>
      </div>

      <div className="col-lg-3 col-md-6">
        <div className="lesson-stat-card">
          <div className="lesson-stat-icon bg-red">
            <i className="bi bi-eye-slash"></i>
          </div>
          <div>
            <span>Hidden</span>
            <strong>{countByStatus("Hidden")}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonStatsCards;