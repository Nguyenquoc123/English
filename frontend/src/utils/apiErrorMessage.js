export function getApiErrorMessage(error, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  const data = error?.response?.data;
  const status = error?.response?.status;

  const message =
    (typeof data === "string" ? data : null) ||
    data?.message ||
    data?.error ||
    error?.message ||
    fallback;

  if (
    status === 404 ||
    /static resource|NoResourceFound|API không tồn tại/i.test(message)
  ) {
    return (
      "Backend chưa tải API chứng chỉ. Dừng EnglishApplication cũ, chạy scripts/restart-backend.ps1 " +
      "(hoặc mvn compile rồi Run lại), sau đó mở http://localhost:8080/khoa-hoc/certificate-api-health — phải thấy ok:true."
    );
  }

  return message;
}
