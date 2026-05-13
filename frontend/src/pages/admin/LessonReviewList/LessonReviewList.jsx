import { useNavigate, useParams } from "react-router-dom";
import useCourseLessons from "../../../hooks/useCourseLessons";
import LessonListHeader from "../../../compenents/lesson-list/LessonListHeader";
import LessonStatsCards from "../../../compenents/lesson-list/LessonStatsCards";
import LessonFilterBox from "../../../compenents/lesson-list/LessonFilterBox";
import LessonTable from "../../../compenents/lesson-list/LessonTable";
import AdminLessonReviewActions from "../../../compenents/lesson-list/AdminLessonReviewActions";
import "./LessonReviewList.css";

function LessonReviewList() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Tải danh sách bài học của khóa học qua custom hook
  const {
    keyword, setKeyword,
    status, setStatus,
    course, lessons, allLessons,
    loading, error,
    handleSearch, handleResetFilter,
  } = useCourseLessons({
    courseId,
    endpointBuilder: (id, queryString) =>
      queryString
        ? `http://localhost:8080/lesson/${id}/teacher?${queryString}`
        : `http://localhost:8080/lesson/${id}/teacher`,
  });

  const getStatusBadge = (statusValue) => {
    const map = {
      Published: "badge rounded-pill text-bg-success",
      Draft: "badge rounded-pill text-bg-secondary",
      Hidden: "badge rounded-pill text-bg-danger",
    };
    return map[statusValue] || "badge rounded-pill text-bg-light";
  };

  return (
    <div className="lesson-review-list-page">
      <LessonListHeader
        title="Review danh sách bài học"
        description="Admin kiểm tra danh sách lesson thuộc khóa học trước khi duyệt."
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

      {/* Bảng danh sách bài học với các nút điều hướng review */}
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

export default LessonReviewList;
