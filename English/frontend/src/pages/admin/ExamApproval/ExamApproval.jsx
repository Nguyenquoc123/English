import { useEffect, useState } from "react";
import { getAllExams, updateExamStatus } from "../../../api/adminApi";
import "./ExamApproval.css";

function ExamApproval() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await getAllExams();
      setExams(res.data);
    } catch {
      alert("Lỗi tải danh sách kỳ thi");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (examId, status, title) => {
    const statusLabels = { Open: "Mở", Hidden: "Ẩn", Closed: "Đóng", Draft: "Lưu nháp" };
    const ok = window.confirm(`${statusLabels[status] || status} kỳ thi "${title}"?`);
    if (!ok) return;

    setActionLoading(examId);
    try {
      await updateExamStatus(examId, status);
      fetchExams();
    } catch {
      alert("Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Draft") return "badge rounded-pill text-bg-warning";
    if (status === "Open") return "badge rounded-pill text-bg-success";
    if (status === "Closed") return "badge rounded-pill text-bg-secondary";
    if (status === "Hidden") return "badge rounded-pill text-bg-danger";
    return "badge rounded-pill text-bg-secondary";
  };

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

  const filteredExams = tab === "all" ? exams : exams.filter((e) => e.status === tab);

  return (
    <div className="admin-exam-approval-page">
      <div className="admin-page-heading">
        <div>
          <h2>Quản lý kỳ thi</h2>
          <p>Admin xem và thay đổi trạng thái kỳ thi do giáo viên tạo.</p>
        </div>

        <button className="btn btn-outline-secondary" onClick={fetchExams}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      <div className="admin-filter-card">
        <div className="d-flex gap-2 flex-wrap">
          <button
            className={`btn btn-sm ${tab === "all" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setTab("all")}
          >
            <i className="bi bi-list-ul me-1"></i>
            Tất cả ({exams.length})
          </button>

          <button
            className={`btn btn-sm ${tab === "Draft" ? "btn-warning" : "btn-outline-secondary"}`}
            onClick={() => setTab("Draft")}
          >
            <i className="bi bi-file-earmark me-1"></i>
            Bản nháp ({exams.filter((e) => e.status === "Draft").length})
          </button>

          <button
            className={`btn btn-sm ${tab === "Open" ? "btn-success" : "btn-outline-secondary"}`}
            onClick={() => setTab("Open")}
          >
            <i className="bi bi-check-circle me-1"></i>
            Đang mở ({exams.filter((e) => e.status === "Open").length})
          </button>

          <button
            className={`btn btn-sm ${tab === "Closed" ? "btn-secondary" : "btn-outline-secondary"}`}
            onClick={() => setTab("Closed")}
          >
            <i className="bi bi-lock me-1"></i>
            Đã đóng ({exams.filter((e) => e.status === "Closed").length})
          </button>

          <button
            className={`btn btn-sm ${tab === "Hidden" ? "btn-danger" : "btn-outline-secondary"}`}
            onClick={() => setTab("Hidden")}
          >
            <i className="bi bi-eye-slash me-1"></i>
            Đã ẩn ({exams.filter((e) => e.status === "Hidden").length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải danh sách kỳ thi...</div>
        </div>
      )}

      {!loading && (
        <div className="admin-table-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Tên kỳ thi</th>
                  <th>Khóa học</th>
                  <th>Giáo viên</th>
                  <th>Thời lượng</th>
                  <th>Trạng thái</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-5">
                      Không có kỳ thi nào.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam, idx) => (
                    <tr key={exam.examId}>
                      <td>{idx + 1}</td>
                      <td className="exam-title-cell">{exam.title}</td>
                      <td>{exam.courseTitle || "—"}</td>
                      <td>{exam.createdByUsername || "—"}</td>
                      <td>{exam.durationMinutes ? `${exam.durationMinutes} phút` : "—"}</td>
                      <td>
                        <span className={getStatusBadge(exam.status)}>
                          {exam.status}
                        </span>
                      </td>
                      <td>{fmtDate(exam.startTime)}</td>
                      <td>{fmtDate(exam.endTime)}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {(exam.status === "Draft" || exam.status === "Hidden") && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              disabled={actionLoading === exam.examId}
                              onClick={() => handleUpdateStatus(exam.examId, "Open", exam.title)}
                            >
                              {actionLoading === exam.examId ? "..." : "Mở"}
                            </button>
                          )}

                          {exam.status === "Open" && (
                            <button
                              className="btn btn-sm btn-outline-warning"
                              disabled={actionLoading === exam.examId}
                              onClick={() => handleUpdateStatus(exam.examId, "Hidden", exam.title)}
                            >
                              {actionLoading === exam.examId ? "..." : "Ẩn"}
                            </button>
                          )}

                          {exam.status === "Open" && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled={actionLoading === exam.examId}
                              onClick={() => handleUpdateStatus(exam.examId, "Closed", exam.title)}
                            >
                              {actionLoading === exam.examId ? "..." : "Đóng"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamApproval;
