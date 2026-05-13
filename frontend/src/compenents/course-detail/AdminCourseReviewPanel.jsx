import { useState } from "react";

function AdminCourseReviewPanel({
  course,
  getStatusBadge,
  onApprove,
  onReject,
  processing,
}) {
  const [rejectReason, setRejectReason] = useState("");

  return (
    <div className="info-card">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <h5>Duyệt khóa học</h5>
          <p className="text-muted mb-0">
            Admin kiểm tra thông tin khóa học, lesson, bài thi và nội dung học
            trước khi duyệt.
          </p>
        </div>

        <span className={getStatusBadge(course.status)}>{course.status}</span>
      </div>

      {course.status === "Pending" && (
        <div className="alert alert-warning mt-3">
          <strong>Khóa học đang chờ duyệt.</strong> Vui lòng kiểm tra đầy đủ nội
          dung trước khi duyệt hoặc từ chối.
        </div>
      )}

      {course.status === "Published" && (
        <div className="alert alert-success mt-3">
          <strong>Khóa học đã được duyệt.</strong>
        </div>
      )}

      {course.status === "Rejected" && (
        <div className="alert alert-danger mt-3">
          <strong>Khóa học đã bị từ chối.</strong>
          <div>Lý do: {course.rejectReason || "--"}</div>
        </div>
      )}

      {course.status === "Pending" && (
        <>
          <div className="mt-3">
            <label className="form-label fw-semibold">
              Lý do từ chối nếu không duyệt
            </label>

            <textarea
              className="form-control"
              rows="4"
              placeholder="Ví dụ: Khóa học thiếu video ở lesson 2, mô tả chưa đầy đủ..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
          </div>

          <div className="d-flex gap-2 mt-3">
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
              onClick={() => onReject(rejectReason)}
              disabled={processing}
            >
              <i className="bi bi-x-circle me-1"></i>
              Từ chối khóa học
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminCourseReviewPanel;