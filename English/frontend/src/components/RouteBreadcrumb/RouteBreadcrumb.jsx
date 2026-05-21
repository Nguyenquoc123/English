import { useLocation, useParams } from "react-router-dom";
import CourseBreadcrumb from "../CourseBreadcrumb/CourseBreadcrumb";
import { getBreadcrumbFromRoute } from "../../utils/getBreadcrumbFromRoute";

export default function RouteBreadcrumb() {
  const { pathname } = useLocation();
  const params = useParams();
  const items = getBreadcrumbFromRoute(pathname, params);

  if (!items.length) return null;

  return <CourseBreadcrumb items={items} />;
}
