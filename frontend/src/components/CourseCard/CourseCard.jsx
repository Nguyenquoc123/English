import { Link } from "react-router-dom";
import "./CourseCard.css";

const LEVEL = {
  1: { label: "Sơ cấp", bg: "#dbeafe", color: "#1d4ed8" },
  2: { label: "Trung cấp", bg: "#fef3c7", color: "#92400e" },
  3: { label: "Cao cấp", bg: "#ede9fe", color: "#5b21b6" },
};

export default function CourseCard({ course }) {
  const level = LEVEL[course.levelId] ?? {
    label: course.levelName,
    bg: "#f3f4f6",
    color: "#374151",
  };

  return (
    <Link to={`/courses/${course.courseId}`} className="course-card">
      <div className="course-card-thumb">
        <img
          src={course.thumbnailUrl || "/placeholder-course.jpg"}
          alt={course.title}
        />
        <span
          className="course-card-badge"
          style={{ background: level.bg, color: level.color }}
        >
          {level.label}
        </span>
      </div>

      <div className="course-card-body">
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-teacher">👨‍🏫 {course.teacherName}</p>
        <p className="course-card-desc">{course.description}</p>

        <div className="course-card-footer">
          {course.courseType === "Free" ? (
            <span className="course-card-free">Miễn phí</span>
          ) : (
            <span className="course-card-price">
              {Number(course.price).toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
