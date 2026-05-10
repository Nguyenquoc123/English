import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudentCourseDetail.css";
import { getFileUrl } from "../../utils/fileurl";

function StudentCourseDetail() {
    const navigate = useNavigate();
    const { courseId } = useParams();

    const API_BASE = "http://localhost:8080";

    const [activeTab, setActiveTab] = useState("overview");

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [loadingCourse, setLoadingCourse] = useState(false);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const [error, setError] = useState("");

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        loadCourseDetail();
    }, [courseId]);

    useEffect(() => {
        if (activeTab === "lessons" && lessons.length === 0) {
            loadLessons();
        }

        if (activeTab === "reviews" && reviews.length === 0) {
            loadReviews();
        }
    }, [activeTab]);

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    const loadCourseDetail = async () => {
        try {
            setLoadingCourse(true);
            setError("");

            const token = getToken();

            const response = await fetch(
                `${API_BASE}/khoa-hoc/chi-tiet-khoa-hoc-student/${courseId}`,
                {
                    method: "GET",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                setError(data?.message || "Không thể tải chi tiết khóa học");
                return;
            }
            console.log(data)

            const result = data.result || data.data || data;
            setCourse(result);
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server");
        } finally {
            setLoadingCourse(false);
        }
    };

    const loadLessons = async () => {
        try {
            setLoadingLessons(true);

            const token = getToken();

            const response = await fetch(
                `${API_BASE}/lesson/all-lesson/${courseId}`,
                {
                    method: "GET",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data?.message || "Không thể tải danh sách bài học");
                return;
            }

            const result = data.result || data.data || data;
            setLessons(Array.isArray(result) ? result : result.lessons || []);
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        } finally {
            setLoadingLessons(false);
        }
    };

    const loadReviews = async () => {
        try {
            setLoadingReviews(true);

            const response = await fetch(`${API_BASE}/khoa-hoc/${courseId}/reviews`);

            const data = await response.json();

            if (!response.ok) {
                alert(data?.message || "Không thể tải đánh giá");
                return;
            }

            const result = data.result || data.data || data;
            setReviews(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        } finally {
            setLoadingReviews(false);
        }
    };

    const handlePurchase = async () => {
        if (!getToken()) {
            navigate("/login");
            return;
        }

        navigate(`/courses/${courseId}/purchase`);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!course?.isEnrolled) {
            alert("Bạn cần mua khóa học trước khi đánh giá");
            return;
        }

        if (!reviewComment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá");
            return;
        }

        try {
            setSubmittingReview(true);

            const token = getToken();

            const response = await fetch(`${API_BASE}/khoa-hoc/${courseId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    rating: Number(reviewRating),
                    comment: reviewComment.trim(),
                }),
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                alert(data?.message || "Gửi đánh giá thất bại");
                return;
            }

            alert("Gửi đánh giá thành công");

            setReviewRating(5);
            setReviewComment("");
            loadReviews();
            loadCourseDetail();
        } catch (err) {
            console.error(err);
            alert("Lỗi hệ thống khi gửi đánh giá");
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatPrice = (price) => {
        if (!price || Number(price) === 0) return "Miễn phí";
        return Number(price).toLocaleString("vi-VN") + " VNĐ";
    };

    const getAccessTypeText = () => {
        if (!course) return "";
        if (course.accessType === "FREE" || course.courseType === "FREE") {
            return "Miễn phí";
        }
        return "Có phí";
    };

    const handleLessonClick = (lesson) => {
        if (!course?.isEnrolled && !lesson.isFreePreview) {
            alert("Bạn cần mua khóa học để học bài này");
            return;
        }

        navigate(`/courses/${courseId}/lessons/${lesson.lessonId}`);
    };

    if (loadingCourse) {
        return (
            <div className="student-course-detail-page">
                <div className="text-center py-5 text-muted">
                    <div className="spinner-border text-primary mb-3"></div>
                    <div>Đang tải chi tiết khóa học...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-course-detail-page">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="student-course-detail-page">
                <div className="alert alert-warning">Không tìm thấy khóa học.</div>
            </div>
        );
    }

    return (
        <div className="student-course-detail-page">
            <div className="course-breadcrumb">
                <span>Trang chủ</span>
                <i className="bi bi-chevron-right"></i>
                <span>Khóa học</span>
                <i className="bi bi-chevron-right"></i>
                <strong>Chi tiết khóa học</strong>
            </div>

            <div className="course-hero-section">
                <div className="row g-4 align-items-stretch">
                    <div className="col-lg-5">
                        <div className="student-course-cover">
                            {course.thumbnailUrl ? (
                                <img src={getFileUrl(course.thumbnailUrl)} alt={course.title} />
                            ) : (
                                <div className="course-cover-placeholder">
                                    <i className="bi bi-book"></i>
                                    <span>ENGLISH COURSE</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <div className="student-course-hero-content">
                            <div className="d-flex gap-2 flex-wrap mb-3">
                                <span className="badge rounded-pill bg-primary-subtle text-primary">
                                    {course.levelName || "Chưa có cấp độ"}
                                </span>

                                <span
                                    className={
                                        course.accessType === "FREE" || course.courseType === "FREE"
                                            ? "badge rounded-pill bg-success-subtle text-success"
                                            : "badge rounded-pill bg-info-subtle text-info"
                                    }
                                >
                                    {getAccessTypeText()}
                                </span>

                                {course.isEnrolled && (
                                    <span className="badge rounded-pill text-bg-success">
                                        Đã sở hữu
                                    </span>
                                )}
                            </div>

                            <h1>{course.title}</h1>

                            <p className="student-course-short">
                                {course.shortDescription ||
                                    "Khóa học được thiết kế giúp học viên học tiếng Anh hiệu quả hơn."}
                            </p>

                            <div className="student-course-price-main">
                                {formatPrice(course.price)}
                            </div>

                            <div className="d-flex gap-2 flex-wrap mt-3">
                                {course.isEnrolled ? (
                                    <button
                                        className="btn btn-primary px-4"
                                        onClick={() => setActiveTab("lessons")}
                                    >
                                        <i className="bi bi-play-circle me-1"></i>
                                        Vào học
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary px-4"
                                        onClick={handlePurchase}
                                        disabled={purchasing}
                                    >
                                        {purchasing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-cart-check me-1"></i>
                                                Mua khóa học
                                            </>
                                        )}
                                    </button>
                                )}

                                <button
                                    className="btn btn-outline-primary px-4"
                                    onClick={() => setActiveTab("lessons")}
                                >
                                    <i className="bi bi-list-task me-1"></i>
                                    Xem bài học
                                </button>

                                <button className="btn btn-light" onClick={() => navigate(-1)}>
                                    <i className="bi bi-arrow-left me-1"></i>
                                    Quay lại
                                </button>
                            </div>

                            <div className="course-quick-stats mt-4">
                                <div>
                                    <strong>{course.lessonCount || 0}</strong>
                                    <span>Bài học</span>
                                </div>

                                <div>
                                    <strong>{course.studentCount || 0}</strong>
                                    <span>Học viên</span>
                                </div>

                                <div>
                                    <strong>{course.rating || 0}</strong>
                                    <span>Đánh giá</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mt-2">
                <div className="col-lg-8">
                    <ul className="nav student-course-tabs">
                        <li className="nav-item">
                            <button
                                type="button"
                                className={
                                    activeTab === "overview" ? "nav-link active" : "nav-link"
                                }
                                onClick={() => setActiveTab("overview")}
                            >
                                Tổng quan
                            </button>
                        </li>

                        <li className="nav-item">
                            <button
                                type="button"
                                className={
                                    activeTab === "lessons" ? "nav-link active" : "nav-link"
                                }
                                onClick={() => setActiveTab("lessons")}
                            >
                                Bài học
                            </button>
                        </li>

                        <li className="nav-item">
                            <button
                                type="button"
                                className={
                                    activeTab === "reviews" ? "nav-link active" : "nav-link"
                                }
                                onClick={() => setActiveTab("reviews")}
                            >
                                Đánh giá
                            </button>
                        </li>
                    </ul>

                    {activeTab === "overview" && (
                        <div className="student-course-card">
                            <h5>Giới thiệu khóa học</h5>

                            <div className="course-short-description-box">
                                <span>Mô tả ngắn</span>
                                <p>
                                    {course.shortDescription || "Khóa học chưa có mô tả ngắn."}
                                </p>
                            </div>

                            <div className="course-description-box mt-4">
                                <h6>Mô tả chi tiết</h6>

                                {course.description ? (
                                    <div
                                        className="course-html-content"
                                        dangerouslySetInnerHTML={{ __html: course.description }}
                                    ></div>
                                ) : (
                                    <p className="text-muted mb-0">Khóa học chưa có mô tả chi tiết.</p>
                                )}
                            </div>

                            <div className="benefit-box mt-4">
                                <h6>Bạn sẽ học được gì?</h6>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="benefit-item">
                                            <i className="bi bi-check-circle"></i>
                                            Tự tin sử dụng tiếng Anh trong giao tiếp.
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="benefit-item">
                                            <i className="bi bi-check-circle"></i>
                                            Cải thiện từ vựng và ngữ pháp theo chủ đề.
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="benefit-item">
                                            <i className="bi bi-check-circle"></i>
                                            Luyện tập qua bài học, video và câu hỏi ôn tập.
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="benefit-item">
                                            <i className="bi bi-check-circle"></i>
                                            Theo dõi tiến độ học tập rõ ràng.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="review-summary mt-4">
                                <h5>Đánh giá khóa học</h5>

                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <div className="review-score">{course.rating || 0}</div>

                                    <div>
                                        <div className="rating-stars">
                                            {"★★★★★".slice(0, Math.round(course.rating || 0))}
                                            <span>
                                                {"★★★★★".slice(Math.round(course.rating || 0))}
                                            </span>
                                        </div>

                                        <small className="text-muted">
                                            Dựa trên {course.reviewCount || reviews.length || 0} đánh giá
                                        </small>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-sm btn-outline-primary mt-3"
                                    onClick={() => setActiveTab("reviews")}
                                >
                                    Xem tất cả đánh giá
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "lessons" && (
                        <div className="student-course-card">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="mb-1">Danh sách bài học</h5>
                                    <small className="text-muted">
                                        {course.isEnrolled
                                            ? "Bạn có thể truy cập toàn bộ bài học của khóa học."
                                            : "Một số bài học sẽ bị khóa cho đến khi bạn mua khóa học."}
                                    </small>
                                </div>

                                {!course.isEnrolled && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={handlePurchase}
                                        disabled={purchasing}
                                    >
                                        Mua để mở khóa
                                    </button>
                                )}
                            </div>

                            {loadingLessons ? (
                                <div className="text-center text-muted py-4">
                                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                    Đang tải bài học...
                                </div>
                            ) : (
                                <div className="lesson-list-box">
                                    {lessons.map((lesson) => {
                                        const locked = !course.isEnrolled && !lesson.isFreePreview;

                                        return (
                                            <button
                                                type="button"
                                                className="student-lesson-item"
                                                key={lesson.lessonId}
                                                onClick={() => handleLessonClick(lesson)}
                                            >
                                                <div className="lesson-index">
                                                    {String(lesson.lessonOrder).padStart(2, "0")}
                                                </div>

                                                <div className="flex-grow-1 text-start">
                                                    <strong>{lesson.title}</strong>
                                                    <span>{lesson.description || "Chưa có mô tả."}</span>
                                                </div>

                                                <div className="lesson-meta">
                                                    {locked ? (
                                                        <i className="bi bi-lock"></i>
                                                    ) : (
                                                        <i className="bi bi-play-circle"></i>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {lessons.length === 0 && (
                                        <div className="text-center text-muted py-4">
                                            Khóa học chưa có bài học.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div className="student-course-card">
                            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                                <div>
                                    <h5 className="mb-1">Đánh giá của học viên</h5>
                                    <small className="text-muted">
                                        Xem nhận xét từ các học viên đã tham gia khóa học.
                                    </small>
                                </div>

                                <div className="review-score-small">
                                    {course.rating || 0}
                                    <span>/5</span>
                                </div>
                            </div>

                            {course.isEnrolled ? (
                                <form className="review-form" onSubmit={handleSubmitReview}>
                                    <h6>Viết đánh giá của bạn</h6>

                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <label className="form-label">Số sao</label>

                                            <select
                                                className="form-select"
                                                value={reviewRating}
                                                onChange={(e) => setReviewRating(e.target.value)}
                                            >
                                                <option value="5">5 sao</option>
                                                <option value="4">4 sao</option>
                                                <option value="3">3 sao</option>
                                                <option value="2">2 sao</option>
                                                <option value="1">1 sao</option>
                                            </select>
                                        </div>

                                        <div className="col-md-9">
                                            <label className="form-label">Nhận xét</label>

                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                placeholder="Chia sẻ cảm nhận của bạn về khóa học..."
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary mt-3"
                                        disabled={submittingReview}
                                    >
                                        {submittingReview ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            "Gửi đánh giá"
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="alert alert-info">
                                    Bạn cần mua khóa học để có thể gửi đánh giá.
                                </div>
                            )}

                            <div className="review-list mt-4">
                                {loadingReviews ? (
                                    <div className="text-center text-muted py-4">
                                        Đang tải đánh giá...
                                    </div>
                                ) : (
                                    reviews.map((review) => (
                                        <div className="review-item" key={review.reviewId}>
                                            <div className="review-avatar">
                                                {review.fullName?.charAt(0) || "U"}
                                            </div>

                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between gap-2">
                                                    <strong>{review.fullName || "Học viên"}</strong>
                                                    <small className="text-muted">
                                                        {review.createdAt || "--"}
                                                    </small>
                                                </div>

                                                <div className="rating-stars small-stars">
                                                    {"★★★★★".slice(0, Number(review.rating || 0))}
                                                    <span>
                                                        {"★★★★★".slice(Number(review.rating || 0))}
                                                    </span>
                                                </div>

                                                <p>{review.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {!loadingReviews && reviews.length === 0 && (
                                    <div className="text-center text-muted py-4">
                                        Chưa có đánh giá nào.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    <div className="student-side-card">
                        <h6>Giáo viên</h6>

                        <div className="teacher-box">
                            <div className="teacher-avatar">
                                {course.teacherAvatarUrl ? (
                                    <img
                                        src={getFileUrl(course.teacherAvatarUrl)}
                                        alt={course.teacherName}
                                    />
                                ) : (
                                    <span>{course.teacherName?.charAt(0) || "G"}</span>
                                )}
                            </div>

                            <div>
                                <strong>{course.teacherName || "Giáo viên"}</strong>
                                <span>Chuyên giảng viên tiếng Anh</span>
                            </div>
                        </div>

                        <p className="teacher-intro">
                            {course.teacherBio ||
                                "Giáo viên có kinh nghiệm giảng dạy và xây dựng nội dung học tập thực tế."}
                        </p>

                        <div className="teacher-stats">
                            <div>
                                <strong>{course.teacherCourseCount || 0}</strong>
                                <span>Khóa học</span>
                            </div>

                            <div>
                                <strong>{course.rating || 0}</strong>
                                <span>Đánh giá</span>
                            </div>

                            <div>
                                <strong>{course.studentCount || 0}</strong>
                                <span>Học viên</span>
                            </div>
                        </div>
                    </div>

                    <div className="student-side-card mt-3">
                        <h6>Giá khóa học</h6>

                        <div className="side-price">{formatPrice(course.price)}</div>

                        {course.originalPrice && Number(course.originalPrice) > Number(course.price) && (
                            <div className="old-price">
                                {formatPrice(course.originalPrice)}
                            </div>
                        )}

                        {course.isEnrolled ? (
                            <button
                                className="btn btn-success w-100 mt-3"
                                onClick={() => setActiveTab("lessons")}
                            >
                                <i className="bi bi-play-circle me-1"></i>
                                Tiếp tục học
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary w-100 mt-3"
                                onClick={handlePurchase}
                                disabled={purchasing}
                            >
                                {purchasing ? "Đang xử lý..." : "Mua khóa học ngay"}
                            </button>
                        )}

                        <ul className="course-includes">
                            <li>
                                <i className="bi bi-infinity"></i>
                                Truy cập trọn đời
                            </li>
                            <li>
                                <i className="bi bi-phone"></i>
                                Học được trên mobile & desktop
                            </li>
                            <li>
                                <i className="bi bi-clipboard-check"></i>
                                Có phần ôn tập và bài thi
                            </li>
                            <li>
                                <i className="bi bi-star"></i>
                                Được đánh giá sau khi học
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentCourseDetail;