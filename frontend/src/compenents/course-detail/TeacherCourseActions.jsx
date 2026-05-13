function TeacherCourseActions({
  course,
  navigate,
  onSubmitApproval,
  onDeleteCourse,
  submittingApproval,
  deleting,
}) {
  return (
    <>
      <button
        className="btn btn-outline-secondary"
        onClick={() =>
          navigate(`/teacher/courses/${course.courseId}/lessons/sort`)
        }
      >
        <i className="bi bi-sort-down me-1"></i>
        Sắp xếp lesson
      </button>

      <button
        className="btn btn-outline-secondary"
        onClick={() =>
          navigate(`/teacher/courses/${course.courseId}/exams/create`)
        }
      >
        <i className="bi bi-clipboard-plus me-1"></i>
        Tạo bài thi
      </button>

      {(course.status === "Draft" || course.status === "Rejected") && (
        <button
          className="btn btn-warning"
          onClick={onSubmitApproval}
          disabled={submittingApproval}
        >
          {submittingApproval ? (
            <>
              <span className="spinner-border spinner-border-sm me-1"></span>
              Đang gửi...
            </>
          ) : (
            <>
              <i className="bi bi-send me-1"></i>
              {course.status === "Rejected" ? "Gửi duyệt lại" : "Gửi duyệt"}
            </>
          )}
        </button>
      )}

      <button
        className="btn btn-outline-danger"
        onClick={onDeleteCourse}
        disabled={deleting}
      >
        {deleting ? (
          <>
            <span className="spinner-border spinner-border-sm me-1"></span>
            Đang xóa...
          </>
        ) : (
          <>
            <i className="bi bi-trash me-1"></i>
            Xóa khóa học
          </>
        )}
      </button>
    </>
  );
}

export default TeacherCourseActions;