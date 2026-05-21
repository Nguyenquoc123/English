import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../courselist/DSKhoaHoc.css";
import { getFileUrl } from "../../utils/fileurl.js";
import Page from "../../compenents/phantrang/page.jsx";

function DSKhoaHocDaMua() {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080";

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

  const getToken = () => {
    return localStorage.getItem("english_token") || localStorage.getItem("token");
  };

  useEffect(() => {
    loadLevels();
    loadPurchasedCourses(0);
  }, []);

  const loadLevels = async () => {
    try {
      setLevelLoading(true);

      const response = await fetch(`${API_BASE}/level/all-level`);
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

  const loadPurchasedCourses = async (pageValue = page) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

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
        `${API_BASE}/khoa-hoc/danh-sach-khoa-hoc-da-mua?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const result = data?.result || data?.data || data;

      if (!response.ok) {
        setError(result?.message || "Không thể tải danh sách khóa học đã mua");
        return;
      }

      /*
        Nếu backend trả Page của Spring:
        {
          content: [],
          number: 0,
          totalPages: 3
        }

        Nếu backend bọc trong result/data thì đoạn result bên trên vẫn xử lý được.
      */
      setCourses(result?.content || []);
      setPage(result?.number || 0);
      setTotalPages(result?.totalPages || 0);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadPurchasedCourses(newPage);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadPurchasedCourses(0);
  };

  

  const formatNumber = (number) => {
    if (!number) return "0";
    return Number(number).toLocaleString("vi-VN");
  };

  const handleStudyCourse = (courseId) => {
    navigate(`/khoa-hoc/${courseId}`);
  };

  return (
    <div className="course-page">
      <main className="course-container">
        <section className="purchased-course-header">
          <div>
            <span className="purchased-badge">
              <i className="bi bi-bag-check me-2"></i>
              Khóa học của tôi
            </span>

            
          </div>
        </section>

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

            
          </form>
        </section>

        {loading && <p className="status-text">Đang tải khóa học đã mua...</p>}

        {error && <p className="error-text">{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <div className="purchased-empty-box">
            
            <h5>Không tìm thấy khóa học nào!</h5>
            <p>Hãy khám phá thêm khóa học để bắt đầu học tiếng Anh nhé.</p>

            <button
              type="button"
              className="detail-btn"
              onClick={() => navigate("/danh-sach-khoa-hoc")}
            >
              Khám phá khóa học
            </button>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <section className="course-grid">
            {courses.map((course) => (
              <div className="course-card" key={course.courseId}>
                <div className="course-image">
                  <img
                    src={getFileUrl(course.thumbnailUrl)}
                    alt={course.title || "Khóa học"}
                  />
                </div>

                <div className="course-body">
                  <div className="teacher-info">
                    <img
                      src={getFileUrl(course.avatarUrl)}
                      alt={course.teacherName || "Giáo viên"}
                    />
                    <span>{course.teacherName || "Chưa có giáo viên"}</span>
                  </div>

                  <div className="course-tags">
                    <span className="level-tag">
                      {course.levelName || "Chưa có cấp độ"}
                    </span>

                    
                  </div>

                  <h2 title={course.title}>
                    {course.title || "Chưa có tiêu đề"}
                  </h2>

                  <p
                    className="course-description"
                    title={course.shortDescription}
                  >
                    {course.shortDescription || "Chưa có mô tả ngắn."}
                  </p>

                  

                  <button
                    type="button"
                    className="detail-btn"
                    onClick={() => handleStudyCourse(course.courseId)}
                  >
                    <i className="bi bi-play-circle me-1"></i>
                    Vào học
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

export default DSKhoaHocDaMua;