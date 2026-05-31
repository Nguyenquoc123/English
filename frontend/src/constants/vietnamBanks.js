/** Danh sách ngân hàng phổ biến tại Việt Nam (dùng cho chọn STK nhận tiền / hoàn tiền) */
export const VIETNAM_BANKS = [
  { value: "MB Bank (MBBANK)", label: "MB Bank (MBBANK)" },
  { value: "VietinBank", label: "VietinBank" },
  { value: "Vietcombank", label: "Vietcombank" },
  { value: "BIDV", label: "BIDV" },
  { value: "Agribank", label: "Agribank" },
  { value: "Techcombank", label: "Techcombank" },
  { value: "ACB", label: "ACB" },
  { value: "Sacombank", label: "Sacombank" },
  { value: "VPBank", label: "VPBank" },
  { value: "TPBank", label: "TPBank" },
  { value: "HDBank", label: "HDBank" },
  { value: "SHB", label: "SHB" },
  { value: "VIB", label: "VIB" },
  { value: "MSB", label: "MSB" },
  { value: "OCB", label: "OCB" },
  { value: "LienVietPostBank", label: "LienVietPostBank (LPB)" },
  { value: "SeABank", label: "SeABank" },
  { value: "Eximbank", label: "Eximbank" },
  { value: "Nam A Bank", label: "Nam A Bank" },
  { value: "Bac A Bank", label: "Bac A Bank" },
];

export const BANK_OTHER_VALUE = "__OTHER__";

export function resolveBankName(selectValue, customBankName) {
  if (selectValue === BANK_OTHER_VALUE) {
    return (customBankName || "").trim();
  }
  return (selectValue || "").trim();
}

export function splitBankNameForForm(bankName) {
  const name = (bankName || "").trim();
  const found = VIETNAM_BANKS.find((b) => b.value === name);
  if (found) {
    return { bankSelect: found.value, customBankName: "" };
  }
  if (!name) {
    return { bankSelect: "", customBankName: "" };
  }
  return { bankSelect: BANK_OTHER_VALUE, customBankName: name };
}
