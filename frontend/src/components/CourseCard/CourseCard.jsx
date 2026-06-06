import { Link } from "react-router-dom";
import "./CourseCard.css";
import { getFileUrl } from "../../utils/fileurl";

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

  const teacherAvatar = course.teacherAvatarUrl
    ? getFileUrl(course.teacherAvatarUrl)
    : "/default-avatar.png";

  return (
    <Link to={`/khoa-hoc/${course.courseId}`} className="course-card">
      <div className="course-card-thumb">
        <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} />

        <span
          className="course-card-badge"
          style={{ background: level.bg, color: level.color }}
        >
          {level.label}
        </span>
      </div>

      <div className="course-card-body">
        <h3 className="course-card-title">{course.title}</h3>

        <div className="course-card-teacher">
          <img
            src={getFileUrl(course.avatarUrl)}
            alt={course.teacherName || "Giáo viên"}
            className="course-card-teacher-avatar"
          />
          <span>{course.teacherName}</span>
        </div>

        <p className="course-card-desc">{course.shortDescription}</p>

        <div className="course-card-footer">
          {course.courseType === "Free" || course.courseType === "FREE" ? (
            <span className="course-card-free">Miễn phí</span>
          ) : (
            <span className="course-card-price">
              {Number(course.price).toLocaleString("vi-VN")} đ
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}