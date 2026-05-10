import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../teacher/TeacherCourseDetail.css";
import CourseDetailHero from "../../compenents/course-detail/CourseDetailHero";
import AdminCourseReviewActions from "../../compenents/course-detail/AdminCourseReviewActions";
import CourseMetricCards from "../../compenents/course-detail/CourseMetricCards";
import CourseDetailTabs from "../../compenents/course-detail/CourseDetailTabs";
import CourseOverviewPanel from "../../compenents/course-detail/CourseOverviewPanel";
import AdminCourseReviewPanel from "../../compenents/course-detail/AdminCourseReviewPanel";


function AdminCourseReviewDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/khoa-hoc/chi-tiet-khoa-hoc-teacher/${courseId}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Không thể tải chi tiết khóa học");
        return;
      }

      setCourse(data.result || data.data || data);
    } catch (err) {
      console.error(err);
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
    if (status === "Published") return "badge rounded-pill text-bg-success";
    if (status === "Pending") return "badge rounded-pill text-bg-warning";
    if (status === "Rejected") return "badge rounded-pill text-bg-danger";
    if (status === "Draft") return "badge rounded-pill text-bg-secondary";
    if (status === "Hidden") return "badge rounded-pill text-bg-dark";
    return "badge rounded-pill text-bg-light";
  };

  const handleApprove = async () => {
    const ok = window.confirm("Duyệt khóa học này?");
    if (!ok) return;

    try {
      setProcessing(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/khoa-hoc/${courseId}/duyet`,
        {
          method: "PUT",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        alert("Duyệt khóa học thất bại");
        return;
      }

      alert("Đã duyệt khóa học");
      loadCourseDetail();
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (rejectReason) => {
    if (!rejectReason || !rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setProcessing(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/khoa-hoc/${courseId}/tu-choi`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            rejectReason: rejectReason.trim(),
          }),
        }
      );

      if (!response.ok) {
        alert("Từ chối khóa học thất bại");
        return;
      }

      alert("Đã từ chối khóa học");
      loadCourseDetail();
    } finally {
      setProcessing(false);
    }
  };

  const handleHide = async () => {
    alert("Gọi API ẩn khóa học ở đây");
  };

  const handleDelete = async () => {
    alert("Gọi API xóa mềm khóa học ở đây");
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!course) return <div className="text-center py-5">Đang tải...</div>;

  return (
    <div className="course-detail-page">
      <div className="detail-page-header">
        <div>
          <button
            className="back-link"
            onClick={() => navigate("/admin/courses")}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại danh sách khóa học
          </button>

          <h2>Review khóa học</h2>
          <p>Admin kiểm tra nội dung khóa học trước khi duyệt hoặc từ chối.</p>
        </div>
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

export default AdminCourseReviewDetail;