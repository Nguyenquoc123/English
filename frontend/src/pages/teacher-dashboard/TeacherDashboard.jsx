import { useEffect, useMemo, useState } from "react";
import "./TeacherDashboard.css";
import { getFileUrl } from "../../utils/fileurl.js";

const API_BASE = "http://localhost:8080";

const EMPTY_DASHBOARD = {
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalQuestions: 0,
    totalRevenue: 0,
    availableRevenue: 0,
    pendingCourses: 0,
    rejectedCourses: 0,
    pendingWithdrawals: 0,
    totalLessons: 0,
    totalExams: 0,
    totalReviews: 0,
    averageRating: 0,
    recentCourses: [],
    recentEarnings: [],
};

function TeacherDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    const authHeaders = () => {
        const token = getToken();

        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/teacher/dashboard`, {
                method: "GET",
                headers: authHeaders(),
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            const result = data?.result || data?.data || data;

            if (!response.ok) {
                setDashboard(EMPTY_DASHBOARD);
                return;
            }

            setDashboard(result || EMPTY_DASHBOARD);
        } catch (err) {
            console.error(err);
            setDashboard(EMPTY_DASHBOARD);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        const numberValue = Number(value || 0);

        return numberValue.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString("vi-VN");
    };

    const formatDate = (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getCourseStatusBadge = (status) => {
        switch (status) {
            case "DRAFT":
                return "text-bg-secondary";
            case "PENDING":
                return "text-bg-warning";
            case "APPROVED":
                return "text-bg-info";
            case "PUBLISHED":
                return "text-bg-success";
            case "REJECTED":
                return "text-bg-danger";
            case "HIDDEN":
                return "text-bg-dark";
            default:
                return "text-bg-light border";
        }
    };

    const getCourseStatusLabel = (status) => {
        switch (status) {
            case "DRAFT":
                return "Bản nháp";
            case "PENDING":
                return "Chờ duyệt";
            case "APPROVED":
                return "Đã duyệt";
            case "PUBLISHED":
                return "Đang bán";
            case "REJECTED":
                return "Bị từ chối";
            case "HIDDEN":
                return "Đã ẩn";
            default:
                return status || "Không rõ";
        }
    };

    const getEarningStatusLabel = (status) => {
        switch (status) {
            case "AVAILABLE":
                return "Khả dụng";
            case "WITHDRAWN":
                return "Đã rút";
            default:
                return status || "Không rõ";
        }
    };

    const getEarningStatusBadge = (status) => {
        switch (status) {
            case "AVAILABLE":
                return "text-bg-success";
            case "WITHDRAWN":
                return "text-bg-secondary";
            default:
                return "text-bg-light border";
        }
    };

    const stats = useMemo(() => {
        return [
            {
                title: "Khóa học",
                value: formatNumber(dashboard?.totalCourses),
                subtitle: `${formatNumber(dashboard?.publishedCourses)} đang bán`,
                icon: "bi-journal-bookmark",
                variant: "primary",
            },
            {
                title: "Học viên",
                value: formatNumber(dashboard?.totalStudents),
                subtitle: "Tổng lượt ghi danh",
                icon: "bi-people",
                variant: "success",
            },
            {
                title: "Câu hỏi",
                value: formatNumber(dashboard?.totalQuestions),
                subtitle: "Trong ngân hàng câu hỏi",
                icon: "bi-question-circle",
                variant: "info",
            },
            {
                title: "Doanh thu",
                value: formatCurrency(dashboard?.totalRevenue),
                subtitle: `${formatCurrency(dashboard?.availableRevenue)} khả dụng`,
                icon: "bi-cash-coin",
                variant: "warning",
            },
        ];
    }, [dashboard]);

    const pendingCourses = dashboard?.pendingCourses || 0;
    const rejectedCourses = dashboard?.rejectedCourses || 0;
    const pendingWithdrawals = dashboard?.pendingWithdrawals || 0;

    return (
        <div className="teacher-dashboard-page">
            <div className="container-fluid px-0">
                

                {loading && !dashboard ? (
                    <div className="dashboard-loading">
                        <div className="spinner-border text-primary mb-3"></div>
                        <div className="fw-semibold">Đang tải dashboard...</div>
                    </div>
                ) : (
                    <>
                        <div className="row g-3 mb-4">
                            {stats.map((item) => (
                                <div className="col-12 col-sm-6 col-xl-3" key={item.title}>
                                    <div className="dashboard-stat-card">
                                        <div className={`stat-icon stat-${item.variant}`}>
                                            <i className={`bi ${item.icon}`}></i>
                                        </div>

                                        <div>
                                            <div className="stat-title">{item.title}</div>
                                            <div className="stat-value">{item.value}</div>
                                            <div className="stat-subtitle">{item.subtitle}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(pendingCourses > 0 || rejectedCourses > 0 || pendingWithdrawals > 0) && (
                            <div className="row g-3 mb-4">
                                {pendingCourses > 0 && (
                                    <div className="col-12 col-lg-4">
                                        <div className="dashboard-alert-card warning">
                                            <i className="bi bi-hourglass-split"></i>
                                            <div>
                                                <strong>{pendingCourses} khóa học chờ duyệt</strong>
                                                <p>Khóa học đã gửi và đang chờ quản trị viên xét duyệt.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {rejectedCourses > 0 && (
                                    <div className="col-12 col-lg-4">
                                        <div className="dashboard-alert-card danger">
                                            <i className="bi bi-x-circle"></i>
                                            <div>
                                                <strong>{rejectedCourses} khóa học bị từ chối</strong>
                                                <p>Vui lòng kiểm tra lý do từ chối và cập nhật lại nội dung.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {pendingWithdrawals > 0 && (
                                    <div className="col-12 col-lg-4">
                                        <div className="dashboard-alert-card info">
                                            <i className="bi bi-wallet2"></i>
                                            <div>
                                                <strong>{pendingWithdrawals} yêu cầu rút tiền chờ xử lý</strong>
                                                <p>Yêu cầu rút tiền của bạn đang được quản trị viên xử lý.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="row g-4">
                            <div className="col-12 col-xl-8">
                                <div className="card border-0 shadow-sm rounded-4 h-100">
                                    <div className="card-header bg-white px-4 py-3">
                                        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                                            <div>
                                                <h5 className="fw-bold mb-1">Khóa học gần đây</h5>
                                                <small className="text-muted">
                                                    Các khóa học mới nhất của bạn
                                                </small>
                                            </div>

                                            <a href="/teacher/courses" className="btn btn-sm btn-outline-primary">
                                                Xem tất cả
                                            </a>
                                        </div>
                                    </div>

                                    <div className="card-body p-0">
                                        {dashboard?.recentCourses?.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table align-middle mb-0 dashboard-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Khóa học</th>
                                                            <th>Cấp độ</th>
                                                            <th>Giá</th>
                                                            <th>Trạng thái</th>
                                                            <th>Ngày tạo</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {dashboard.recentCourses.map((course) => (
                                                            <tr key={course.courseId}>
                                                                <td>
                                                                    <div className="course-cell">
                                                                        <div className="course-thumb">
                                                                            {course.thumbnailUrl ? (
                                                                                <img
                                                                                    src={getFileUrl(course.thumbnailUrl)}
                                                                                    alt={course.title}
                                                                                />
                                                                            ) : (
                                                                                <i className="bi bi-journal-text"></i>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <strong>{course.title}</strong>
                                                                            <small>
                                                                                {course.courseType === "PAID"
                                                                                    ? "Khóa học trả phí"
                                                                                    : "Khóa học miễn phí"}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td>{course.levelName || "—"}</td>

                                                                <td>
                                                                    {course.courseType === "PAID"
                                                                        ? formatCurrency(course.price)
                                                                        : "Miễn phí"}
                                                                </td>

                                                                <td>
                                                                    <span
                                                                        className={`badge rounded-pill ${getCourseStatusBadge(
                                                                            course.status
                                                                        )}`}
                                                                    >
                                                                        {getCourseStatusLabel(course.status)}
                                                                    </span>
                                                                </td>

                                                                <td>{formatDate(course.createdAt)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="dashboard-empty">
                                                <i className="bi bi-journal-plus"></i>
                                                <h6>Chưa có khóa học</h6>
                                                <p>Tạo khóa học đầu tiên để bắt đầu bán và giảng dạy.</p>
                                                <a href="/teacher/courses/create" className="btn btn-primary btn-sm">
                                                    Tạo khóa học
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-xl-4">
                                <div className="card border-0 shadow-sm rounded-4 mb-4">
                                    <div className="card-header bg-white px-4 py-3">
                                        <h5 className="fw-bold mb-1">Hoạt động học tập</h5>
                                        <small className="text-muted">Nội dung bạn đã xây dựng</small>
                                    </div>

                                    <div className="card-body p-4">
                                        <div className="activity-list">
                                            <div className="activity-item">
                                                <div className="activity-icon">
                                                    <i className="bi bi-play-circle"></i>
                                                </div>
                                                <div>
                                                    <span>Bài học</span>
                                                    <strong>{formatNumber(dashboard?.totalLessons)}</strong>
                                                </div>
                                            </div>

                                            <div className="activity-item">
                                                <div className="activity-icon">
                                                    <i className="bi bi-file-earmark-check"></i>
                                                </div>
                                                <div>
                                                    <span>Bài thi</span>
                                                    <strong>{formatNumber(dashboard?.totalExams)}</strong>
                                                </div>
                                            </div>

                                            <div className="activity-item">
                                                <div className="activity-icon">
                                                    <i className="bi bi-chat-square-text"></i>
                                                </div>
                                                <div>
                                                    <span>Đánh giá</span>
                                                    <strong>{formatNumber(dashboard?.totalReviews)}</strong>
                                                </div>
                                            </div>

                                            <div className="activity-item">
                                                <div className="activity-icon">
                                                    <i className="bi bi-star-fill"></i>
                                                </div>
                                                <div>
                                                    <span>Điểm đánh giá TB</span>
                                                    <strong>{Number(dashboard?.averageRating || 0).toFixed(1)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-header bg-white px-4 py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="fw-bold mb-1">Doanh thu gần đây</h5>
                                                <small className="text-muted">Theo giao dịch khóa học</small>
                                            </div>

                                            <a href="/teacher/earnings" className="btn btn-sm btn-outline-primary">
                                                Xem
                                            </a>
                                        </div>
                                    </div>

                                    <div className="card-body p-4">
                                        {dashboard?.recentEarnings?.length > 0 ? (
                                            <div className="earning-list">
                                                {dashboard.recentEarnings.map((earning) => (
                                                    <div className="earning-item" key={earning.earningId}>
                                                        <div>
                                                            <strong>{earning.courseTitle}</strong>
                                                            <small>{formatDate(earning.createdAt)}</small>
                                                        </div>

                                                        <div className="text-end">
                                                            <strong>{formatCurrency(earning.netAmount)}</strong>
                                                            <span
                                                                className={`badge rounded-pill ${getEarningStatusBadge(
                                                                    earning.status
                                                                )}`}
                                                            >
                                                                {getEarningStatusLabel(earning.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-4">
                                                <i className="bi bi-cash-stack fs-3 d-block mb-2"></i>
                                                Chưa có doanh thu
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default TeacherDashboard;