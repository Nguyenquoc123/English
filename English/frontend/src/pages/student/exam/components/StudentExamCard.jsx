import { useNavigate } from "react-router-dom";

function StudentExamCard({ exam, courseId }) {
  const navigate = useNavigate();

  const getStatusInfo = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "open") {
      return {
        label: "Open",
        className: "status-open",
      };
    }

    if (value === "closed") {
      return {
        label: "Closed",
        className: "status-closed",
      };
    }

    if (value === "draft") {
      return {
        label: "Draft",
        className: "status-draft",
      };
    }

    if (value === "hidden") {
      return {
        label: "Hidden",
        className: "status-hidden",
      };
    }

    return {
      label: status || "--",
      className: "status-muted",
    };
  };

  const getExamTypeText = () => {
    if (exam.canTakeExam === false) {
      return exam.message || "Chưa đủ điều kiện";
    }

    if (String(exam.status || "").toLowerCase() === "open") {
      return "Có thể làm bài";
    }

    return "Xem chi tiết";
  };

  const getExamTypeClass = () => {
    if (exam.canTakeExam === false) {
      return "exam-condition-warning";
    }

    if (String(exam.status || "").toLowerCase() === "open") {
      return "exam-condition-success";
    }

    return "exam-condition-muted";
  };

  const getCardIcon = () => {
    const title = String(exam.title || "").toLowerCase();

    if (title.includes("listening")) return "bi bi-headphones";
    if (title.includes("writing")) return "bi bi-pencil-square";
    if (title.includes("grammar")) return "bi bi-translate";
    if (title.includes("vựng") || title.includes("vocabulary")) return "bi bi-card-text";

    return "bi bi-journal-text";
  };

  const handleViewDetail = () => {
    navigate(`/courses/${courseId}/exams/${exam.examId}`);
  };

  const handleStartExam = () => {
    if (String(exam.status || "").toLowerCase() !== "open") {
      alert("Bài thi hiện chưa mở.");
      return;
    }

    if (exam.canTakeExam === false) {
      alert(exam.message || "Bạn chưa đủ điều kiện làm bài thi này.");
      return;
    }

    navigate(`/exams/${exam.examId}/`);
  };

  const statusInfo = getStatusInfo(exam.status);

  return (
    <div className="student-exam-card">
      <div className="exam-card-cover">
        <span className={`exam-status-chip ${statusInfo.className}`}>
          {statusInfo.label}
        </span>

        <div className="exam-cover-icon">
          <i className={getCardIcon()}></i>
        </div>
      </div>

      <div className="exam-card-body">
        <h5>{exam.title}</h5>

        {exam.courseTitle && <p className="exam-course-title">{exam.courseTitle}</p>}

        <div className="exam-meta-row">
          <span>
            <i className="bi bi-clock"></i>
            {exam.durationMinutes || 0} phút
          </span>

          <span>
            <i className="bi bi-list-check"></i>
            {exam.questionCount || 0} câu
          </span>

          <span>
            <i className="bi bi-star"></i>
            {exam.totalPoint || exam.maxScore || 10} điểm
          </span>
        </div>

        <div className={getExamTypeClass()}>
          {getExamTypeText()}
        </div>

        <div className="exam-card-actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={handleViewDetail}
          >
            Xem chi tiết
          </button>

          {String(exam.status || "").toLowerCase() === "open" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleStartExam}
              disabled={exam.canTakeExam === false}
            >
              Làm bài
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentExamCard;