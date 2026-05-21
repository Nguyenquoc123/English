import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useBreadcrumbContext } from "../../context/BreadcrumbContext";

/**
 * @param {{ items: { label: string, to?: string }[] }} props
 * Mục cuối hiển thị <strong> (trang hiện tại). Các mục trước có `to` thì là Link.
 */
export default function CourseBreadcrumb({ items = [], global = false }) {
  const { hideInline } = useBreadcrumbContext();
  if (!global && hideInline) return null;
  if (!items.length) return null;

  return (
    <nav className="course-breadcrumb" aria-label="Đường dẫn">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <i className="bi bi-chevron-right" aria-hidden="true" />
            )}
            {isLast ? (
              <strong>{item.label}</strong>
            ) : item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
