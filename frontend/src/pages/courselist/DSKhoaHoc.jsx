import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../courselist/DSKhoaHoc.css";
import { getFileUrl } from "../../utils/fileurl.js"

function DSKhoaHoc() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [levelId, setLevelId] = useState("");

  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dữ liệu mẫu để test giao diện khi chưa có backend
  const sampleCourses = [
    {
      courseId: 1,
      title: "Tiếng Anh giao tiếp cơ bản",
      description:
        "Làm quen với các mẫu câu giao tiếp thông dụng trong cuộc sống hằng ngày.",
      price: 0,
      accessType: "FREE",
      thumbnailUrl: "/course-1.jpg",
      teacherName: "Nguyễn Thu Lan",
      teacherAvatar: "/avatar-1.jpg",
      levelName: "Sơ cấp",
      rating: 4.8,
      totalStudents: 1200,
    },
    {
      courseId: 2,
      title: "Ngữ pháp tiếng Anh nền tảng",
      description:
        "Hệ thống kiến thức ngữ pháp cơ bản kèm bài tập luyện tập chuyên sâu.",
      price: 199000,
      accessType: "PAID",
      thumbnailUrl: "/course-2.jpg",
      teacherName: "Trần Văn Minh",
      teacherAvatar: "/avatar-2.jpg",
      levelName: "Sơ cấp",
      rating: 4.9,
      totalStudents: 850,
    },
    {
      courseId: 3,
      title: "Luyện nghe tiếng Anh trung cấp",
      description:
        "Cải thiện kỹ năng nghe thông qua audio, hội thoại thực tế và bài tập tương tác.",
      price: 299000,
      accessType: "PAID",
      thumbnailUrl: "/course-3.jpg",
      teacherName: "Lê Hoàng Anh",
      teacherAvatar: "/avatar-3.jpg",
      levelName: "Trung cấp",
      rating: 4.7,
      totalStudents: 620,
    },
    {
      courseId: 4,
      title: "Từ vựng tiếng Anh theo chủ đề",
      description:
        "Học từ vựng theo chủ đề với flashcard và các bài ôn tập nhanh hiệu quả.",
      price: 0,
      accessType: "FREE",
      thumbnailUrl: "/course-4.jpg",
      teacherName: "Phạm Thu Hà",
      teacherAvatar: "/avatar-4.jpg",
      levelName: "Sơ cấp",
      rating: 4.9,
      totalStudents: 2100,
    },
    {
      courseId: 5,
      title: "Viết email tiếng Anh chuyên nghiệp",
      description:
        "Luyện viết email, đoạn văn ngắn và phản hồi trong môi trường công việc quốc tế.",
      price: 399000,
      accessType: "PAID",
      thumbnailUrl: "/course-5.jpg",
      teacherName: "Nguyễn Quốc Bảo",
      teacherAvatar: "/avatar-5.jpg",
      levelName: "Cao cấp",
      rating: 5.0,
      totalStudents: 430,
    },
    {
      courseId: 6,
      title: "Phát âm tiếng Anh cho người mới",
      description:
        "Rèn luyện phát âm cơ bản, trọng âm và ngữ điệu trong tiếng Anh chuẩn bản xứ.",
      price: 0,
      accessType: "FREE",
      thumbnailUrl: "/course-6.jpg",
      teacherName: "Vũ Minh Tâm",
      teacherAvatar: "/avatar-6.jpg",
      levelName: "Sơ cấp",
      rating: 4.8,
      totalStudents: 1500,
    },
  ];

  const sampleLevels = [
    {
      levelId: 1,
      levelName: "Sơ cấp",
    },
    {
      levelId: 2,
      levelName: "Trung cấp",
    },
    {
      levelId: 3,
      levelName: "Cao cấp",
    },
  ];

  useEffect(() => {
    // Load cấp độ và danh sách khóa học khi mở trang
    loadLevels();
    loadCourses();
  }, []);

  const loadLevels = async () => {
    try {
      // Nếu bạn đã có API levels thì mở đoạn này ra dùng

      const response = await fetch("http://localhost:8080/level/all-level");
      const data = await response.json();

      if (response.ok) {
        setLevels(data);
      }


      // setLevels(sampleLevels);
    } catch (err) {
      console.error(err);
      setLevels(sampleLevels);
    }
  };

  const loadCourses = async () => {
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

      const query = params.toString();

      const url = query
        ? `http://localhost:8080/khoa-hoc/danh-sach-khoa-hoc-public?${query}`
        : `http://localhost:8080/khoa-hoc/danh-sach-khoa-hoc-public`;

      const response = await fetch(url, {
        method: "GET",
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Không thể tải danh sách khóa học");
        return;
      }

      console.log(data);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCourses();
  };

  const formatPrice = (price) => {
    if (!price || price === 0) {
      return "Miễn phí";
    }

    return price.toLocaleString("vi-VN") + " VNĐ";
  };

  const handleViewDetail = (courseId) => {
    navigate(`/khoa-hoc/${courseId}`);
  };

  return (
    <div className="course-page">


      <main className="course-container">
        <section className="filter-box">
          <h3>☰ Bộ lọc khóa học</h3>

          <form className="filter-form" onSubmit={handleSearch}>
            <div className="filter-group">
              <label>Từ khóa tìm kiếm</label>
              <input
                type="text"
                placeholder="Nhập khóa học cần tìm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Cấp độ</label>
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
              >
                <option value="">Tất cả cấp độ</option>

                {levels.map((level) => (
                  <option key={level.levelId} value={level.levelId}>
                    {level.levelName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="search-btn">
              🔍 Tìm kiếm
            </button>
          </form>
        </section>

        <section className="course-title-section">
          <h1>Danh sách khóa học</h1>
          <p>Các khóa học đang được mở trên hệ thống</p>
        </section>

        {loading && <p className="status-text">Đang tải khóa học...</p>}

        {error && <p className="error-text">{error}</p>}

        {!loading && !error && courses.length === 0 && (
          <p className="status-text">Không tìm thấy khóa học phù hợp.</p>
        )}

        <section className="course-grid">
          {courses.map((course) => (
            <div className="course-card" key={course.courseId}>
              <div className="course-image">
                <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} />

                <div className="course-badges">
                  <span>{course.levelName}</span>

                  {course.accessType === "FREE" ? (
                    <span className="free-badge">FREE</span>
                  ) : (
                    <span className="paid-badge">PAID</span>
                  )}
                </div>
              </div>

              <div className="course-body">
                <div className="teacher-info">
                  <img src={course.teacherAvatar} alt={course.teacherName} />
                  <span>{course.teacherName}</span>
                </div>

                <h2>{course.title}</h2>

                <p className="course-description">{course.shortDescription}</p>

                <div className="course-price-row">
                  <span
                    className={
                      course.price === 0 ? "course-price free" : "course-price"
                    }
                  >
                    {formatPrice(course.price)}
                  </span>

                  <div className="course-meta">
                    <span>👥 {course.totalStudents}</span>
                    <span>⭐ {course.rating}</span>
                  </div>
                </div>

                <button
                  className="detail-btn"
                  onClick={() => handleViewDetail(course.courseId)}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default DSKhoaHoc;