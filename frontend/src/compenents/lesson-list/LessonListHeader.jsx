function LessonListHeader({
  title,
  description,
  course,
  onBack,
  rightActions,
}) {
  return (
    <div className="lesson-page-heading">
      <div>
        <button type="button" className="lesson-back-link" onClick={onBack}>
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>

        <h2>{title}</h2>

        <p>{description}</p>

        {course && (
          <div className="course-name-box">
            <i className="bi bi-journal-bookmark"></i>
            <span>{course.title}</span>
          </div>
        )}
      </div>

      {rightActions}
    </div>
  );
}

export default LessonListHeader;