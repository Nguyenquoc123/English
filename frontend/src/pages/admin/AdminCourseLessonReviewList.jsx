import { useNavigate, useParams } from "react-router-dom";
import "../teacher/TeacherLessonList.css";
import useCourseLessons from "../../hooks/useCourseLessons";
import LessonListHeader from "../../compenents/lesson-list/LessonListHeader";
import LessonStatsCards from "../../compenents/lesson-list/LessonStatsCards";
import LessonFilterBox from "../../compenents/lesson-list/LessonFilterBox";
import LessonTable from "../../compenents/lesson-list/LessonTable";
import AdminLessonReviewActions from "../../compenents/lesson-list/AdminLessonReviewActions";



function AdminCourseLessonReviewList() {
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
    allLessons,
    loading,
    error,
    handleSearch,
    handleResetFilter,
  } = useCourseLessons({
    courseId,
    endpointBuilder: (courseId, queryString) =>
      queryString
        ? `${API_BASE}/lesson/${courseId}/teacher?${queryString}`
        : `${API_BASE}/lesson/${courseId}/teacher`
  });

  const getStatusBadge = (statusValue) => {
    if (statusValue === "Published") return "badge rounded-pill text-bg-success";
    if (statusValue === "Draft") return "badge rounded-pill text-bg-secondary";
    if (statusValue === "Hidden") return "badge rounded-pill text-bg-danger";
    return "badge rounded-pill text-bg-light";
  };

  return (
    <div className="teacher-lesson-page">
      <LessonListHeader
        title="Review danh sách bài học"
        description="Admin kiểm tra danh sách lesson thuộc khóa học trước khi duyệt khóa học."
        course={course}
        onBack={() => navigate(`/admin/courses/${courseId}/review`)}
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
          <AdminLessonReviewActions
            lesson={lesson}
            onView={(lessonId) =>
              navigate(`/admin/courses/${courseId}/lessons/${lessonId}/review`)
            }
            onViewVideos={(lessonId) =>
              navigate(`/admin/courses/${courseId}/lessons/${lessonId}/videos`)
            }
            onViewGrammar={(lessonId) =>
              navigate(`/admin/courses/${courseId}/lessons/${lessonId}/grammars`)
            }
            onViewPractice={(lessonId) =>
              navigate(`/admin/courses/${courseId}/lessons/${lessonId}/practice`)
            }
          />
        )}
      />
    </div>
  );
}

export default AdminCourseLessonReviewList;