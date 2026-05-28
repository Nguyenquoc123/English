import { useEffect, useState } from "react";
import "./RefundRequestModal.css";

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 1000;

function RefundRequestModal({
  show,
  courseTitle,
  submitting = false,
  error = "",
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (show) {
      setReason("");
      setLocalError("");
    }
  }, [show, courseTitle]);

  if (!show) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = reason.trim();

    if (!trimmed) {
      setLocalError("Vui lòng nhập lý do hoàn tiền");
      return;
    }

    if (trimmed.length < MIN_REASON_LENGTH) {
      setLocalError(`Lý do cần ít nhất ${MIN_REASON_LENGTH} ký tự`);
      return;
    }

    setLocalError("");
    onSubmit(trimmed);
  };

  const displayError = localError || error;
  const charCount = reason.trim().length;

  return (
    <>
      <div
        className="refund-modal-overlay"
        onClick={submitting ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        className="modal fade show d-block refund-modal"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="refundModalTitle"
      >
        <div className="modal-dialog modal-dialog-centered refund-modal-dialog">
          <div className="modal-content border-0 rounded-4 shadow refund-modal-card">
            <form onSubmit={handleSubmit}>
              <div className="modal-header px-4 py-3 border-0">
                <div>
                  <h5 className="modal-title fw-bold" id="refundModalTitle">
                    Yêu cầu hoàn tiền
                  </h5>
                  <p className="refund-modal-subtitle mb-0">
                    {courseTitle
                      ? `Khóa học: ${courseTitle}`
                      : "Vui lòng mô tả lý do bạn muốn hoàn tiền"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  disabled={submitting}
                  aria-label="Đóng"
                />
              </div>

              <div className="modal-body px-4 pt-0 pb-2">
                {displayError && (
                  <div className="alert alert-danger py-2 d-flex align-items-start gap-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill mt-1" />
                    <span>{displayError}</span>
                  </div>
                )}

                <label htmlFor="refundReason" className="form-label fw-semibold">
                  Lý do hoàn tiền <span className="text-danger">*</span>
                </label>
                <textarea
                  id="refundReason"
                  className="refund-modal-textarea"
                  rows={12}
                  placeholder="Ví dụ: Nội dung khóa học không đúng mô tả, không phù hợp trình độ..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value.slice(0, MAX_REASON_LENGTH));
                    if (localError) setLocalError("");
                  }}
                  disabled={submitting}
                  autoFocus
                />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">
                    Tối thiểu {MIN_REASON_LENGTH} ký tự. Admin sẽ xem xét trong thời gian sớm nhất.
                  </small>
                  <small
                    className={
                      charCount > MAX_REASON_LENGTH * 0.9
                        ? "text-warning"
                        : "text-muted"
                    }
                  >
                    {charCount}/{MAX_REASON_LENGTH}
                  </small>
                </div>
              </div>

              <div className="modal-footer px-4 py-3 border-0">
                <button
                  type="button"
                  className="btn btn-light border"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn refund-modal-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-1" />
                      Gửi yêu cầu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default RefundRequestModal;
