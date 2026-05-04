import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCourses } from "../../../api/courseApi";
import CourseCard from "../../../components/CourseCard/CourseCard";
import "./FeaturedCourses.css";

export default function FeaturedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllCourses({ status: "APPROVED" })
      .then((res) => setCourses(res.data.slice(0, 8)))
      .catch(() => setError("Không thể tải khoá học. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="featured">
      <div className="featured-header">
        <h2 className="featured-title">🔥 Khoá học nổi bật</h2>
        <Link to="/courses" className="featured-view-all">
          Xem tất cả →
        </Link>
      </div>

      {loading && <p className="featured-message">Đang tải khoá học...</p>}
      {error && <p className="featured-message featured-error">{error}</p>}
      {!loading && !error && courses.length === 0 && (
        <p className="featured-message">Chưa có khoá học nào.</p>
      )}

      <div className="featured-grid">
        {courses.map((course) => (
          <CourseCard key={course.courseId} course={course} />
        ))}
      </div>
    </section>
  );
}
