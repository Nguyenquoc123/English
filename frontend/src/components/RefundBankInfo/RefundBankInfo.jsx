function RefundBankInfo({
  bankName,
  accountNumber,
  accountName,
  studentName,
  studentPhone,
  amount,
  compact = false,
}) {
  const hasBank = Boolean(bankName && accountNumber && accountName);

  if (!hasBank) {
    return (
      <span className="text-muted small">Học viên chưa khai báo STK nhận hoàn tiền</span>
    );
  }

  const copyText = [
    `Ngân hàng: ${bankName}`,
    `Số TK: ${accountNumber}`,
    `Chủ TK: ${accountName}`,
    studentName ? `Học viên: ${studentName}` : null,
    studentPhone ? `SĐT: ${studentPhone}` : null,
    amount != null ? `Số tiền hoàn: ${amount}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      alert("Đã sao chép thông tin chuyển khoản");
    } catch {
      alert("Không sao chép được — vui lòng copy thủ công");
    }
  };

  if (compact) {
    return (
      <div className="refund-bank-info refund-bank-info--compact">
        <div className="fw-semibold small">{bankName}</div>
        <div className="small font-monospace">{accountNumber}</div>
        <div className="text-muted small text-uppercase">{accountName}</div>
        <button type="button" className="btn btn-link btn-sm p-0 mt-1" onClick={handleCopy}>
          Sao chép
        </button>
      </div>
    );
  }

  return (
    <div className="refund-bank-info border rounded-3 p-2 bg-light">
      <div className="small mb-1">
        <span className="text-muted">Ngân hàng:</span>{" "}
        <strong>{bankName}</strong>
      </div>
      <div className="small mb-1">
        <span className="text-muted">Số TK:</span>{" "}
        <strong className="font-monospace">{accountNumber}</strong>
      </div>
      <div className="small mb-1">
        <span className="text-muted">Chủ TK:</span>{" "}
        <strong className="text-uppercase">{accountName}</strong>
      </div>
      {studentName && (
        <div className="small mb-1">
          <span className="text-muted">Học viên:</span> {studentName}
        </div>
      )}
      {studentPhone && (
        <div className="small mb-2">
          <span className="text-muted">SĐT:</span> {studentPhone}
        </div>
      )}
      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        onClick={handleCopy}
      >
        <i className="bi bi-clipboard me-1" />
        Sao chép thông tin CK
      </button>
    </div>
  );
}

export default RefundBankInfo;
