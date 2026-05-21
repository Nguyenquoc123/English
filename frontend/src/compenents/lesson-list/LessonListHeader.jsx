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

      </div>

    </div>
  );
}

export default LessonListHeader;
