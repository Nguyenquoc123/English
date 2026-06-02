import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../courselist/DSKhoaHoc.css";
import { getFileUrl } from "../../utils/fileurl.js";
import Page from "../../compenents/phantrang/page.jsx";
import { toast } from "react-toastify";

function DSKhoaHoc() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [levelId, setLevelId] = useState("");

  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);

  const [loading, setLoading] = useState(false);
  const [levelLoading, setLevelLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadLevels();
    loadCourses(0);
  }, []);

  const loadLevels = async () => {
    try {
      setLevelLoading(true);

      const response = await fetch("http://localhost:8080/level/all-level");
      const data = await response.json();

      if (!response.ok) {
        setLevels([]);
        return;
      }

      const result = data.result || data.data || data;
      setLevels(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setLevels([]);
    } finally {
      setLevelLoading(false);
    }
  };

  const loadCourses = async (pageValue = page) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (keyword.trim()) {
        params.append("keyword", keyword.trim());
      }

      if (levelId) {
        params.append("levelId", levelId);
      }

      params.append("page", pageValue);
      params.append("size", size);

      const response = await fetch(
        `http://localhost:8080/khoa-hoc/danh-sach-khoa-hoc-public?${params.toString()}`,
        {
          method: "GET",
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        // setError(data?.message || "Không thể tải danh sách khóa học");
        toast.error(data?.message || "Không thể tải danh sách khóa học")
        return;
      }

      setCourses(data.content || []);
      setPage(data.number || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
      // setError("Lỗi kết nối server.");
      toast.error("Lỗi kết nối server.")
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadCourses(newPage);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadCourses(0);
  };

  const handleReset = () => {
    setKeyword("");
    setLevelId("");
    setPage(0);

    setTimeout(() => {
      loadCourses(0);
    }, 0);
  };

  const formatPrice = (price) => {
    if (!price || Number(price) === 0) {
      return "Miễn phí";
    }

    return Number(price).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatNumber = (number) => {
    if (!number) return "0";
    return Number(number).toLocaleString("vi-VN");
  };

  const handleViewDetail = (courseId) => {
    navigate(`/khoa-hoc/${courseId}`);
  };

  return (
    <div className="course-page">
      <main className="course-container">
        <section className="filter-box">
          <form className="filter-form" onSubmit={handleSearch}>
            <div className="filter-group">
              <label>Từ khóa tìm kiếm</label>
              <input
                type="text"
                placeholder="Nhập tên khóa học cần tìm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Cấp độ</label>
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                disabled={levelLoading}
              >
                <option value="">
                  {levelLoading ? "Đang tải..." : "Tất cả cấp độ"}
                </option>

                {levels.map((level) => (
                  <option key={level.levelId} value={level.levelId}>
                    {level.levelName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="search-btn">
              <i className="bi bi-search me-1"></i>
              Tìm kiếm
            </button>

            <button type="button" className="reset-btn" onClick={handleReset}>
              Làm mới
            </button>
          </form>
        </section>

        {loading && <p className="status-text">Đang tải khóa học...</p>}

        {error && <p className="error-text">{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <p className="status-text">Không tìm thấy khóa học phù hợp.</p>
        )}

        {!loading && !error && courses.length > 0 && (
          <section className="course-grid">
            {courses.map((course) => (
              <div className="course-card" key={course.courseId}>
                <div className="course-image">
                  <img
                    src={getFileUrl(course.thumbnailUrl)}
                    alt={course.title}
                  />


                </div>

                <div className="course-body">
                  <div className="teacher-info">
                    <img src={getFileUrl(course.avatarUrl)} alt={course.teacherName || "Giáo viên"} />
                    <span>{course.teacherName || "Chưa có giáo viên"}</span>
                  </div>

                  <div className="course-tags">
                    <span className="level-tag">{course.levelName || "Chưa có cấp độ"}</span>

                    {course.accessType === "FREE" ||
                      course.courseType === "FREE" ||
                      Number(course.price) === 0 ? (
                      <span className="free-tag">FREE</span>
                    ) : (
                      <span className="paid-tag">PAID</span>
                    )}
                  </div>

                  <h2 title={course.title}>{course.title || "Chưa có tiêu đề"}</h2>

                  <p className="course-description" title={course.shortDescription}>
                    {course.shortDescription || "Chưa có mô tả ngắn."}
                  </p>

                  <div className="course-price-row">
                    <span
                      className={
                        Number(course.price) === 0 ? "course-price free" : "course-price"
                      }
                    >
                      {formatPrice(course.price)}
                    </span>

                    {/* <div className="course-meta">
                      <span>👥 {formatNumber(course.totalStudents)}</span>
                      <span>⭐ {course.rating || 0}</span>
                    </div> */}
                  </div>

                  <button
                    type="button"
                    className="detail-btn"
                    onClick={() => handleViewDetail(course.courseId)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {!loading && !error && courses.length > 0 && (
        <Page
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default DSKhoaHoc;
