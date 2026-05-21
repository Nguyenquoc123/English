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
    handleSearch
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

  const handleViewDetail = (item) => {
    if (item.type === "LESSON") {
      navigate(`/teacher/courses/${courseId}/lessons/${item.id}`);
      return;
    }

    if (item.type === "EXAM") {
      navigate(`/teacher/courses/${courseId}/exams/${item.id}`);
      return;
    }
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
      {/* <LessonListHeader
        title="Danh sách bài học của khóa học"
        description="Quản lý các bài học thuộc khóa học, theo dõi trạng thái và cập nhật nội dung lesson."
        course={course}
        onBack={() => navigate(`/teacher/courses/${courseId}`)}
        
      /> */}

      {/* <LessonStatsCards allLessons={allLessons} /> */}

      <LessonFilterBox
        courseId={courseId}
        keyword={keyword}
        setKeyword={setKeyword}
        status={status}
        setStatus={setStatus}
        onSearch={handleSearch}
      />

      <LessonTable
        lessons={lessons}
        loading={loading}
        error={error}
        getStatusBadge={getStatusBadge}
        renderActions={(item) => (
          <TeacherLessonActions
            item={item}
            onView={() => handleViewDetail(item)}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </div>
  );
}

export default TeacherLessonList;