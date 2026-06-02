export const TEACHER_APPLICATION_STATUS = {
  NOT_SENT: {
    label: "Chưa gửi",
    className: "application-status-not-sent",
    description: "Bạn chưa gửi hồ sơ đăng ký giáo viên.",
  },
  PENDING: {
    label: "Đang xử lý",
    className: "application-status-pending",
    description: "Hồ sơ đang chờ admin xét duyệt.",
  },
  APPROVED: {
    label: "Đã duyệt",
    className: "application-status-approved",
    description: "Hồ sơ đã được admin phê duyệt.",
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "application-status-rejected",
    description: "Vui lòng cập nhật hồ sơ và gửi lại.",
  },
};

export function getTeacherApplicationStatusMeta(approvalStatus, registered) {
  if (!registered) {
    return TEACHER_APPLICATION_STATUS.NOT_SENT;
  }
  const key = String(approvalStatus || "").toUpperCase();
  return TEACHER_APPLICATION_STATUS[key] || {
    label: approvalStatus || "—",
    className: "application-status-default",
    description: "",
  };
}
