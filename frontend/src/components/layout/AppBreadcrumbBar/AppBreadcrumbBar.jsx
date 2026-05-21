import { useLocation, useParams } from "react-router-dom";
import CourseBreadcrumb from "../../CourseBreadcrumb/CourseBreadcrumb";
import { getBreadcrumbFromRoute } from "../../../utils/getBreadcrumbFromRoute";
import "./AppBreadcrumbBar.css";

export default function AppBreadcrumbBar({ variant = "navbar" }) {
  const { pathname } = useLocation();
  const params = useParams();
  const items = getBreadcrumbFromRoute(pathname, params);

  if (!items.length) return null;

  return (
    <div
      className={`app-breadcrumb-bar app-breadcrumb-bar--${variant}`}
      role="navigation"
      aria-label="Đường dẫn trang"
    >
      <div className="app-breadcrumb-bar__inner">
        <CourseBreadcrumb items={items} global />
      </div>
    </div>
  );
}
