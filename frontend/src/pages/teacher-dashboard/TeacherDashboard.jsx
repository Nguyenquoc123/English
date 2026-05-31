import { useEffect, useMemo, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

import "./TeacherDashboard.css";
import { getFileUrl } from "../../utils/fileurl.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const API_BASE = "http://localhost:8080";

const TIME_RANGES = [
    { value: "7D", label: "7 ngày" },
    { value: "30D", label: "30 ngày" },
    { value: "THIS_MONTH", label: "Tháng này" },
    { value: "THIS_YEAR", label: "Năm nay" },
];

function TeacherDashboard() {
    const [summary, setSummary] = useState(null);
    const [charts, setCharts] = useState({
        revenueChart: [],
        studentChart: [],
    });
    const [courses, setCourses] = useState([]);

    const [timeRange, setTimeRange] = useState("7D");
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [chartsLoading, setChartsLoading] = useState(false);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [error, setError] = useState("");

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    const authHeaders = () => {
        const token = getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const unwrapResponse = (data) => {
        return data?.result || data?.data || data;
    };

    const requestJson = async (url, errorMessage) => {
        const response = await fetch(url, {
            method: "GET",
            headers: authHeaders(),
        });

        let data = null;

        try {
            data = await response.json();
        } catch {
            data = null;
        }

        const result = unwrapResponse(data);

        if (!response.ok) {
            throw new Error(data?.message || result?.message || errorMessage);
        }

        return result;
    };

    useEffect(() => {
        loadDashboard(timeRange);
    }, [timeRange]);

    const loadDashboard = async (range = "7D") => {
        try {
            setLoading(true);
            setError("");

            const [summaryData, chartsData, coursesData] = await Promise.all([
                requestJson(
                    `${API_BASE}/teacher/dashboard/summary?range=${range}`,
                    "Không thể tải thống kê tổng quan"
                ),
                requestJson(
                    `${API_BASE}/teacher/dashboard/charts?range=${range}`,
                    "Không thể tải biểu đồ"
                ),
                requestJson(
                    `${API_BASE}/teacher/dashboard/courses?range=${range}`,
                    "Không thể tải danh sách khóa học"
                ),
            ]);

            setSummary(summaryData);

            setCharts({
                revenueChart: chartsData?.revenueChart || [],
                studentChart: chartsData?.studentChart || [],
            });

            setCourses(Array.isArray(coursesData) ? coursesData : []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Lỗi kết nối server khi tải dashboard");
        } finally {
            setLoading(false);
        }
    };

    const reloadSummary = async (range = timeRange) => {
        try {
            setSummaryLoading(true);
            setError("");

            const summaryData = await requestJson(
                `${API_BASE}/teacher/dashboard/summary?range=${range}`,
                "Không thể tải thống kê tổng quan"
            );

            setSummary(summaryData);
        } catch (err) {
            console.error(err);
            setError(err.message || "Không thể tải thống kê tổng quan");
        } finally {
            setSummaryLoading(false);
        }
    };

    const reloadCharts = async (range = timeRange) => {
        try {
            setChartsLoading(true);
            setError("");

            const chartsData = await requestJson(
                `${API_BASE}/teacher/dashboard/charts?range=${range}`,
                "Không thể tải biểu đồ"
            );

            setCharts({
                revenueChart: chartsData?.revenueChart || [],
                studentChart: chartsData?.studentChart || [],
            });
        } catch (err) {
            console.error(err);
            setError(err.message || "Không thể tải biểu đồ");
        } finally {
            setChartsLoading(false);
        }
    };

    const reloadCourses = async (range = timeRange) => {
        try {
            setCoursesLoading(true);
            setError("");

            const coursesData = await requestJson(
                `${API_BASE}/teacher/dashboard/courses?range=${range}`,
                "Không thể tải danh sách khóa học"
            );

            setCourses(Array.isArray(coursesData) ? coursesData : []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Không thể tải danh sách khóa học");
        } finally {
            setCoursesLoading(false);
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

    const getCurrentRangeLabel = () => {
        return TIME_RANGES.find((item) => item.value === timeRange)?.label || "7 ngày";
    };

    const stats = useMemo(() => {
        return [
            {
                title: "Khóa học",
                value: formatNumber(summary?.totalCourses),
                icon: "bi-journal-bookmark",
                variant: "primary",
            },
            {
                title: "Học viên",
                value: formatNumber(summary?.totalStudents),
                icon: "bi-people",
                variant: "success",
            },
            {
                title: "Số dư khả dụng",
                value: formatCurrency(summary?.availableRevenue),
                icon: "bi-wallet2",
                variant: "warning",
                action: true,
            },
            {
                title: "Doanh thu",
                value: formatCurrency(summary?.periodRevenue ?? summary?.totalRevenue),
                icon: "bi-cash-coin",
                variant: "info",
            },
        ];
    }, [summary, timeRange]);

    const pendingCourses = summary?.pendingCourses || 0;
    const rejectedCourses = summary?.rejectedCourses || 0;
    const pendingWithdrawals = summary?.pendingWithdrawals || 0;

    const revenueChartData = charts?.revenueChart || [];
    const studentChartData = charts?.studentChart || [];

    const handleWithdrawClick = () => {
        window.location.href = "/teacher/withdraw";
    };

    const handleRangeChange = (range) => {
        if (range === timeRange) return;
        setTimeRange(range);
    };

    const renderTimeRangeButtons = () => {
        return (
            <div className="dashboard-range-group">
                {TIME_RANGES.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        className={`dashboard-range-btn ${
                            timeRange === item.value ? "active" : ""
                        }`}
                        onClick={() => handleRangeChange(item.value)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        );
    };

    const renderLineChart = (items, type = "money") => {
        if (!items || items.length === 0) {
            return (
                <div className="chart-empty">
                    <i className="bi bi-graph-up"></i>
                    <span>Chưa có dữ liệu thống kê cho khoảng thời gian này</span>
                </div>
            );
        }

        const normalizedItems = items.map((item) => ({
            label: item.label,
            value: Number(item.value || 0),
        }));

        const totalValue = normalizedItems.reduce(
            (sum, item) => sum + item.value,
            0
        );

        const maxValue = Math.max(
            ...normalizedItems.map((item) => item.value),
            0
        );

        const lineColor = type === "money" ? "#2563eb" : "#16a34a";

        const fillColor =
            type === "money"
                ? "rgba(37, 99, 235, 0.12)"
                : "rgba(22, 163, 74, 0.12)";

        const chartData = {
            labels: normalizedItems.map((item) => item.label),
            datasets: [
                {
                    label: type === "money" ? "Doanh thu" : "Học viên",
                    data: normalizedItems.map((item) => item.value),
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    pointBackgroundColor: lineColor,
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    borderWidth: 3,
                    tension: 0.35,
                    fill: true,
                },
            ],
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: "#0f172a",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    padding: 12,
                    cornerRadius: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            const value = context.parsed.y || 0;

                            if (type === "money") {
                                return `Doanh thu: ${formatCurrency(value)}`;
                            }

                            return `Học viên: ${formatNumber(value)}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: "#64748b",
                        font: {
                            size: 12,
                            weight: "600",
                        },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8,
                    },
                    border: {
                        display: false,
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "#e2e8f0",
                        drawBorder: false,
                    },
                    ticks: {
                        color: "#64748b",
                        font: {
                            size: 12,
                            weight: "600",
                        },
                        callback: function (value) {
                            if (type === "money") {
                                if (value >= 1000000) {
                                    return `${Math.round(value / 1000000)}tr`;
                                }

                                if (value >= 1000) {
                                    return `${Math.round(value / 1000)}k`;
                                }

                                return value;
                            }

                            return formatNumber(value);
                        },
                    },
                    border: {
                        display: false,
                    },
                },
            },
        };

        return (
            <div className="real-chart-wrap">
                <div className="real-chart-header">
                    <div>
                        <span className="real-chart-label">
                            Tổng trong {getCurrentRangeLabel().toLowerCase()}
                        </span>
                        <strong>
                            {type === "money"
                                ? formatCurrency(totalValue)
                                : `${formatNumber(totalValue)} học viên`}
                        </strong>
                    </div>

                    <div>
                        <span className="real-chart-label">Đỉnh cao nhất</span>
                        <strong>
                            {type === "money"
                                ? formatCurrency(maxValue)
                                : `${formatNumber(maxValue)} học viên`}
                        </strong>
                    </div>
                </div>

                <div className="real-chart-box">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
        );
    };

    return (
        <div className="teacher-dashboard-page">
            <div className="container-fluid px-0">
                <div className="dashboard-topbar mb-4">
                    <div>
                        <h4 className="dashboard-page-title">
                            Dashboard giảng viên
                        </h4>
                        <p className="dashboard-page-subtitle">
                            Theo dõi doanh thu, học viên và hiệu quả khóa học.
                        </p>
                    </div>

                    {renderTimeRangeButtons()}
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2">
                        <i className="bi bi-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {loading && !summary ? (
                    <div className="dashboard-loading">
                        <div className="spinner-border text-primary mb-3"></div>
                        <div className="fw-semibold">Đang tải dashboard...</div>
                    </div>
                ) : (
                    <>
                        <div className="row g-3 mb-4">
                            {stats.map((item) => (
                                <div
                                    className="col-12 col-sm-6 col-xl-3"
                                    key={item.title}
                                >
                                    <div className="dashboard-stat-card">
                                        <div
                                            className={`stat-icon stat-${item.variant}`}
                                        >
                                            <i className={`bi ${item.icon}`}></i>
                                        </div>

                                        <div className="flex-grow-1">
                                            <div className="stat-title">
                                                {item.title}
                                            </div>
                                            <div className="stat-value">
                                                {summaryLoading ? "..." : item.value}
                                            </div>

                                            {item.action && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary mt-2"
                                                    onClick={handleWithdrawClick}
                                                >
                                                    Rút tiền
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(pendingCourses > 0 ||
                            rejectedCourses > 0 ||
                            pendingWithdrawals > 0) && (
                            <div className="row g-3 mb-4">
                                {pendingCourses > 0 && (
                                    <div className="col-12 col-lg-4">
                                        <div className="dashboard-alert-card warning">
                                            <i className="bi bi-hourglass-split"></i>
                                            <div>
                                                <strong>
                                                    {pendingCourses} khóa học chờ duyệt
                                                </strong>
                                                <p>
                                                    Khóa học đã gửi và đang chờ quản trị viên xét duyệt.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {rejectedCourses > 0 && (
                                    <div className="col-12 col-lg-4">
                                        <div className="dashboard-alert-card danger">
                                            <i className="bi bi-x-circle"></i>
                                            <div>
                                                <strong>
                                                    {rejectedCourses} khóa học bị từ chối
                                                </strong>
                                                <p>
                                                    Vui lòng kiểm tra lý do từ chối và cập nhật lại nội dung.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                
                            </div>
                        )}

                        <div className="row g-4 mb-4">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-header bg-white px-4 py-3">
                                        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                                            <div>
                                                <h5 className="fw-bold mb-1">
                                                    Biểu đồ doanh thu
                                                </h5>
                                                <small className="text-muted">
                                                    Doanh thu theo{" "}
                                                    {getCurrentRangeLabel().toLowerCase()}.
                                                </small>
                                            </div>

                                            {renderTimeRangeButtons()}
                                        </div>
                                    </div>

                                    <div className="card-body p-4">
                                        {chartsLoading ? (
                                            <div className="chart-empty">
                                                <div className="spinner-border text-primary"></div>
                                                <span>Đang tải biểu đồ...</span>
                                            </div>
                                        ) : (
                                            renderLineChart(revenueChartData, "money")
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-header bg-white px-4 py-3">
                                        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                                            <div>
                                                <h5 className="fw-bold mb-1">
                                                    Biểu đồ số học viên
                                                </h5>
                                                <small className="text-muted">
                                                    Học viên mới theo{" "}
                                                    {getCurrentRangeLabel().toLowerCase()}.
                                                </small>
                                            </div>

                                            {renderTimeRangeButtons()}
                                        </div>
                                    </div>

                                    <div className="card-body p-4">
                                        {chartsLoading ? (
                                            <div className="chart-empty">
                                                <div className="spinner-border text-primary"></div>
                                                <span>Đang tải biểu đồ...</span>
                                            </div>
                                        ) : (
                                            renderLineChart(studentChartData, "student")
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-white px-4 py-3">
                                <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                                    <div>
                                        <h5 className="fw-bold mb-1">
                                            Khóa học của bạn
                                        </h5>
                                        <small className="text-muted">
                                            Số học viên, doanh thu, sao trung bình và số đánh giá.
                                        </small>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => reloadCourses()}
                                            disabled={coursesLoading}
                                        >
                                            {coursesLoading ? "Đang tải..." : "Tải lại"}
                                        </button>

                                        <a
                                            href="/teacher/courses"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            Xem tất cả
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body p-0">
                                {coursesLoading && courses.length === 0 ? (
                                    <div className="dashboard-empty">
                                        <div className="spinner-border text-primary mb-3"></div>
                                        <h6>Đang tải khóa học...</h6>
                                    </div>
                                ) : courses.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table align-middle mb-0 dashboard-table">
                                            <thead>
                                                <tr>
                                                    <th>Khóa học</th>
                                                    <th>Học viên</th>
                                                    <th>Doanh thu</th>
                                                    <th>Đánh giá</th>
                                                    <th>Giá</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {courses.map((course) => (
                                                    <tr key={course.courseId}>
                                                        <td>
                                                            <div className="course-cell">
                                                                <div className="course-thumb">
                                                                    {course.thumbnailUrl ? (
                                                                        <img
                                                                            src={getFileUrl(
                                                                                course.thumbnailUrl
                                                                            )}
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

                                                        <td>
                                                            <strong>
                                                                {formatNumber(course.totalStudents)}
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <strong className="text-success">
                                                                {formatCurrency(course.totalRevenue)}
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <div className="course-rating-cell">
                                                                <span className="rating-star">
                                                                    <i className="bi bi-star-fill"></i>
                                                                    {Number(
                                                                        course.averageRating || 0
                                                                    ).toFixed(1)}
                                                                </span>

                                                                <small>
                                                                    {formatNumber(course.totalReviews)} đánh giá
                                                                </small>
                                                            </div>
                                                        </td>

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
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="dashboard-empty">
                                        <i className="bi bi-journal-plus"></i>
                                        <h6>Chưa có khóa học</h6>
                                        <p>
                                            Tạo khóa học đầu tiên để bắt đầu bán và giảng dạy.
                                        </p>
                                        <a
                                            href="/teacher/courses/create"
                                            className="btn btn-primary btn-sm"
                                        >
                                            Tạo khóa học
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default TeacherDashboard;