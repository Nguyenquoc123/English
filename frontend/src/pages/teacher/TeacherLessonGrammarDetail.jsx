import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import {
  teacherCourses,
  teacherCourseDetail,
  teacherLessonDetail,
  teacherLessonGrammars,
} from "../../utils/breadcrumbPaths";

function TeacherLessonGrammarDetail() {
  const navigate = useNavigate();
  const { courseId, lessonId, grammarId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [grammar, setGrammar] = useState(null);

  useEffect(() => {
    loadGrammar();
  }, [grammarId]);

  const loadGrammar = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/grammar/${grammarId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    setGrammar(data.result || data.data || data);
  };

  if (!grammar) return <div className="text-center text-muted py-5">Đang tải ngữ pháp...</div>;

  return (
    <div className="teacher-lesson-detail-page">
      <CourseBreadcrumb
        items={[
          teacherCourses,
          teacherCourseDetail(courseId),
          teacherLessonDetail(courseId, lessonId),
          // teacherLessonGrammars(courseId, lessonId),
          { label: "Chi tiết ngữ pháp" },
        ]}
      />

      <div className="info-card">
        <h2>{grammar.title}</h2>

        <div
          className="course-description-html mt-4"
          dangerouslySetInnerHTML={{ __html: grammar.contentHtml }}
        ></div>
      </div>
    </div>
  );
}

export default TeacherLessonGrammarDetail;