import { useNavigate, useParams } from "react-router-dom";
import "./TeacherLessonList.css";
import LessonListHeader from "../../compenents/lesson-list/LessonListHeader";
import LessonStatsCards from "../../compenents/lesson-list/LessonStatsCards";
import LessonFilterBox from "../../compenents/lesson-list/LessonFilterBox";
import LessonTable from "../../compenents/lesson-list/LessonTable";
import TeacherLessonActions from "../../compenents/lesson-list/TeacherLessonActions";
import useCourseLessons from "../../hooks/useCourseLessons";


function TeacherLessonList() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const API_BASE = "http://localhost:8080";

  const {
    keyword,
    setKeyword,
    status,
    setStatus,
    course,
    lessons,
    setLessons,
    allLessons,
    setAllLessons,
    loading,
    error,
    handleSearch,
    handleResetFilter,
  } = useCourseLessons({
    courseId,
    endpointBuilder: (courseId, queryString) =>
      queryString
        ? `${API_BASE}/lesson/${courseId}/teacher?${queryString}`
        : `${API_BASE}/lesson/${courseId}/teacher`,
  });

  const getStatusBadge = (statusValue) => {
    if (statusValue === "Published") return "badge rounded-pill text-bg-success";
    if (statusValue === "Draft") return "badge rounded-pill text-bg-secondary";
    if (statusValue === "Hidden") return "badge rounded-pill text-bg-danger";
    return "badge rounded-pill text-bg-light";
  };

  const handleViewDetail = (lessonId) => {
    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleEdit = (lessonId) => {
    navigate(`/teacher/courses/${courseId}/lessons/${lessonId}/edit`);
  };

  const handleDelete = async (lessonId) => {
    const ok = window.confirm("Bạn có chắc muốn xóa bài học này không?");
    if (!ok) return;

    try {
      /*
        Gợi ý API:
        DELETE /teacher/courses/{courseId}/lessons/{lessonId}
        hoặc PUT status Hidden
      */

      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.lessonId === lessonId
            ? { ...lesson, status: "Hidden" }
            : lesson
        )
      );

      setAllLessons((prev) =>
        prev.map((lesson) =>
          lesson.lessonId === lessonId
            ? { ...lesson, status: "Hidden" }
            : lesson
        )
      );

      alert("Xóa bài học thành công");
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống");
    }
  };

  return (
    <div className="teacher-lesson-page">
      <LessonListHeader
        title="Danh sách bài học của khóa học"
        description="Quản lý các bài học thuộc khóa học, theo dõi trạng thái và cập nhật nội dung lesson."
        course={course}
        onBack={() => navigate(`/teacher/courses/${courseId}`)}
        rightActions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              navigate(`/teacher/courses/${courseId}/lessons/create`)
            }
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm bài học
          </button>
        }
      />

      <LessonStatsCards allLessons={allLessons} />

      <LessonFilterBox
        keyword={keyword}
        setKeyword={setKeyword}
        status={status}
        setStatus={setStatus}
        onSearch={handleSearch}
        onReset={handleResetFilter}
      />

      <LessonTable
        lessons={lessons}
        allLessons={allLessons}
        loading={loading}
        error={error}
        getStatusBadge={getStatusBadge}
        renderActions={(lesson) => (
          <TeacherLessonActions
            lesson={lesson}
            onView={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      />
    </div>
  );
}

export default TeacherLessonList;