import StudentExamListSection from "./components/StudentExamListSection";
import "./StudentExamListPage.css";

function StudentExamListPage() {
  return (
    <div className="student-exam-page">
      <div className="student-exam-container">
        <div className="student-exam-heading">
          <span className="exam-page-tag">Tất cả bài thi</span>
          <h2>Danh sách bài thi</h2>
          <p>
            Theo dõi các kỳ thi đang mở, xem chi tiết và bắt đầu làm bài khi đủ điều kiện.
          </p>
        </div>

        <StudentExamListSection />
      </div>
    </div>
  );
}

export default StudentExamListPage;