import Navbar from "../Navbar/Navbar";
import AppBreadcrumbBar from "../AppBreadcrumbBar/AppBreadcrumbBar";
import { BreadcrumbSuppressInline } from "../../../context/BreadcrumbContext";

/** Menu + breadcrumb dính trên cùng; dùng cho trang chủ, khóa học và các trang học viên. */
export default function AppShell({ children, showNavbar = true }) {
  return (
    <>
      {showNavbar && (
        <div className="layout-sticky-top layout-sticky-top--public">
          <Navbar />
          <AppBreadcrumbBar variant="embedded" />
        </div>
      )}
      <BreadcrumbSuppressInline>{children}</BreadcrumbSuppressInline>
    </>
  );
}
