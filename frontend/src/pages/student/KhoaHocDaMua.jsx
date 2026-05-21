import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../courselist/DSKhoaHoc.css";
import { getFileUrl } from "../../utils/fileurl.js";
import { getPurchasedCourses } from "../../api/courseApi.js";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { studentHome, studentProfile } from "../../utils/breadcrumbPaths";

function KhoaHocDaMua() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/dang-nhap");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getPurchasedCourses();
      setCourses(res.data || []);
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

                <button
                  className="detail-btn"
                  onClick={() => handleViewDetail(course.courseId)}
                >
                  Vào học
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default KhoaHocDaMua;
