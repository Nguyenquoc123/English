import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";

function LessonListHeader({
  title,
  description,
  course,
  breadcrumbItems,
  rightActions,
}) {
  return (
    <div className="lesson-page-heading">
      <div>
        {breadcrumbItems?.length > 0 && (
          <CourseBreadcrumb items={breadcrumbItems} />
        )}

        <h2>{title}</h2>

        <p>{description}</p>

        {course && (
          <div className="course-name-box">
            <i className="bi bi-journal-bookmark"></i>
            <span>{course.title}</span>
          </div>
        )}
      </div>

      {rightActions}
    </div>
  );
}

export default LessonListHeader;
