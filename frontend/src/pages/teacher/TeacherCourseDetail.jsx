import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherCourseDetail.css";
import CourseDetailHero from "../../compenents/course-detail/CourseDetailHero";
import TeacherCourseActions from "../../compenents/course-detail/TeacherCourseActions";
import CourseMetricCards from "../../compenents/course-detail/CourseMetricCards";
import CourseDetailTabs from "../../compenents/course-detail/CourseDetailTabs";
import CourseOverviewPanel from "../../compenents/course-detail/CourseOverviewPanel";
import TeacherCourseApprovalPanel from "../../compenents/course-detail/TeacherCourseApprovalPanel";


function TeacherCourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      setError("");

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
    } finally {
      setLoading(false);
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

  const getApprovalMessage = () => {
    if (course.status === "Draft") {
      return {
        className: "alert alert-secondary",
        icon: "bi-pencil-square",
        title: "Khóa học đang ở bản nháp",
        text: "Khóa học chưa được gửi cho admin duyệt.",
      };
    }

    if (course.status === "Pending") {
      return {
        className: "alert alert-warning",
        icon: "bi-hourglass-split",
        title: "Khóa học đang chờ admin duyệt",
        text: "Vui lòng chờ admin kiểm tra nội dung và phản hồi.",
      };
    }

    if (course.status === "Published") {
      return {
        className: "alert alert-success",
        icon: "bi-check-circle",
        title: "Khóa học đã được duyệt",
        text: "Khóa học đã được admin duyệt.",
      };
    }

    if (course.status === "Rejected") {
      return {
        className: "alert alert-danger",
        icon: "bi-x-circle",
        title: "Khóa học đã bị từ chối",
        text: "Vui lòng xem lý do từ chối, chỉnh sửa và gửi duyệt lại.",
      };
    }

    return {
      className: "alert alert-light border",
      icon: "bi-info-circle",
      title: "Trạng thái khóa học",
      text: "Không xác định trạng thái.",
    };
  };

  const handleSubmitApproval = async () => {
    const ok = window.confirm("Bạn có chắc muốn gửi khóa học này cho admin duyệt?");
    if (!ok) return;

    try {
      setSubmittingApproval(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/khoa-hoc/${courseId}/gui-duyet`, {
        method: "PUT",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        alert("Gửi duyệt thất bại");
        return;
      }

      alert("Đã gửi khóa học chờ duyệt");
      loadCourseDetail();
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleDeleteCourse = async () => {
    const ok = window.confirm("Bạn có chắc muốn xóa khóa học này không?");
    if (!ok) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/khoa-hoc/${courseId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        alert("Xóa khóa học thất bại");
        return;
      }

      alert("Đã xóa khóa học");
      navigate("/teacher/courses");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!course) return <div className="alert alert-warning">Không tìm thấy khóa học.</div>;

  return (
    <div className="course-detail-page">
      <div className="detail-page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
            Quay lại
          </button>

          <h2>Xem chi tiết khóa học</h2>
          <p>Theo dõi thông tin khóa học và trạng thái duyệt.</p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate(`/teacher/courses/${course.courseId}/edit`)}
          >
            <i className="bi bi-pencil-square me-1"></i>
            Cập nhật
          </button>

          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(`/teacher/courses/${course.courseId}/lessons/create`)
            }
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm lesson
          </button>
        </div>
      </div>

      <CourseDetailHero
        course={course}
        getStatusBadge={getStatusBadge}
        formatPrice={formatPrice}
        actions={
          <TeacherCourseActions
            course={course}
            navigate={navigate}
            onSubmitApproval={handleSubmitApproval}
            onDeleteCourse={handleDeleteCourse}
            submittingApproval={submittingApproval}
            deleting={deleting}
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
        basePath="/teacher/courses"
      />

      {activeTab === "overview" && (
        <CourseOverviewPanel
          course={course}
          getStatusBadge={getStatusBadge}
          showEditButton={true}
          onEdit={() => navigate(`/teacher/courses/${course.courseId}/edit`)}
        />
      )}

      {activeTab === "approval" && (
        <TeacherCourseApprovalPanel
          course={course}
          getStatusBadge={getStatusBadge}
          approvalMessage={getApprovalMessage()}
          onSubmitApproval={handleSubmitApproval}
          submittingApproval={submittingApproval}
        />
      )}
    </div>
  );
}

export default TeacherCourseDetail;