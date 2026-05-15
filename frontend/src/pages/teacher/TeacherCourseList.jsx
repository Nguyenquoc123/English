import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../../compenents/phantrang/page";

function TeacherCourseList() {
    const navigate = useNavigate();

    const API_BASE = "http://localhost:8080/khoa-hoc";

    const [keyword, setKeyword] = useState("");
    const [levelId, setLevelId] = useState("");
    const [status, setStatus] = useState("");

    const [courses, setCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [levels, setLevels] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(6);
    const [totalPages, setTotalPages] = useState(0);

    const sampleLevels = [
        { levelId: 1, levelName: "Sơ cấp" },
        { levelId: 2, levelName: "Trung cấp" },
        { levelId: 3, levelName: "Cao cấp" },
    ];

    useEffect(() => {
        setLevels(sampleLevels);

        // Load danh sách khóa học lần đầu
        loadCourses(getCurrentFilter(), 0);


    }, []);

    const buildQueryString = (filter = {}, pageValue = page) => {
        const params = new URLSearchParams();

        if (filter.status && filter.status.trim() !== "") {
            params.append("status", filter.status.trim());
        }

        if (filter.keyword && filter.keyword.trim() !== "") {
            params.append("keyword", filter.keyword.trim());
        }

        if (filter.levelId && filter.levelId !== "") {
            params.append("levelId", filter.levelId);
        }

        params.append("page", pageValue);
        params.append("size", size);

        return params.toString();
    };

    const loadCourses = async (filter = {}, pageValue = page) => {
        try {
            setLoading(true);
            setError("");

            const queryString = buildQueryString(filter, pageValue);

            const url = `${API_BASE}/danh-sach-khoa-hoc-teacher?${queryString}`;

            const token = localStorage.getItem("token");

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

            setCourses(data.content || []);
            setPage(data.number ?? 0);
            setTotalPages(data.totalPages ?? 0);
            setTotalElements(data.totalElements ?? 0);
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    const getCurrentFilter = () => {
        return {
            status: status,
            keyword: keyword,
            levelId: levelId,
        };
    };


    const handleSearch = (e) => {
        e.preventDefault();

        setPage(0);
        loadCourses(getCurrentFilter(), 0);
    };

    const handleResetFilter = () => {
        setKeyword("");
        setLevelId("");
        setStatus("");

        setPage(0);

        loadCourses(
            {
                status: "",
                keyword: "",
                levelId: "",
            },
            0
        );
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        loadCourses(getCurrentFilter(), newPage);
    };

    const formatPrice = (price) => {
        if (!price || price === 0) return "Miễn phí";
        return Number(price).toLocaleString("vi-VN") + " VNĐ";
    };

    const countStatus = (statusValue) => {
        return allCourses.filter((course) => course.status === statusValue).length;
    };

    const getStatusBadge = (statusValue) => {
        if (statusValue === "Published") return "badge text-bg-success";
        if (statusValue === "Pending") return "badge text-bg-warning";
        if (statusValue === "Rejected") return "badge text-bg-danger";
        if (statusValue === "Draft") return "badge text-bg-secondary";
        if (statusValue === "Hidden") return "badge text-bg-dark";
        return "badge text-bg-light";
    };

    const getLevelBadge = (levelName) => {
        if (levelName === "Sơ cấp") return "badge bg-primary-subtle text-primary";
        if (levelName === "Trung cấp") return "badge bg-warning-subtle text-warning";
        if (levelName === "Cao cấp") return "badge bg-info-subtle text-info";
        return "badge bg-secondary";
    };

    const handleDelete = async (courseId) => {
        const ok = window.confirm("Bạn có chắc muốn xóa khóa học này không?");
        if (!ok) return;

        try {
            /*
              Nếu bạn có API xóa thì mở đoạn này:
      
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
            */

            setCourses((prev) => prev.filter((course) => course.courseId !== courseId));
            setAllCourses((prev) => prev.filter((course) => course.courseId !== courseId));

            alert("Xóa khóa học thành công");
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        }
    };

    const handleSubmitApproval = async (courseId) => {
        const ok = window.confirm("Gửi khóa học này cho admin duyệt?");
        if (!ok) return;

        try {
            /*
              Nếu bạn có API gửi duyệt thì mở đoạn này:
      
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
            */

            setCourses((prev) =>
                prev.map((course) =>
                    course.courseId === courseId
                        ? { ...course, status: "Pending" }
                        : course
                )
            );

            setAllCourses((prev) =>
                prev.map((course) =>
                    course.courseId === courseId
                        ? { ...course, status: "Pending" }
                        : course
                )
            );

            alert("Đã gửi khóa học chờ duyệt");
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>


                    <h2 className="fw-bold mb-1">Danh sách khóa học của giáo viên</h2>

                    <p className="text-muted mb-0">
                        Quản lý các khóa học đã tạo, theo dõi trạng thái duyệt và cập nhật
                        nội dung khóa học.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/teacher/courses/create")}
                >
                    <i className="bi bi-plus-lg me-1"></i>
                    Tạo khóa học mới
                </button>
            </div>




            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-funnel me-2"></i>
                        Tìm kiếm và lọc khóa học
                    </h5>

                    <form onSubmit={handleSearch}>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-5">
                                <label className="form-label">Từ khóa tìm kiếm</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập tên khóa học"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>

                            <div className="col-md-2">
                                <label className="form-label">Cấp độ</label>
                                <select
                                    className="form-select"
                                    value={levelId}
                                    onChange={(e) => setLevelId(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    {levels.map((level) => (
                                        <option key={level.levelId} value={level.levelId}>
                                            {level.levelName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-2">
                                <label className="form-label">Trạng thái</label>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Published">Published</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Hidden">Hidden</option>
                                </select>
                            </div>

                            <div className="col-md-3">
                                <button className="btn btn-primary w-100" type="submit">
                                    <i className="bi bi-search me-1"></i>
                                    Tìm kiếm
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Khóa học</th>
                                <th>Cấp độ</th>
                                <th>Giá</th>
                                <th>Trạng thái</th>
                                <th className="text-end">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.courseId}>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">

                                            <div
                                                className="fw-semibold text-truncate"
                                                style={{ maxWidth: "240px" }}
                                            >
                                                {course.title}
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span className={getLevelBadge(course.levelName)}>
                                            {course.levelName}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                course.price === 0
                                                    ? "fw-bold text-success"
                                                    : "fw-bold text-primary"
                                            }
                                        >
                                            {formatPrice(course.price)}
                                        </span>
                                    </td>





                                    <td>
                                        <span className={getStatusBadge(course.status)}>
                                            {course.status}
                                        </span>
                                    </td>



                                    <td>
                                        <div className="d-flex justify-content-end gap-1">
                                            <button
                                                className="btn btn-sm btn-light"
                                                title="Xem chi tiết"
                                                onClick={() =>
                                                    navigate(`/teacher/courses/${course.courseId}`)
                                                }
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>

                                            <button
                                                className="btn btn-sm btn-light"
                                                title="Quản lý lesson"
                                                onClick={() =>
                                                    navigate(`/teacher/courses/${course.courseId}/lessons`)
                                                }
                                            >
                                                <i className="bi bi-journal-text"></i>
                                            </button>

                                            <button
                                                className="btn btn-sm btn-light"
                                                title="Cập nhật"
                                                onClick={() =>
                                                    navigate(`/teacher/courses/${course.courseId}/edit`)
                                                }
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>

                                            {(course.status === "Draft" ||
                                                course.status === "Rejected") && (
                                                    <button
                                                        className="btn btn-sm btn-light"
                                                        title="Gửi duyệt"
                                                        onClick={() => handleSubmitApproval(course.courseId)}
                                                    >
                                                        <i className="bi bi-send"></i>
                                                    </button>
                                                )}

                                            <button
                                                className="btn btn-sm btn-light text-danger"
                                                title="Xóa"
                                                onClick={() => handleDelete(course.courseId)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {courses.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-4">
                                        Không tìm thấy khóa học phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {courses && <Page
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />}

            </div>
        </div>
    );
}

export default TeacherCourseList;