import CertificatePreview from "./CertificatePreview";
import { downloadCertificatePng } from "../../utils/certificateDownload";
import "./CertificateSection.css";

function CertificateViewModal({ open, onClose, certificate }) {
  if (!open || !certificate) {
    return null;
  }

  const handleDownload = async () => {
    try {
      await downloadCertificatePng(certificate);
    } catch (err) {
      console.error(err);
      alert("Không thể tải chứng chỉ. Vui lòng thử lại.");
    }
  };

  return (
    <div className="certificate-modal-backdrop" onClick={onClose}>
      <div
        className="certificate-modal certificate-view-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="certificate-modal-header">
          <div>
            <h5 className="mb-1">Chứng chỉ khóa học</h5>
            <p className="text-muted small mb-0">
              Thông tin được in trực tiếp lên mẫu chứng chỉ
            </p>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Đóng"
            onClick={onClose}
          />
        </div>

        <div className="certificate-modal-body">
          <CertificatePreview certificate={certificate} />
        </div>

        <div className="certificate-modal-footer">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleDownload}
          >
            <i className="bi bi-download me-1"></i>
            Tải hình ảnh chứng chỉ
          </button>
        </div>
      </div>
    </div>
  );
}

export default CertificateViewModal;
