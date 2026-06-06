import { useCallback, useEffect, useState } from "react";
import { getCertificateStatus } from "../../api/courseCertificateApi";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";
import CertificateModal from "./CertificateModal";
import CertificateViewModal from "./CertificateViewModal";
import "./CertificateSection.css";

function CertificateSection({ courseId, courseTitle, isEnrolled, lessons }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const allContentCompleted =
    lessons.length > 0 && lessons.every((item) => item.completed);

  const loadStatus = useCallback(async () => {
    if (!courseId || !isEnrolled) {
      setStatus(null);
      return;
    }

    try {
      setLoading(true);
      const res = await getCertificateStatus(courseId);
      setStatus(res.data?.result ?? res.data?.data ?? res.data);
    } catch (err) {
      console.error(err);
      const msg = getApiErrorMessage(
        err
      );
      setStatus({
        courseTitle: courseTitle || "",
        progressPercent: allContentCompleted ? 100 : 0,
        eligible: allContentCompleted,
        alreadyIssued: false,
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, isEnrolled, courseTitle, lessons]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus, lessons]);

  const handleIssueSuccess = (certificate) => {
    setStatus((prev) => ({
      ...prev,
      eligible: false,
      alreadyIssued: true,
      progressPercent: 100,
      certificate,
    }));
    setViewModalOpen(true);
  };

  const handleRowClick = () => {
    if (loading) return;

    const certificate = status?.certificate;

    if (status?.alreadyIssued && certificate) {
      setViewModalOpen(true);
      return;
    }

    const canOpenIssue =
      status?.eligible || (allContentCompleted && !status?.alreadyIssued);

    if (canOpenIssue) {
      setIssueModalOpen(true);
      return;
    }

    alert(
      status?.message ||
        "Bạn cần hoàn thành toàn bộ khóa học để nhận chứng chỉ."
    );
  };

  if (!isEnrolled) {
    return null;
  }

  const certificate = status?.certificate;
  const isIssued = Boolean(status?.alreadyIssued && certificate);
  const isReady =
    isIssued || status?.eligible || (allContentCompleted && !isIssued);
  const rowTitle = isIssued
    ? "Xem chứng chỉ khóa học"
    : "Nhận chứng chỉ khóa học";

  const resolvedCourseTitle =
    status?.courseTitle?.trim() || courseTitle?.trim() || "";

  const rowSubtitle = isIssued
    ? "Nhấn để xem và tải hình ảnh chứng chỉ"
    : isReady
      ? "Hoàn thành khóa học — nhấn để nhập họ tên và tạo chứng chỉ"
      : "Hoàn thành toàn bộ nội dung khóa học để mở khóa";

  return (
    <>
      <div
        className={
          isReady
            ? "student-content-wrapper certificate-content-wrapper ready"
            : "student-content-wrapper certificate-content-wrapper locked"
        }
      >
        <button
          type="button"
          className="student-lesson-item certificate-lesson-item"
          onClick={handleRowClick}
          disabled={loading}
        >
          <div className="lesson-index certificate-index">
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <i className="bi bi-award-fill"></i>
            )}
          </div>

          <div className="flex-grow-1 text-start">
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <strong>{rowTitle}</strong>
              {isIssued && (
                <span className="badge text-bg-success">Đã cấp</span>
              )}
              {!isIssued && isReady && (
                <span className="badge certificate-badge-ready">Sẵn sàng</span>
              )}
            </div>
            <span>{rowSubtitle}</span>
          </div>

          <div className="lesson-meta">
            {isReady ? (
              <i className="bi bi-chevron-right text-success"></i>
            ) : (
              <i className="bi bi-lock text-muted"></i>
            )}
          </div>
        </button>
      </div>

      <CertificateModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        courseId={courseId}
        courseTitle={courseTitle}
        resolvedCourseTitle={resolvedCourseTitle}
        onSuccess={handleIssueSuccess}
      />

      <CertificateViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        certificate={certificate}
      />
    </>
  );
}

export default CertificateSection;
