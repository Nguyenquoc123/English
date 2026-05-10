function AdminLessonReviewActions({
  lesson,
  onView,
  onViewVideos,
  onViewGrammar,
  onViewPractice,
}) {
  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        title="Xem chi tiết lesson"
        onClick={() => onView(lesson.lessonId)}
      >
        Xem
      </button>

      <button
        type="button"
        className="btn btn-sm btn-light"
        title="Xem video"
        onClick={() => onViewVideos(lesson.lessonId)}
      >
        <i className="bi bi-camera-video"></i>
      </button>

      <button
        type="button"
        className="btn btn-sm btn-light"
        title="Xem ngữ pháp"
        onClick={() => onViewGrammar(lesson.lessonId)}
      >
        <i className="bi bi-journal-text"></i>
      </button>

      <button
        type="button"
        className="btn btn-sm btn-light"
        title="Xem ôn tập"
        onClick={() => onViewPractice(lesson.lessonId)}
      >
        <i className="bi bi-check2-circle"></i>
      </button>
    </>
  );
}

export default AdminLessonReviewActions;