import { useEffect, useState } from "react";
import CertificatePreview from "./CertificatePreview";
import { issueCertificate } from "../../api/courseCertificateApi";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";
import "./CertificateSection.css";

function CertificateModal({
  open,
  onClose,
  courseId,
  courseTitle,
  resolvedCourseTitle,
  onSuccess,
}) {
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (open) {
      setStudentName("");
      setError("");
      setShowPreview(true);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const displayCourseTitle =
    resolvedCourseTitle?.trim() || courseTitle?.trim() || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = studentName.trim();
    if (!trimmed) {
      setError("Vui lòng nhập họ và tên in trên chứng chỉ.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Họ và tên phải có ít nhất 2 ký tự.");
      return;
    }
    if (trimmed.length > 255) {
      setError("Họ và tên không được vượt quá 255 ký tự.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await issueCertificate(courseId, trimmed);
      const data = res.data?.result ?? res.data?.data ?? res.data;
      onSuccess(data);
      onClose();
    } catch (err) {
      const status = err.response?.status;
      let message = getApiErrorMessage(err, "Không thể tạo chứng chỉ. Vui lòng thử lại.");
      if (status === 500) {
        message =
          err.response?.data?.message ||
          "Lỗi server. Chạy course_certificate_migration.sql trong SSMS và khởi động lại backend.";
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="certificate-modal-backdrop" onClick={onClose}>
      <div
        className="certificate-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="certificate-modal-title"
      >
        <div className="certificate-modal-header">
          <div>
            <h5 id="certificate-modal-title" className="mb-1">
              Thông tin in trên chứng chỉ
            </h5>
            <p className="text-muted small mb-0">
              Bạn đã hoàn thành khóa học. Hãy nhập họ và tên để nhận chứng chỉ.
            </p>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Đóng"
            onClick={onClose}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="certificate-modal-body">
            <div className="mb-3">
              <label className="form-label">Khóa học (tự động)</label>
              <input
                type="text"
                className="form-control bg-light"
                value={displayCourseTitle || "Đang tải tên khóa học..."}
                readOnly
                disabled
              />
              <small className="text-muted">
                Tên khóa học được hệ thống lấy từ khóa học bạn đang học.
              </small>
            </div>

            <div className="mb-3">
              <label htmlFor="certificate-student-name" className="form-label">
                Họ và tên in trên chứng chỉ <span className="text-danger">*</span>
              </label>
              <input
                id="certificate-student-name"
                type="text"
                className="form-control"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                maxLength={255}
                autoFocus
              />
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? "Ẩn xem trước" : "Xem trước chứng chỉ"}
              </button>
            </div>

            {showPreview && displayCourseTitle && (
              <CertificatePreview
                previewName={studentName.trim() || "Họ và tên học viên"}
                previewCourseTitle={displayCourseTitle}
              />
            )}

            {error && <div className="alert alert-danger py-2">{error}</div>}
          </div>

          <div className="certificate-modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
            >
              {submitting ? "Đang tạo..." : "Xác nhận tạo chứng chỉ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CertificateModal;
