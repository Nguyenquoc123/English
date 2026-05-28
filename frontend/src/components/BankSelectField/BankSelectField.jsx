import {
  BANK_OTHER_VALUE,
  VIETNAM_BANKS,
} from "../../constants/vietnamBanks";

function BankSelectField({
  bankSelect,
  customBankName,
  onBankSelectChange,
  onCustomBankNameChange,
  disabled = false,
  selectId = "bankSelect",
  customId = "customBankName",
}) {
  return (
    <>
      <div className="mb-3">
        <label className="form-label fw-semibold" htmlFor={selectId}>
          Ngân hàng <span className="text-danger">*</span>
        </label>
        <select
          id={selectId}
          className="form-select"
          value={bankSelect}
          disabled={disabled}
          onChange={(e) => onBankSelectChange(e.target.value)}
        >
          <option value="">-- Chọn ngân hàng --</option>
          {VIETNAM_BANKS.map((bank) => (
            <option key={bank.value} value={bank.value}>
              {bank.label}
            </option>
          ))}
          <option value={BANK_OTHER_VALUE}>Khác (nhập tên ngân hàng)</option>
        </select>
      </div>

      {bankSelect === BANK_OTHER_VALUE && (
        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor={customId}>
            Tên ngân hàng khác <span className="text-danger">*</span>
          </label>
          <input
            id={customId}
            type="text"
            className="form-control"
            placeholder="Nhập tên ngân hàng"
            value={customBankName}
            disabled={disabled}
            onChange={(e) => onCustomBankNameChange(e.target.value)}
          />
        </div>
      )}
    </>
  );
}

export default BankSelectField;
