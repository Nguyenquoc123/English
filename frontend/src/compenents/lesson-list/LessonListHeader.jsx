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

      </div>

    </div>
  );
}

export default LessonListHeader;