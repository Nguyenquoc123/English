import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherExamDetail.css";

function TeacherExamDetail() {
  const navigate = useNavigate();
  const { courseId} = useParams(); 
  const { examId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loadingExam, setLoadingExam] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  useEffect(() => {
    loadExamDetail();
    loadExamQuestions();
  }, [examId]);

  const loadExamDetail = async () => {
    try {
      setLoadingExam(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/dang-nhap");
        return;
      }

      const response = await fetch(`${API_BASE}/exams/${examId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const result = data?.result || data?.data || data;

      if (!response.ok) {
        setError(result?.message || data?.message || "Không thể tải chi tiết kỳ thi");
        return;
      }

      setExam(result);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server khi tải chi tiết kỳ thi");
    } finally {
      setLoadingExam(false);
    }
  };

  const loadExamQuestions = async () => {
    try {
      setLoadingQuestions(true);

      const token = getToken();

      if (!token) {
        navigate("/dang-nhap");
        return;
      }

      const response = await fetch(`${API_BASE}/exams/${examId}/questions/teacher`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const result = data?.result || data?.data || data;

      if (!response.ok) {
        setQuestions([]);
        return;
      }

      setQuestions(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!exam) return;

    const ok = window.confirm(`Bạn có chắc muốn xóa kỳ thi "${exam.title}" không?`);

    if (!ok) return;

    try {
      const token = getToken();

      const response = await fetch(`${API_BASE}/exams/${examId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Xóa kỳ thi thất bại");
        return;
      }

      alert("Xóa kỳ thi thành công");
      navigate("/teacher/exams");
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi xóa kỳ thi");
    }
  };

  const handleHideExam = async () => {
    if (!exam) return;

    const ok = window.confirm(`Bạn có chắc muốn ẩn kỳ thi "${exam.title}" không?`);

    if (!ok) return;

    try {
      const token = getToken();

      const response = await fetch(`${API_BASE}/exams/${examId}/hide`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Ẩn kỳ thi thất bại");
        return;
      }

      alert("Ẩn kỳ thi thành công");
      loadExamDetail();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi ẩn kỳ thi");
    }
  };

  const handleRemoveQuestion = async (question) => {
    const ok = window.confirm("Bạn có chắc muốn xóa câu hỏi này khỏi kỳ thi không?");

    if (!ok) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE}/exams/${examId}/questions/${question.examQuestionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Xóa câu hỏi khỏi kỳ thi thất bại");
        return;
      }

      alert("Xóa câu hỏi thành công");
      loadExamQuestions();
      loadExamDetail();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi xóa câu hỏi");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPoint = (value) => {
    if (value === null || value === undefined) return "0";

    const num = Number(value);

    if (Number.isNaN(num)) return value;

    return Number.isInteger(num) ? String(num) : num.toFixed(1);
  };

  const getStatusBadge = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "OPEN" || value === "ACTIVE") {
      return <span className="teacher-exam-status status-open">Đang mở</span>;
    }

    if (value === "CLOSED") {
      return <span className="teacher-exam-status status-closed">Đã đóng</span>;
    }

    if (value === "DRAFT") {
      return <span className="teacher-exam-status status-draft">Bản nháp</span>;
    }

    if (value === "HIDDEN") {
      return <span className="teacher-exam-status status-hidden">Đã ẩn</span>;
    }

    return <span className="teacher-exam-status status-muted">{status || "--"}</span>;
  };

  const getQuestionTypeText = (type) => {
    const value = String(type || "").toUpperCase();

    const labelMap = {
      MULTIPLE_CHOICE: "Trắc nghiệm",
      LISTENING_CHOICE: "Nghe chọn đáp án",
      LISTENING_FILL_BLANK: "Nghe điền từ",
      ARRANGE_SENTENCE: "Sắp xếp câu",
      WRITING_SHORT: "Viết ngắn",
    };

    return labelMap[value] || value || "--";
  };

  const getQuestionTypeBadge = (type) => {
    const value = String(type || "").toLowerCase();

    return (
      <span className={`question-type-badge type-${value}`}>
        {getQuestionTypeText(type)}
      </span>
    );
  };

  const calculatedTotalPoint = useMemo(() => {
    return questions.reduce((sum, item) => {
      return sum + Number(item.point || 0);
    }, 0);
  }, [questions]);

  const questionCount = exam?.questionCount ?? questions.length ?? 0;
  const totalPoint = exam?.totalPoint ?? calculatedTotalPoint;

  if (loadingExam) {
    return (
      <div className="teacher-exam-detail-page">
        <div className="teacher-exam-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải chi tiết kỳ thi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-exam-detail-page">
        <div className="teacher-exam-detail-container">
          <button
            type="button"
            className="teacher-exam-back"
            onClick={() => navigate("/teacher/exams")}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại
          </button>

          <div className="alert alert-danger mt-3">{error}</div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="teacher-exam-detail-page">
        <div className="teacher-exam-detail-container">
          <div className="alert alert-warning">Không tìm thấy kỳ thi.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-exam-detail-page">
      <div className="teacher-exam-detail-container">
        <div className="teacher-exam-page-top">
          <nav className="teacher-breadcrumb">
            <span
              className="teacher-breadcrumb-item"
              onClick={() => navigate("/teacher/courses")}
            >
              Khóa học
            </span>

            <i className="bi bi-chevron-right teacher-breadcrumb-separator"></i>

            <span
              className="teacher-breadcrumb-item"
              onClick={() => navigate(`/teacher/courses/${courseId}`)}
            >
              Chi tiết khóa học
            </span>

            <i className="bi bi-chevron-right teacher-breadcrumb-separator"></i>

            <span className="teacher-breadcrumb-item active">
              Bài thi
            </span>
          </nav>
        </div>

        <section className="exam-overview-card exam-overview-card-new">
          <div className="exam-overview-header">
            <div className="exam-title-block">
              <div className="exam-status-row">
                {getStatusBadge(exam.status)}
                <span className="exam-id-text">EX-{exam.examId}</span>
              </div>

              <h1>{exam.title || "Kỳ thi chưa có tiêu đề"}</h1>

              <div
                className="exam-description"
                dangerouslySetInnerHTML={{
                  __html: exam.description || "Chưa có mô tả kỳ thi.",
                }}
              ></div>
            </div>


          </div>

          <div className="exam-info-grid">
            <div className="exam-info-item">
              <span>Khóa học</span>
              <strong>{exam.courseTitle || "--"}</strong>
            </div>

            <div className="exam-info-item">
              <span>Mã khóa học</span>
              <strong>{exam.courseId ? `COURSE-${exam.courseId}` : "--"}</strong>
            </div>

            <div className="exam-info-item">
              <span>Ngày tạo</span>
              <strong>{formatDateTime(exam.createdAt)}</strong>
            </div>

            <div className="exam-info-item">
              <span>Cập nhật</span>
              <strong>{formatDateTime(exam.updatedAt)}</strong>
            </div>
          </div>
        </section>

        <section className="exam-stat-grid">
          <div className="exam-stat-card">
            <div className="stat-icon blue">
              <i className="bi bi-clock"></i>
            </div>

            <div>
              <span>Thời gian làm</span>
              <strong>{exam.durationMinutes || 0} phút</strong>
            </div>
          </div>

          <div className="exam-stat-card">
            <div className="stat-icon purple">
              <i className="bi bi-list-check"></i>
            </div>

            <div>
              <span>Số câu hỏi</span>
              <strong>{questionCount} câu</strong>
            </div>
          </div>

          <div className="exam-stat-card">
            <div className="stat-icon yellow">
              <i className="bi bi-star"></i>
            </div>

            <div>
              <span>Tổng điểm</span>
              <strong>{formatPoint(totalPoint)} điểm</strong>
            </div>
          </div>

          <div className="exam-stat-card">
            <div className="stat-icon orange">
              <i className="bi bi-shield-check"></i>
            </div>

            <div>
              <span>Trạng thái</span>
              <strong>{exam.status || "--"}</strong>
            </div>
          </div>
        </section>

        <section className="exam-question-card">
          <div className="exam-question-header">
            <div>
              <h4>Danh sách câu hỏi trong kỳ thi</h4>
              <p>Quản lý câu hỏi, điểm số, media và thứ tự hiển thị.</p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/teacher/exams/${examId}/questions/create`)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Thêm câu hỏi
            </button>

            <button
              type="button"
              className="btn btn-success"
              onClick={handleHideExam}
            >
              <i className="bi bi-eye-slash me-2"></i>
              Ẩn kỳ thi
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/teacher/exams/${examId}/update`)}
            >
              <i className="bi bi-pencil-square me-2"></i>
              Cập nhật kỳ thi
            </button>
          </div>

          {loadingQuestions ? (
            <div className="teacher-exam-question-loading">
              <div className="spinner-border text-primary mb-3"></div>
              <p>Đang tải danh sách câu hỏi...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="teacher-exam-empty">
              <i className="bi bi-journal-x"></i>
              <h5>Chưa có câu hỏi</h5>
              <p>Hãy thêm câu hỏi để hoàn thiện đề thi.</p>


            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table teacher-exam-question-table align-middle">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Nội dung câu hỏi</th>
                      <th>Dạng câu hỏi</th>
                      <th>Điểm</th>
                      <th>Media</th>
                      <th>Trạng thái</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody>
                    {questions.map((question, index) => (
                      <tr key={question.examQuestionId || question.questionId || index}>
                        <td>
                          <strong className="question-order">
                            {String(question.questionOrder || index + 1).padStart(2, "0")}
                          </strong>
                        </td>

                        <td>
                          <div className="question-content-cell">
                            <strong>
                              {question.content || "Câu hỏi chưa có nội dung"}
                            </strong>

                            {question.explanation && (
                              <span>{question.explanation}</span>
                            )}
                          </div>
                        </td>

                        <td>
                          {getQuestionTypeBadge(question.questionType)}
                        </td>

                        <td>
                          <strong>{formatPoint(question.point)}</strong>
                        </td>

                        <td>
                          {question.mediaUrl ? (
                            <button
                              type="button"
                              className="media-link-btn"
                              onClick={() =>
                                window.open(
                                  question.mediaUrl.startsWith("http")
                                    ? question.mediaUrl
                                    : `${API_BASE}/${question.mediaUrl}`,
                                  "_blank"
                                )
                              }
                            >
                              <i className="bi bi-file-earmark-play"></i>
                            </button>
                          ) : (
                            <span className="text-muted">Không có</span>
                          )}
                        </td>

                        <td>
                          <span className="question-status-active">
                            <i className="bi bi-circle-fill"></i>
                            {question.status || "ACTIVE"}
                          </span>
                        </td>

                        <td>
                          <div className="question-action-group">
                            <button
                              type="button"
                              className="question-icon-btn"
                              title="Xem câu hỏi"
                              onClick={() =>
                                navigate(`/teacher/questions/${question.questionId}`)
                              }
                            >
                              <i className="bi bi-eye"></i>
                            </button>

                            <button
                              type="button"
                              className="question-icon-btn"
                              title="Cập nhật điểm/thứ tự"
                              onClick={() =>
                                navigate(
                                  `/teacher/exams/${examId}/questions/${question.examQuestionId}/update`
                                )
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              type="button"
                              className="question-icon-btn danger"
                              title="Xóa khỏi kỳ thi"
                              onClick={() => handleRemoveQuestion(question)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="exam-question-footer">
                <span>
                  Hiển thị {questions.length} câu hỏi trong kỳ thi
                </span>

                <span>
                  Tổng điểm: <strong>{formatPoint(calculatedTotalPoint)}</strong>
                </span>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default TeacherExamDetail;