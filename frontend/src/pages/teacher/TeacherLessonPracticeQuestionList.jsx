import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function TeacherLessonPracticeQuestionList({
  embedded = false,
  courseId: courseIdProp,
  lessonId: lessonIdProp,
  practiceType: practiceTypeProp,
  practiceLabel = "",
  onBack,
}) {
  const navigate = useNavigate();
  const params = useParams();

  const courseId = courseIdProp || params.courseId;
  const lessonId = lessonIdProp || params.lessonId;
  const practiceType = practiceTypeProp || params.practiceType;

  const API_BASE = "http://localhost:8080";

  const [questions, setQuestions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (courseId && lessonId && practiceType) {
      loadQuestions();
    }
  }, [courseId, lessonId, practiceType]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/lesson/${courseId}/teacher/lessons/${lessonId}`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
        setError(data?.message || "Không thể tải danh sách câu hỏi");
        return;
      }

      const lessonData = data?.result || data?.data || data;

      const filteredQuestions = (lessonData.questions || []).filter(
        (question) => question.questionType === practiceType
      );

      setQuestions(filteredQuestions);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    const searchText = keyword.trim().toLowerCase();

    if (!searchText) {
      return questions;
    }

    return questions.filter((question) => {
      const text = [
        question.content,
        question.questionText,
        question.questionType,
        question.explanation,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(searchText);
    });
  }, [keyword, questions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setKeyword("");
  };

  const handleBack = () => {
    if (embedded && onBack) {
      onBack();
      return;
    }

    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/practice`);
  };

  const handleCreateQuestion = () => {
    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/questions/create`);
  };

  const handleViewQuestion = (questionId) => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}/questions/${questionId}`
    );
  };

  const handleEditQuestion = (questionId) => {
    navigate(
      `/teacher/courses/${courseId}/lessons/${lessonId}/questions/${questionId}/edit`
    );
  };

  const handleDeleteQuestion = async (questionId) => {
    const ok = window.confirm("Bạn có chắc muốn xóa câu hỏi này không?");
    if (!ok) return;

    try {
      setDeletingId(questionId);

      const token = localStorage.getItem("token");

      /*
        Đổi endpoint này nếu API xóa câu hỏi của bạn khác.
      */
      const response = await fetch(`${API_BASE}/question/${questionId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        alert(data?.message || "Xóa câu hỏi thất bại");
        return;
      }

      alert("Xóa câu hỏi thành công");
      loadQuestions();
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setDeletingId(null);
    }
  };

  const getQuestionContent = (question) => {
    return question.content || question.questionText || "Chưa có nội dung câu hỏi";
  };

  return (
    <div className={embedded ? "p-3" : "teacher-lesson-detail-page"}>
      {!embedded && (
        <div className="lesson-detail-heading">
          <div>
            <button
              type="button"
              className="lesson-detail-back"
              onClick={handleBack}
            >
              <i className="bi bi-arrow-left"></i>
              Quay lại quản lý ôn tập
            </button>

            <h2>Danh sách câu hỏi</h2>
            <p>Hiển thị các câu hỏi thuộc dạng ôn tập đã chọn.</p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateQuestion}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm câu hỏi
          </button>
        </div>
      )}

      {embedded && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>

            <h5 className="fw-bold mb-1">
              {practiceLabel || "Danh sách câu hỏi"}
            </h5>

            <div className="text-muted small">{practiceType}</div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateQuestion}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm câu hỏi
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-2 align-items-end">
              <div className="col-md-8">
                <label className="form-label fw-semibold">
                  Tìm kiếm câu hỏi
                </label>

                <div className="input-group">
                  
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm theo nội dung câu hỏi..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-fill">
                    <i className="bi bi-search me-1"></i>
                    Tìm kiếm
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleClearSearch}
                  >
                    Làm mới
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading && (
            <div className="text-center text-muted py-4">
              <div className="spinner-border spinner-border-sm text-primary me-2"></div>
              Đang tải danh sách câu hỏi...
            </div>
          )}

          {!loading && !error && filteredQuestions.length === 0 && (
            <div className="text-center text-muted py-5">
              <div className="mb-2">
                <i className="bi bi-question-circle fs-2"></i>
              </div>
              Dạng ôn tập này chưa có câu hỏi.
            </div>
          )}

          {!loading && !error && filteredQuestions.length > 0 && (
            <div className="d-flex flex-column gap-3">
              {filteredQuestions.map((question, index) => (
                <div
                  className="border rounded-3 p-3 bg-white"
                  key={question.questionId || index}
                >
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge text-bg-light border">
                          #{index + 1}
                        </span>

                        <span className="badge text-bg-primary">
                          {question.questionType || practiceType}
                        </span>
                      </div>

                      <h6 className="fw-bold mb-2">
                        {getQuestionContent(question)}
                      </h6>

                      <div className="text-muted small">
                        Số đáp án:{" "}
                        <strong>{question.optionCount || 0}</strong>
                      </div>
                    </div>

                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        title="Xem"
                        onClick={() => handleViewQuestion(question.questionId)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        title="Cập nhật"
                        onClick={() => handleEditQuestion(question.questionId)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-light text-danger"
                        title="Xóa"
                        onClick={() => handleDeleteQuestion(question.questionId)}
                        disabled={deletingId === question.questionId}
                      >
                        {deletingId === question.questionId ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className="bi bi-trash"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherLessonPracticeQuestionList;