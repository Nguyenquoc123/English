function TeacherLessonActions({
  lesson,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-light"
        title="Xem chi tiết"
        onClick={() => onView(lesson.lessonId)}
      >
        <i className="bi bi-eye"></i>
      </button>

      <button
        type="button"
        className="btn btn-sm btn-light"
        title="Cập nhật"
        onClick={() => onEdit(lesson.lessonId)}
      >
        <i className="bi bi-pencil"></i>
      </button>

      <button
        type="button"
        className="btn btn-sm btn-light text-danger"
        title="Xóa bài học"
        onClick={() => onDelete(lesson.lessonId)}
      >
        <i className="bi bi-trash"></i>
      </button>
    </>
  );
}

export default TeacherLessonActions;