function TeacherCourseApprovalPanel({
  course,
  getStatusBadge,
  approvalMessage,
  onSubmitApproval,
  submittingApproval,
}) {
  return (
    <div className="info-card">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <h5>Thông tin duyệt khóa học</h5>
          <p className="text-muted mb-0">
            Theo dõi trạng thái kiểm duyệt và gửi khóa học cho admin khi đã
            hoàn thiện nội dung.
          </p>
        </div>

        <span className={getStatusBadge(course.status)}>{course.status}</span>
      </div>

      <div className={`${approvalMessage.className} mt-3 mb-4`}>
        <div className="d-flex gap-2">
          <i className={`bi ${approvalMessage.icon}`}></i>

          <div>
            <strong>{approvalMessage.title}</strong>
            <div>{approvalMessage.text}</div>
          </div>
        </div>
      </div>

      {course.status === "Rejected" && (
        <div className="alert alert-danger mt-3">
          <strong>Lý do từ chối:</strong>{" "}
          {course.rejectReason || "Admin chưa nhập lý do từ chối."}
        </div>
      )}

      {(course.status === "Draft" || course.status === "Rejected") && (
        <button
          className="btn btn-warning mt-3"
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
              {course.status === "Rejected"
                ? "Gửi duyệt lại"
                : "Gửi khóa học chờ duyệt"}
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default TeacherCourseApprovalPanel;