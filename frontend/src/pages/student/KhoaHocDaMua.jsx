import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../courselist/DSKhoaHoc.css";
import { getFileUrl } from "../../utils/fileurl.js";
import {
  getMyRefundStatus,
  getPurchasedCourses,
  requestCourseRefund,
} from "../../api/courseApi.js";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import RefundRequestModal from "../../components/RefundRequestModal/RefundRequestModal.jsx";
import { studentHome, studentProfile } from "../../utils/breadcrumbPaths";

function KhoaHocDaMua() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [refundMap, setRefundMap] = useState({});
  const [refundingCourseId, setRefundingCourseId] = useState(null);
  const [refundModalCourse, setRefundModalCourse] = useState(null);
  const [refundError, setRefundError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const token =
      localStorage.getItem("english_token") || localStorage.getItem("token");
    if (!token) {
      navigate("/dang-nhap");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const [coursesRes, refundRes] = await Promise.all([
        getPurchasedCourses(),
        getMyRefundStatus(),
      ]);
      setCourses(coursesRes.data?.content || coursesRes.data || []);
      const statuses = refundRes.data || [];
      const nextMap = {};
      statuses.forEach((item) => {
        nextMap[item.courseId] = item;
      });
      setRefundMap(nextMap);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/dang-nhap");
        return;
      }
      setError(
        err.response?.data?.message || "Không thể tải danh sách khóa học đã mua"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) {
      return "Miễn phí";
    }
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
  };

  const handleViewDetail = (courseId) => {
    navigate(`/khoa-hoc/${courseId}`);
  };

  const getRefundMeta = (courseId) => {
    const status = (refundMap[courseId]?.status || "").toUpperCase();
    if (status === "REFUND_REQUESTED") {
      return { label: "Đang chờ duyệt hoàn tiền", badge: "badge text-bg-warning" };
    }
    if (status === "REFUNDED") {
      return { label: "Đã hoàn tiền", badge: "badge text-bg-success" };
    }
    if (status === "REFUND_REJECTED") {
      return { label: "Yêu cầu hoàn tiền bị từ chối", badge: "badge text-bg-danger" };
    }
    return null;
  };

  const openRefundModal = (course) => {
    setRefundError("");
    setRefundModalCourse({
      courseId: course.courseId,
      title: course.title || "Khóa học",
    });
  };

  const closeRefundModal = () => {
    if (refundingCourseId) return;
    setRefundModalCourse(null);
    setRefundError("");
  };

  const handleRefundSubmit = async (reason) => {
    if (!refundModalCourse) return;

    try {
      setRefundingCourseId(refundModalCourse.courseId);
      setRefundError("");
      await requestCourseRefund(refundModalCourse.courseId, reason);
      setRefundModalCourse(null);
      await loadCourses();
      alert("Đã gửi yêu cầu hoàn tiền. Admin sẽ xem xét sớm.");
    } catch (err) {
      setRefundError(
        err.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền"
      );
    } finally {
      setRefundingCourseId(null);
    }
  };

  return (
    <div className="course-page">
      <main className="course-container">
        <CourseBreadcrumb
          items={[studentHome, studentProfile, { label: "Khóa học đã mua" }]}
        />

        <section className="filter-box">
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Khóa học đã mua</h1>
          <p className="status-text" style={{ marginTop: 0 }}>
            Các khóa học bạn đã đăng ký và có quyền truy cập nội dung.
          </p>
        </section>

        {loading && <p className="status-text">Đang tải khóa học...</p>}

        {error && <p className="error-text">{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <p className="status-text">
            Bạn chưa mua khóa học nào.{" "}
            <button
              type="button"
              className="detail-btn"
              style={{ marginTop: "1rem" }}
              onClick={() => navigate("/danh-sach-khoa-hoc")}
            >
              Khám phá khóa học
            </button>
          </p>
        )}

        <section className="course-grid">
          {courses.map((course) => (
            <div className="course-card" key={course.courseId}>
              <div className="course-image">
                <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} />
                <div className="course-badges">
                  {course.levelName && <span>{course.levelName}</span>}
                  {course.courseType === "FREE" ? (
                    <span className="free-badge">FREE</span>
                  ) : (
                    <span className="paid-badge">PAID</span>
                  )}
                </div>
              </div>

              <div className="course-body">
                <div className="course-card-content">
                  <div className="teacher-info">
                    <span>{course.teacherName}</span>
                  </div>

                  <h2>{course.title}</h2>

                  <p className="course-description">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="course-price-row">
                    <span
                      className={
                        !course.price || course.price === 0
                          ? "course-price free"
                          : "course-price"
                      }
                    >
                      {formatPrice(course.price)}
                    </span>
                  </div>

                  <div className="course-card-status">
                    {getRefundMeta(course.courseId) && (
                      <span className={getRefundMeta(course.courseId).badge}>
                        {getRefundMeta(course.courseId).label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="course-card-actions">
                  <button
                    className="detail-btn"
                    onClick={() => handleViewDetail(course.courseId)}
                  >
                    Vào học
                  </button>

                  {refundMap[course.courseId]?.canRequestRefund && (
                    <button
                      type="button"
                      className="detail-btn course-refund-btn"
                      onClick={() => openRefundModal(course)}
                      disabled={Boolean(refundingCourseId)}
                    >
                      Yêu cầu hoàn tiền
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <RefundRequestModal
        show={Boolean(refundModalCourse)}
        courseTitle={refundModalCourse?.title}
        submitting={Boolean(refundingCourseId)}
        error={refundError}
        onClose={closeRefundModal}
        onSubmit={handleRefundSubmit}
      />
    </div>
  );
}

export default KhoaHocDaMua;
