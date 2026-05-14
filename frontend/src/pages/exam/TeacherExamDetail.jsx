import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherExamDetail.css";

function TeacherExamDetail() {
  const navigate = useNavigate();
  const { examId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loadingExam, setLoadingExam] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
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
        setError(result?.message || "Không thể tải chi tiết kỳ thi");
        return;
      }

      setExam(result);
    } catch (error) {
      console.error(error);
      setError("Lỗi kết nối server khi tải chi tiết kỳ thi");
    } finally {
      setLoadingExam(false);
    }
  };

  const loadExamQuestions = async () => {
    try {
      setLoadingQuestions(true);

      const token = getToken();

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

      const result = data?.result || data?.data || data || [];

      if (!response.ok) {
        setQuestions([]);
        return;
      }

      setQuestions(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống khi ẩn kỳ thi");
    }
  };

  const handleRemoveQuestion = async (examQuestion) => {
    const ok = window.confirm("Bạn có chắc muốn xóa câu hỏi này khỏi kỳ thi?");
    if (!ok) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE}/exams/${examId}/questions/${examQuestion.examQuestionId}`,
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
    } catch (error) {
      console.error(error);
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
    const value = String(status || "").toLowerCase();

    if (value === "open") {
      return <span className="teacher-exam-status status-open">Open</span>;
    }

    if (value === "closed") {
      return <span className="teacher-exam-status status-closed">Closed</span>;
    }

    if (value === "draft") {
      return <span className="teacher-exam-status status-draft">Draft</span>;
    }

    if (value === "hidden") {
      return <span className="teacher-exam-status status-hidden">Hidden</span>;
    }

    return <span className="teacher-exam-status status-muted">{status || "--"}</span>;
  };

  const getQuestionTypeBadge = (type) => {
    const value = String(type || "").toUpperCase();

    const labelMap = {
      MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
      LISTENING_CHOICE: "LISTENING_CHOICE",
      LISTENING_FILL_BLANK: "LISTENING_FILL_BLANK",
      ARRANGE_SENTENCE: "ARRANGE_SENTENCE",
      WRITING_SHORT: "WRITING_SHORT",
    };

    return (
      <span className={`question-type-badge type-${value.toLowerCase()}`}>
        {labelMap[value] || value}
      </span>
    );
  };

  const totalPoint = questions.reduce((sum, item) => {
    return sum + Number(item.point || 0);
  }, 0);

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
          <button
            type="button"
            className="teacher-exam-back"
            onClick={() => navigate("/teacher/exams")}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại
          </button>

          <div className="teacher-exam-top-actions">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => navigate(`/teacher/exams/${examId}/results`)}
            >
              <i className="bi bi-people me-2"></i>
              Kết quả học viên
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
        </div>

        <section className="exam-overview-card">
          <div className="exam-overview-main">
            <div className="exam-status-row">
              {getStatusBadge(exam.status)}
              <span className="exam-id-text">EX-{exam.examId}</span>
            </div>

            <h1>{exam.title}</h1>

            <div
              className="exam-description"
              dangerouslySetInnerHTML={{
                __html: exam.description || "Chưa có mô tả kỳ thi.",
              }}
            ></div>

            <div className="exam-quick-actions">
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
                className="btn btn-outline-primary"
                onClick={() => navigate(`/teacher/exams/${examId}/results`)}
              >
                <i className="bi bi-bar-chart me-2"></i>
                Xem kết quả
              </button>

              <button
                type="button"
                className="btn btn-soft-danger"
                onClick={handleHideExam}
              >
                <i className="bi bi-eye-slash me-2"></i>
                Ẩn kỳ thi
              </button>

              <button
                type="button"
                className="btn btn-soft-danger"
                onClick={handleDeleteExam}
              >
                <i className="bi bi-trash me-2"></i>
                Xóa kỳ thi
              </button>
            </div>
          </div>

          <div className="exam-overview-side">
            <div className="exam-side-box">
              <span>Khóa học</span>
              <strong>{exam.courseTitle || "--"}</strong>
            </div>

            <div className="exam-side-box">
              <span>Bắt đầu</span>
              <strong>{formatDateTime(exam.startTime)}</strong>
            </div>

            <div className="exam-side-box">
              <span>Kết thúc</span>
              <strong>{formatDateTime(exam.endTime)}</strong>
            </div>

            <div className="exam-side-box">
              <span>Ngày tạo</span>
              <strong>{formatDateTime(exam.createdAt)}</strong>
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
              <strong>{questions.length || exam.questionCount || 0} câu</strong>
            </div>
          </div>

          <div className="exam-stat-card">
            <div className="stat-icon orange">
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <div>
              <span>Số lần làm</span>
              <strong>{exam.maxAttempts || 1} lần</strong>
            </div>
          </div>

          <div className="exam-stat-card">
            <div className="stat-icon yellow">
              <i className="bi bi-star"></i>
            </div>
            <div>
              <span>Tổng điểm</span>
              <strong>{formatPoint(exam.totalPoint ?? totalPoint)} điểm</strong>
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

              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={() => navigate(`/teacher/exams/${examId}/questions/create`)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Thêm câu hỏi đầu tiên
              </button>
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
                      <tr key={question.examQuestionId || question.questionId}>
                        <td>
                          <strong className="question-order">
                            {String(question.questionOrder || index + 1).padStart(2, "0")}
                          </strong>
                        </td>

                        <td>
                          <div className="question-content-cell">
                            <strong>{question.content}</strong>

                            {question.explanation && (
                              <span>{question.explanation}</span>
                            )}
                          </div>
                        </td>

                        <td>{getQuestionTypeBadge(question.questionType)}</td>

                        <td>
                          <strong>{formatPoint(question.point)}</strong>
                        </td>

                        <td>
                          {question.mediaUrl ? (
                            <button
                              type="button"
                              className="media-link-btn"
                              onClick={() =>
                                window.open(`${API_BASE}/${question.mediaUrl}`, "_blank")
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
                            {question.status || "Active"}
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

                <div className="question-pagination-lite">
                  <button type="button" disabled>
                    <i className="bi bi-chevron-left"></i>
                  </button>

                  <button type="button" className="active">
                    1
                  </button>

                  <button type="button" disabled>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default TeacherExamDetail;