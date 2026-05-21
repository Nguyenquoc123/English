function TeacherLessonActions({
  item,
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
        onClick={() => onView(item)}
      >
        <i className="bi bi-eye"></i>
      </button>

      <button
        type="button"
        className="btn btn-sm btn-light"
        title="Cập nhật"
        onClick={() => onEdit(item)}
      >
        <i className="bi bi-pencil"></i>
      </button>

      <button
        type="button"
        className="btn btn-sm btn-light text-danger"
        title={item.type === "EXAM" ? "Xóa bài thi" : "Xóa bài học"}
        onClick={() => onDelete(item)}
      >
        <i className="bi bi-trash"></i>
      </button>
    </>
  );
}

export default TeacherLessonActions;