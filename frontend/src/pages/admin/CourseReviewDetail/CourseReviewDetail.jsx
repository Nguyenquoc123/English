import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseDetailHero from "../../../compenents/course-detail/CourseDetailHero";
import AdminCourseReviewActions from "../../../compenents/course-detail/AdminCourseReviewActions";
import CourseMetricCards from "../../../compenents/course-detail/CourseMetricCards";
import CourseDetailTabs from "../../../compenents/course-detail/CourseDetailTabs";
import CourseOverviewPanel from "../../../compenents/course-detail/CourseOverviewPanel";
import AdminCourseReviewPanel from "../../../compenents/course-detail/AdminCourseReviewPanel";
import "./CourseReviewDetail.css";

function CourseReviewDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  // Tải chi tiết khóa học theo courseId
  const loadCourseDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/khoa-hoc/chi-tiet-khoa-hoc-teacher/${courseId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Không thể tải chi tiết khóa học");
        return;
      }
      setCourse(data.result || data.data || data);
    } catch {
      setError("Lỗi kết nối server");
    }
  };

  const formatPrice = (price) => {
    if (!price || Number(price) === 0) return "0 VNĐ";
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatNumber = (number) => {
    if (!number) return "0";
    return Number(number).toLocaleString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const map = {
      Published: "badge rounded-pill text-bg-success",
      Pending: "badge rounded-pill text-bg-warning",
      Rejected: "badge rounded-pill text-bg-danger",
      Draft: "badge rounded-pill text-bg-secondary",
      Hidden: "badge rounded-pill text-bg-dark",
    };
    return map[status] || "badge rounded-pill text-bg-light";
  };

  // Duyệt khóa học
  const handleApprove = async () => {
    if (!window.confirm("Duyệt khóa học này?")) return;
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/khoa-hoc/${courseId}/duyet`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) { alert("Duyệt khóa học thất bại"); return; }
      alert("Đã duyệt khóa học");
      loadCourseDetail();
    } finally {
      setProcessing(false);
    }
  };

  // Từ chối khóa học với lý do
  const handleReject = async (rejectReason) => {
    if (!rejectReason?.trim()) { alert("Vui lòng nhập lý do từ chối"); return; }
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/khoa-hoc/${courseId}/tu-choi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rejectReason: rejectReason.trim() }),
      });
      if (!response.ok) { alert("Từ chối khóa học thất bại"); return; }
      alert("Đã từ chối khóa học");
      loadCourseDetail();
    } finally {
      setProcessing(false);
    }
  };

  const handleHide = async () => alert("Gọi API ẩn khóa học ở đây");
  const handleDelete = async () => alert("Gọi API xóa mềm khóa học ở đây");

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle"></i>
        <span>{error}</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="course-review-detail-page">
      {/* Header quay lại */}
      <div className="mb-4">
        <button
          className="btn btn-light btn-sm mb-2"
          onClick={() => navigate("/admin/courses")}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Quay lại danh sách khóa học
        </button>
        <h4 className="fw-bold mb-1" style={{ color: "#0f3c9c" }}>Review khóa học</h4>
        <p className="text-muted mb-0">
          Admin kiểm tra nội dung khóa học trước khi duyệt hoặc từ chối.
        </p>
      </div>

      <CourseDetailHero
        course={course}
        getStatusBadge={getStatusBadge}
        formatPrice={formatPrice}
        showRevenue={true}
        actions={
          <AdminCourseReviewActions
            course={course}
            onApprove={handleApprove}
            onReject={() => setActiveTab("approval")}
            onHide={handleHide}
            onDelete={handleDelete}
            processing={processing}
          />
        }
      />

      <CourseMetricCards
        course={course}
        formatNumber={formatNumber}
        formatPrice={formatPrice}
      />

      <CourseDetailTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courseId={course.courseId}
        navigate={navigate}
        basePath="/admin/courses"
        showApprovalTab={true}
        showRevenueTab={false}
      />

      {activeTab === "overview" && (
        <CourseOverviewPanel
          course={course}
          getStatusBadge={getStatusBadge}
          showEditButton={false}
        />
      )}

      {activeTab === "approval" && (
        <AdminCourseReviewPanel
          course={course}
          getStatusBadge={getStatusBadge}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processing}
        />
      )}
    </div>
  );
}

export default CourseReviewDetail;
