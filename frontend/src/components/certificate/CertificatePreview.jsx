import { useEffect, useState } from "react";
import { renderCertificateToCanvas } from "../../utils/certificateDownload";
import "./CertificateSection.css";

function resolveCourseTitle(previewCourseTitle, certificate) {
  return (
    previewCourseTitle?.trim() ||
    certificate?.courseTitle?.trim() ||
    "Tên khóa học"
  );
}

function CertificatePreview({ certificate, previewName, previewCourseTitle }) {
  const [imageSrc, setImageSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentName =
    previewName?.trim() ||
    certificate?.studentNameOnCertificate?.trim() ||
    "Họ và tên học viên";
  const courseTitle = resolveCourseTitle(previewCourseTitle, certificate);
  const issueDate = certificate?.issuedAt
    ? certificate.issuedAt
    : new Date().toISOString();
  const certificateCode =
    certificate?.certificateCode || "EL-YYYYMMDD-XXXXXX";

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setLoading(true);
      setError("");
      try {
        const canvas = await renderCertificateToCanvas({
          studentName,
          courseTitle,
          issueDate,
          certificateCode,
        });
        if (!cancelled) {
          setImageSrc(canvas.toDataURL("image/png"));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Không thể tạo xem trước chứng chỉ.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [studentName, courseTitle, issueDate, certificateCode]);

  return (
    <div className="certificate-preview-wrap">
      {loading && (
        <div className="certificate-preview-loading">
          <span className="spinner-border spinner-border-sm me-2" />
          Đang tạo xem trước...
        </div>
      )}
      {error && !loading && (
        <div className="alert alert-warning py-2 mb-0">{error}</div>
      )}
      {imageSrc && !loading && (
        <img
          src={imageSrc}
          alt={`Chứng chỉ — ${studentName}`}
          className="certificate-rendered-image"
        />
      )}
    </div>
  );
}

export default CertificatePreview;
