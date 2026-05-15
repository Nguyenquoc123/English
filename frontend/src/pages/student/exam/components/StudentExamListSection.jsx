import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentExamFilters from "./StudentExamFilters";
import StudentExamCard from "./StudentExamCard";

function StudentExamListSection({ courseId = null, compact = false }) {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080";

  const [exams, setExams] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  useEffect(() => {
    loadExams();
  }, [courseId]);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const params = new URLSearchParams();

      if (keyword.trim()) {
        params.append("keyword", keyword.trim());
      }

      if (status) {
        params.append("status", status);
      }

      if (courseId) {
        params.append("courseId", courseId);
      }

      /*
        API gợi ý:
        GET /student/exams?keyword=&status=&courseId=

        Nếu hiển thị ở trang riêng thì courseId null.
        Nếu hiển thị trong chi tiết khóa học thì truyền courseId.
      */
      const response = await fetch(`${API_BASE}/exams/all-bai-thi?${params.toString()}`, {
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
        setError(result?.message || "Không thể tải danh sách bài thi");
        return;
      }

      setExams(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadExams();
  };

  const handleReset = () => {
    setKeyword("");
    setStatus("");

    setTimeout(() => {
      loadExams();
    }, 0);
  };

  const totalText = useMemo(() => {
    if (!exams.length) return "Không có bài thi";
    return `Hiển thị ${exams.length} bài thi`;
  }, [exams]);

  return (
    <section className={compact ? "student-exam-section compact" : "student-exam-section"}>
      <StudentExamFilters
        keyword={keyword}
        setKeyword={setKeyword}
        status={status}
        setStatus={setStatus}
        onSearch={handleSearch}
        onReset={handleReset}
        compact={compact}
      />

      <div className="exam-section-title-row">
        <div>
          <h4>Danh sách bài thi</h4>
          {!compact && <p>Chọn bài thi phù hợp để xem chi tiết hoặc bắt đầu làm bài.</p>}
        </div>

        <span>{totalText}</span>
      </div>

      {loading ? (
        <div className="student-exam-loading">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Đang tải danh sách bài thi...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : exams.length === 0 ? (
        <div className="student-exam-empty">
          <i className="bi bi-clipboard-x"></i>
          <h5>Chưa có bài thi</h5>
          <p>Không tìm thấy bài thi phù hợp với điều kiện lọc.</p>
        </div>
      ) : (
        <div className={compact ? "student-exam-grid compact" : "student-exam-grid"}>
          {exams.map((exam) => (
            <StudentExamCard
              key={exam.examId}
              exam={exam}
              courseId={exam.courseId || courseId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default StudentExamListSection;