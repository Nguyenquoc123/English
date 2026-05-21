function AdminCourseReviewActions({
  course,
  onApprove,
  onReject,
  onHide,
  onDelete,
  processing,
}) {
  return (
    <>
      {course.status === "Pending" && (
        <>
          <button
            className="btn btn-success"
            onClick={onApprove}
            disabled={processing}
          >
            <i className="bi bi-check-circle me-1"></i>
            Duyệt khóa học
          </button>

          <button
            className="btn btn-danger"
            onClick={onReject}
            disabled={processing}
          >
            <i className="bi bi-x-circle me-1"></i>
            Từ chối
          </button>
        </>
      )}

      {course.status === "Published" && (
        <button
          className="btn btn-outline-warning"
          onClick={onHide}
          disabled={processing}
        >
          <i className="bi bi-eye-slash me-1"></i>
          Ẩn khóa học
        </button>
      )}

      <button
        className="btn btn-outline-danger"
        onClick={onDelete}
        disabled={processing}
      >
        <i className="bi bi-trash me-1"></i>
        Xóa khóa học
      </button>
    </>
  );
}

export default AdminCourseReviewActions;