import { useEffect, useState } from "react";
import { getRefundReasons } from "../../api/courseApi";
import "./RefundRequestModal.css";

const MIN_DETAIL_LENGTH = 10;
const MAX_DETAIL_LENGTH = 1000;

function RefundRequestModal({
  show,
  courseTitle,
  eligibility = null,
  submitting = false,
  error = "",
  onClose,
  onSubmit,
}) {
  const [reasonOptions, setReasonOptions] = useState([]);
  const [reasonCode, setReasonCode] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [localError, setLocalError] = useState("");
  const [loadingReasons, setLoadingReasons] = useState(false);

  useEffect(() => {
    if (!show) {
      return;
    }

    setReasonCode("");
    setDetailDescription("");
    setLocalError("");

    const loadReasons = async () => {
      try {
        setLoadingReasons(true);
        const res = await getRefundReasons();
        const data = res.data?.result ?? res.data?.data ?? res.data ?? [];
        setReasonOptions(Array.isArray(data) ? data : []);
      } catch {
        setReasonOptions([]);
      } finally {
        setLoadingReasons(false);
      }
    };

    loadReasons();
  }, [show, courseTitle]);

  if (!show) {
    return null;
  }

  const selectedOption = reasonOptions.find((item) => item.code === reasonCode);
  const requiresDetail = reasonCode === "OTHER";
  const detailTrimmed = detailDescription.trim();

  const formatCountdown = (seconds) => {
    if (seconds == null) return null;
    const total = Math.max(0, Number(seconds));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reasonCode) {
      setLocalError("Vui lòng chọn lý do hoàn tiền");
      return;
    }

    if (requiresDetail && detailTrimmed.length < MIN_DETAIL_LENGTH) {
      setLocalError(`Vui lòng mô tả chi tiết ít nhất ${MIN_DETAIL_LENGTH} ký tự`);
      return;
    }

    setLocalError("");
    onSubmit({
      reasonCode,
      detailDescription: detailTrimmed || null,
    });
  };

  const displayError = localError || error;

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
                      : "Chọn lý do và gửi yêu cầu hoàn tiền"}
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
                {eligibility && (
                  <div className="alert alert-light border mb-3 py-2">
                    <div className="small">
                      Tiến độ học:{" "}
                      <strong>
                        {eligibility.completedLessons ?? 0}/{eligibility.totalLessons ?? 0} bài
                        {eligibility.progressPercent != null
                          ? ` (${Number(eligibility.progressPercent).toFixed(1)}%)`
                          : ""}
                      </strong>
                    </div>
                    {eligibility.remainingSeconds != null && (
                      <div className="small text-muted">
                        Còn {formatCountdown(eligibility.remainingSeconds)} trong thời hạn hoàn tiền 7 ngày
                      </div>
                    )}
                  </div>
                )}

                {displayError && (
                  <div className="alert alert-danger py-2 d-flex align-items-start gap-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill mt-1" />
                    <span>{displayError}</span>
                  </div>
                )}

                <label htmlFor="refundReasonCode" className="form-label fw-semibold">
                  Lý do hoàn tiền <span className="text-danger">*</span>
                </label>
                <select
                  id="refundReasonCode"
                  className="form-select mb-3"
                  value={reasonCode}
                  onChange={(e) => {
                    setReasonCode(e.target.value);
                    if (localError) setLocalError("");
                  }}
                  disabled={submitting || loadingReasons}
                >
                  <option value="">
                    {loadingReasons ? "Đang tải danh sách lý do..." : "— Chọn lý do —"}
                  </option>
                  {reasonOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {(requiresDetail || detailDescription) && (
                  <>
                    <label htmlFor="refundDetail" className="form-label fw-semibold">
                      Mô tả chi tiết
                      {requiresDetail && <span className="text-danger"> *</span>}
                    </label>
                    <textarea
                      id="refundDetail"
                      className="refund-modal-textarea"
                      rows={8}
                      placeholder={
                        selectedOption
                          ? `Mô tả thêm về: ${selectedOption.label}`
                          : "Mô tả chi tiết lý do hoàn tiền..."
                      }
                      value={detailDescription}
                      onChange={(e) => {
                        setDetailDescription(e.target.value.slice(0, MAX_DETAIL_LENGTH));
                        if (localError) setLocalError("");
                      }}
                      disabled={submitting}
                    />
                    <div className="d-flex justify-content-between align-items-center mt-2 mb-2">
                      <small className="text-muted">
                        {requiresDetail
                          ? `Bắt buộc tối thiểu ${MIN_DETAIL_LENGTH} ký tự khi chọn "Lý do khác".`
                          : "Mô tả thêm giúp admin xử lý nhanh hơn (không bắt buộc)."}
                      </small>
                      <small className="text-muted">
                        {detailTrimmed.length}/{MAX_DETAIL_LENGTH}
                      </small>
                    </div>
                  </>
                )}

                <small className="text-muted d-block">
                  Sau khi gửi, quyền học khóa học sẽ tạm khóa cho đến khi admin duyệt hoặc từ chối.
                </small>
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
                  disabled={submitting || loadingReasons}
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
