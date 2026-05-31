import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudentCourseDetail.css";
import { getFileUrl } from "../../utils/fileurl";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { studentHome, studentCourses } from "../../utils/breadcrumbPaths";
import StudentExamListSection from "./exam/components/StudentExamListSection";
import CertificateSection from "../../components/certificate/CertificateSection";

function StudentCourseDetail() {
    const navigate = useNavigate();
    const { courseId } = useParams();

    const API_BASE = "http://localhost:8080";

    const [activeTab, setActiveTab] = useState("overview");
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [expandedChild, setExpandedChild] = useState(null);

    const [lessonChildren, setLessonChildren] = useState({});

    const [loadingChild, setLoadingChild] = useState(false);

    const [previewModal, setPreviewModal] = useState({
        open: false,
        type: "",
        data: null,
    });

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [loadingCourse, setLoadingCourse] = useState(false);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const videoRef = useRef(null);
    const saveProgressIntervalRef = useRef(null);

    const [error, setError] = useState("");

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    const [addCard, setAddCard] = useState(false);


    const [showAttemptHistory, setShowAttemptHistory] = useState(false);
    const [attemptHistories, setAttemptHistories] = useState([]);
    const [loadingAttemptHistory, setLoadingAttemptHistory] = useState(false);
    const [loadingExamDetail, setLoadingExamDetail] = useState(false);

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

    useEffect(() => {
        return () => {
            clearAutoSaveVideoProgress();
        };
    }, []);

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };



    // const saveVideoProgress = async (videoId, watchedSeconds) => {
    //     try {
    //         const token = getToken();

    //         if (!token) {
    //             return;
    //         }

    //         if (!videoId || watchedSeconds == null) {
    //             return;
    //         }

    //         await fetch(`${API_BASE}/video-progress`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${token}`,
    //             },
    //             body: JSON.stringify({
    //                 watchedSeconds: Math.floor(watchedSeconds),
    //                 videoId: videoId
    //             }),
    //         });
    //     } catch (err) {
    //         console.error("Lỗi lưu tiến độ video:", err);
    //     }
    // };

    const saveVideoProgress = async (videoId, watchedSeconds) => {
        try {
            const token = getToken();

            if (!token) {
                return null;
            }

            if (!videoId || watchedSeconds == null) {
                return null;
            }

            const response = await fetch(`${API_BASE}/video-progress`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    watchedSeconds: Math.floor(watchedSeconds),
                    videoId: videoId,
                }),
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                console.error(data?.message || "Lưu tiến độ video thất bại");
                return null;
            }

            return data?.result || data?.data || data;
        } catch (err) {
            console.error("Lỗi lưu tiến độ video:", err);
            return null;
        }
    };


    const markVideoCompletedLocal = (videoId, watchedSeconds) => {
        setLessonChildren((prev) => {
            const next = { ...prev };

            Object.keys(next).forEach((key) => {
                next[key] = next[key].map((item) =>
                    item.videoId === videoId
                        ? {
                            ...item,
                            isCompleted: true,
                            watchedSeconds: Math.floor(watchedSeconds || item.watchedSeconds || 0),
                        }
                        : item
                );
            });

            return next;
        });

        setPreviewModal((prev) => {
            if (!prev.data || prev.data.videoId !== videoId) {
                return prev;
            }

            return {
                ...prev,
                data: {
                    ...prev.data,
                    isCompleted: true,
                    watchedSeconds: Math.floor(watchedSeconds || prev.data.watchedSeconds || 0),
                },
            };
        });
    };

    const startAutoSaveVideoProgress = (video) => {
        clearAutoSaveVideoProgress();

        saveProgressIntervalRef.current = setInterval(() => {
            const videoElement = videoRef.current;

            if (!videoElement || !video?.videoId) {
                return;
            }

            saveVideoProgress(
                video.videoId,
                videoElement.currentTime
            );
        }, 20000);
    };

    const clearAutoSaveVideoProgress = () => {
        if (saveProgressIntervalRef.current) {
            clearInterval(saveProgressIntervalRef.current);
            saveProgressIntervalRef.current = null;
        }
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

            const result = data?.result || data?.data || data;
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

            if (!response.ok) {
                navigate("/dang-nhap");
                return;
            }

            const data = await response.json();
            const result = data.result || data.data || data;

            setLessons(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        } finally {
            setLoadingLessons(false);
        }
    };
    // const loadLessons = async () => {
    //     try {
    //         setLoadingLessons(true);

    //         const token = getToken();

    //         const response = await fetch(
    //             `${API_BASE}/lesson/all-lesson/${courseId}`,
    //             {
    //                 method: "GET",
    //                 headers: {
    //                     ...(token ? { Authorization: `Bearer ${token}` } : {}),
    //                 },
    //             }
    //         );



    //         if (!response.ok) {
    //             navigate("/dang-nhap")
    //             return;
    //         }
    //         const data = await response.json();
    //         const result = data.result || data.data || data;
    //         setLessons(Array.isArray(result) ? result : result.lessons || []);
    //     } catch (err) {
    //         console.error(err);
    //         alert("Lỗi kết nối server");
    //     } finally {
    //         setLoadingLessons(false);
    //     }
    // };

    const loadReviews = async () => {
        try {
            setLoadingReviews(true);

            const response = await fetch(`${API_BASE}/danh-gia/ds-danh-gia/${courseId}`);


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
            navigate("/dang-nhap");
            return;
        }

        navigate(`/courses/${courseId}/purchase`);
    };

    async function themVaoGioHang(courseId) {

        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:8080/gio-hang/them/${courseId}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.log(data)
            alert(data.message);
            return;
        }

        alert(data.message);
        window.dispatchEvent(new Event('cartChanged'));

        return data;
    }

    const handleThemVaoGio = async () => {
        try {

            const result = await themVaoGioHang(courseId);



            console.log(result);

        } catch (error) {

            alert(error.message);

        }
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

            const response = await fetch(`${API_BASE}/danh-gia/them-danh-gia/${courseId}`, {
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

    // const handleLessonClick = (lesson) => {
    //     if (!course?.isEnrolled && !lesson.isFreePreview) {
    //         alert("Bạn cần mua khóa học để học bài này");
    //         return;
    //     }

    //     navigate(`/khoa-hoc/${courseId}/lessons/${lesson.lessonId}`);
    // };

    const lichSuLamBaiOnTap = async () => {
        if (!previewModal.data) return;

        try {
            setLoadingAttemptHistory(true);
            setShowAttemptHistory(true);

            const lessonId = previewModal.data.lessonId;
            const practiceType = previewModal.data.practiceType;
            const token = getToken();

            const response = await fetch(
                `${API_BASE}/lich-su-lam-bai/practice/${lessonId}/${practiceType}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Không thể lấy lịch sử làm bài");
            }

            const data = await response.json();

            setAttemptHistories(data || []);
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử làm bài:", error);
            setAttemptHistories([]);
        } finally {
            setLoadingAttemptHistory(false);
        }
    };

    const fetchExamDetail = async (examId) => {
        const token = getToken();

        const response = await fetch(`${API_BASE}/exams/${examId}/chi-tiet`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            throw new Error("Không thể lấy chi tiết bài thi");
        }

        return await response.json();
    };

    const handleContentClick = async (item) => {
        if (item.locked) {
            alert(item.lockReason || "Nội dung này đang bị khóa");
            return;
        }

        if (item.type === "EXAM") {
            try {
                setLoadingExamDetail(true);
                setShowAttemptHistory(false);
                setAttemptHistories([]);

                setPreviewModal({
                    open: true,
                    type: "exam",
                    data: null,
                });

                const examId = item.examId || item.id;
                console.log(examId)
                const examDetail = await fetchExamDetail(examId);

                setPreviewModal({
                    open: true,
                    type: "exam",
                    data: {
                        ...item,
                        ...examDetail,
                    },
                });
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết bài thi:", error);
                alert("Không thể lấy chi tiết bài thi");
                setPreviewModal({
                    open: false,
                    type: "",
                    data: null,
                });
            } finally {
                setLoadingExamDetail(false);
            }

            return;
        }

        if (item.type === "LESSON") {
            setExpandedItemId((currentId) =>
                currentId === item.courseItemId ? null : item.courseItemId
            );
        }
    };

    const getChildKey = (lessonId, childType) => {
        return `${lessonId}-${childType}`;
    };

    const getChildData = (lessonId, childType) => {
        const key = getChildKey(lessonId, childType);
        return lessonChildren[key] || [];
    };

    const setChildData = (lessonId, childType, data) => {
        const key = getChildKey(lessonId, childType);

        setLessonChildren((prev) => ({
            ...prev,
            [key]: data,
        }));
    };

    const fetchLessonChildData = async (lessonId, childType) => {
        const token = getToken();

        let url = "";

        if (childType === "videos") {
            url = `${API_BASE}/video/${lessonId}/lessons`;
        }

        if (childType === "vocabularies") {
            url = `${API_BASE}/tu-vung/lessons/${lessonId}`;
        }

        if (childType === "grammars") {
            url = `${API_BASE}/grammar/${lessonId}/grammars`;
        }

        if (childType === "practice") {
            url = `${API_BASE}/practice-configs/${lessonId}`;
        }

        if (!url) {
            throw new Error("Loại nội dung không hợp lệ");
        }

        const response = await fetch(url, {
            method: "GET",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        let data = null;

        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            throw new Error(data?.message || "Không thể tải dữ liệu");
        }

        const result = data?.result || data?.data || data;

        return Array.isArray(result) ? result : [];
    };

    const handleLessonChildClick = async (e, lessonId, childType) => {
        e.stopPropagation();

        const nextExpanded = {
            lessonId,
            childType,
        };

        if (
            expandedChild?.lessonId === lessonId &&
            expandedChild?.childType === childType
        ) {
            setExpandedChild(null);
            return;
        }

        setExpandedChild(nextExpanded);

        const currentData = getChildData(lessonId, childType);

        if (currentData.length > 0) {
            return;
        }

        try {
            setLoadingChild(true);

            const data = await fetchLessonChildData(lessonId, childType);

            setChildData(lessonId, childType, data);
        } catch (err) {
            console.error(err);
            alert(err.message || "Không thể tải dữ liệu");
        } finally {
            setLoadingChild(false);
        }
    };

    const lichSuThi = async () => {
        if (!previewModal.data) return;

        try {
            setLoadingAttemptHistory(true);
            setShowAttemptHistory(true);

            const examId = previewModal.data.examId || previewModal.data.id;
            const token = getToken();

            const response = await fetch(
                `${API_BASE}/lich-su-lam-bai/exam/${examId}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Không thể lấy lịch sử thi");
            }

            const data = await response.json();

            setAttemptHistories(data || []);
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử thi:", error);
            setAttemptHistories([]);
        } finally {
            setLoadingAttemptHistory(false);
        }
    };

    const handleViewDetail = (attemptId) => {
        navigate(`/lich-su-lam-bai/${attemptId}`);
    };

    const handleDangKy = async () => {
        try {
            setPurchasing(true);

            const response = await fetch(
                `http://localhost:8080/khoa-hoc/dang-ky-khoa-hoc-free/${course.courseId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Đăng ký thất bại");
            }

            alert(data.message);

            window.location.reload();

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setPurchasing(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return "--";

        try {
            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return value;
            }

            return date.toLocaleString("vi-VN");
        } catch {
            return value;
        }
    };

    const formatDateTime = (value) => {
        if (!value) return "Chưa có";

        return new Date(value).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatScore = (value) => {
        if (value === null || value === undefined) return "Chưa có";
        return Number(value).toFixed(2);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "--:--";

        const total = Number(seconds);
        const minutes = Math.floor(total / 60);
        const remainSeconds = total % 60;

        return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
    };

    const openPreviewModal = (type, data) => {
        clearAutoSaveVideoProgress();

        setPreviewModal({
            open: true,
            type,
            data,
        });
    };

    const closePreviewModal = () => {
        if (previewModal.type === "video" && previewModal.data && videoRef.current) {
            saveVideoProgress(
                previewModal.data.videoId,
                videoRef.current.currentTime
            );
        }

        clearAutoSaveVideoProgress();

        setPreviewModal({
            open: false,
            type: "",
            data: null,
        });
    };

    const getChildTitle = (childType) => {
        if (childType === "videos") return "Video bài giảng";
        if (childType === "vocabularies") return "Từ vựng";
        if (childType === "grammars") return "Ngữ pháp";
        if (childType === "practice") return "Bài ôn tập";
        return "Nội dung";
    };

    const getPracticeTypeText = (type) => {
        if (type === "MULTIPLE_CHOICE") return "Trắc nghiệm";
        if (type === "LISTENING_CHOICE") return "Nghe chọn đáp án";
        if (type === "LISTENING_FILL_BLANK") return "Nghe điền từ";
        if (type === "ARRANGE_SENTENCE") return "Sắp xếp câu";
        if (type === "WRITING_SHORT") return "Viết ngắn";

        return type || "Dạng ôn tập";
    };

    const renderChildContent = (lessonId, childType) => {
        const data = getChildData(lessonId, childType);

        if (
            loadingChild &&
            expandedChild?.lessonId === lessonId &&
            expandedChild?.childType === childType
        ) {
            return (
                <div className="lesson-child-loading">
                    <span className="spinner-border spinner-border-sm text-primary me-2"></span>
                    Đang tải {getChildTitle(childType).toLowerCase()}...
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="lesson-child-empty">
                    Chưa có {getChildTitle(childType).toLowerCase()}.
                </div>
            );
        }

        if (childType === "videos") {
            return (
                <div className="lesson-child-list">
                    {data.map((video) => {
                        const isVideoCompleted = Boolean(video.isCompleted);

                        return (
                            <button
                                type="button"
                                className={
                                    isVideoCompleted
                                        ? "lesson-child-row completed"
                                        : "lesson-child-row"
                                }
                                key={video.videoId}
                                onClick={() => openPreviewModal("video", video)}
                            >
                                <div className="lesson-child-thumb">
                                    {video.thumbnailUrl ? (
                                        <img
                                            src={getFileUrl(video.thumbnailUrl)}
                                            alt={video.title}
                                        />
                                    ) : (
                                        <i className="bi bi-play-fill"></i>
                                    )}
                                </div>

                                <div className="flex-grow-1 text-start">
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <strong>{video.title || "Video chưa có tiêu đề"}</strong>

                                        {isVideoCompleted && (
                                            <span className="badge text-bg-success">
                                                Hoàn thành
                                            </span>
                                        )}
                                    </div>

                                    <span>
                                        Thời lượng: {formatDuration(video.durationSeconds)} · Thứ tự:{" "}
                                        {video.displayOrder || "--"}
                                    </span>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    {video.fileUrl && (
                                        <a
                                            href={getFileUrl(video.fileUrl)}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="video-material-download"
                                            title="Tải tài liệu"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <i className="bi bi-download"></i>
                                        </a>
                                    )}

                                    {isVideoCompleted ? (
                                        <i className="bi bi-check-circle text-success"></i>
                                    ) : (
                                        <i className="bi bi-play-circle text-primary"></i>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            );
        }

        if (childType === "vocabularies") {
            return (
                <div className="lesson-child-list">
                    {data.map((vocab) => (
                        <button
                            type="button"
                            className="lesson-child-row"
                            key={vocab.vocabularyId}
                            onClick={() => openPreviewModal("vocabulary", vocab)}
                        >
                            <div className="lesson-child-icon vocabulary">
                                <i className="bi bi-card-text"></i>
                            </div>

                            <div className="flex-grow-1 text-start">
                                <strong>{vocab.word || "Chưa có từ vựng"}</strong>
                                <span>
                                    {vocab.pronunciation || "--"} · {vocab.meaning || "--"}
                                </span>
                            </div>

                            <i className="bi bi-chevron-right text-muted"></i>
                        </button>
                    ))}
                </div>
            );
        }

        if (childType === "grammars") {
            return (
                <div className="lesson-child-list">
                    {data.map((grammar) => (
                        <button
                            type="button"
                            className="lesson-child-row"
                            key={grammar.grammarId}
                            onClick={() => openPreviewModal("grammar", grammar)}
                        >
                            <div className="lesson-child-icon grammar">
                                <i className="bi bi-journal-text"></i>
                            </div>

                            <div className="flex-grow-1 text-start">
                                <strong>{grammar.title || "Chưa có tiêu đề"}</strong>
                                <span>
                                    Cập nhật: {formatDate(grammar.updatedAt || grammar.createdAt)}
                                </span>
                            </div>

                            <i className="bi bi-chevron-right text-muted"></i>
                        </button>
                    ))}
                </div>
            );
        }

        if (childType === "practice") {
            return (
                <div className="lesson-child-list">
                    {data.map((config, index) => (
                        <button
                            type="button"
                            className={
                                config.isEnabled
                                    ? "lesson-child-row"
                                    : "lesson-child-row disabled-practice"
                            }
                            key={config.configId || index}
                            disabled={!config.isEnabled}
                            onClick={() => openPreviewModal("practice", config)}
                        >
                            <div className="lesson-child-icon practice">
                                <i className="bi bi-check2-circle"></i>
                            </div>

                            <div className="flex-grow-1 text-start">
                                <strong>
                                    {getPracticeTypeText(config.practiceType)}
                                </strong>

                                <span>
                                    {config.practiceType || "PRACTICE"} ·{" "}
                                    {config.questionCount || 0} câu hỏi
                                </span>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className={
                                        config.isEnabled
                                            ? "badge text-bg-success"
                                            : "badge text-bg-secondary"
                                    }
                                >
                                    {config.isEnabled ? "Đang mở" : "Đang khóa"}
                                </span>

                                <i className="bi bi-chevron-right text-muted"></i>
                            </div>
                        </button>
                    ))}
                </div>
            );
        }

        return null;
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
                <button
                    type="button"
                    className="breadcrumb-link"
                    onClick={() => navigate("/")}
                >
                    Trang chủ
                </button>

                <i className="bi bi-chevron-right"></i>

                <button
                    type="button"
                    className="breadcrumb-link"
                    onClick={() => navigate("/danh-sach-khoa-hoc")}
                >
                    Khóa học
                </button>

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
                            {!course.isEnrolled &&
                                <div className="student-course-price-main">
                                    {formatPrice(course.price)}
                                </div>
                            }
                            <div className="d-flex gap-2 flex-wrap mt-3">
                                {!course.isEnrolled && course.accessType === "FREE" &&

                                    <button
                                        className="btn btn-primary px-4"
                                        onClick={handleDangKy}
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
                                                Đăng ký ngay
                                            </>
                                        )}
                                    </button>


                                }
                                {!course.isEnrolled && course.accessType === "PAID" &&

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


                                }

                                {!course.isEnrolled && course.accessType === "PAID" &&

                                    <button
                                        className="btn btn-success px-4"
                                        onClick={handleThemVaoGio}
                                        disabled={addCard}
                                    >
                                        {addCard ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-cart-check me-1"></i>
                                                Thêm vào giỏ hàng
                                            </>
                                        )}
                                    </button>


                                }


                            </div>


                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mt-2">
                <div className="col-lg-8">
                    <ul className="nav student-course-tabs mb-1">
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


                        </div>
                    )}

                    {activeTab === "lessons" && (
                        <div className="student-course-card">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="mb-1">Danh sách nội dung khóa học</h5>
                                    <small className="text-muted">
                                        {course.isEnrolled
                                            ? "Bạn có thể học theo đúng thứ tự nội dung của khóa học."
                                            : "Bạn cần mua khóa học để mở khóa toàn bộ nội dung."}
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
                                    Đang tải nội dung khóa học...
                                </div>
                            ) : (
                                <div className="lesson-list-box">
                                    {lessons.map((item) => {
                                        const isExpanded = expandedItemId === item.courseItemId;
                                        const isLesson = item.type === "LESSON";
                                        const isExam = item.type === "EXAM";

                                        return (
                                            <div
                                                className={
                                                    item.locked
                                                        ? "student-content-wrapper locked"
                                                        : item.current
                                                            ? "student-content-wrapper current"
                                                            : "student-content-wrapper"
                                                }
                                                key={item.courseItemId}
                                            >
                                                <button
                                                    type="button"
                                                    className="student-lesson-item"
                                                    onClick={() => handleContentClick(item)}
                                                >
                                                    <div className="lesson-index">
                                                        {String(item.itemOrder || 0).padStart(2, "0")}
                                                    </div>

                                                    <div className="flex-grow-1 text-start">
                                                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                                            <strong>{item.title || "Chưa có tiêu đề"}</strong>

                                                            {isLesson && (
                                                                <span className="badge text-bg-primary">
                                                                    Bài học
                                                                </span>
                                                            )}



                                                            {item.freePreview && (
                                                                <span className="badge text-bg-info">
                                                                    Xem thử
                                                                </span>
                                                            )}

                                                            {item.current && !item.completed && !item.locked && (
                                                                <span className="badge text-bg-primary">
                                                                    Đang học
                                                                </span>
                                                            )}

                                                            {item.completed && (
                                                                <span className="badge text-bg-success">
                                                                    Hoàn thành
                                                                </span>
                                                            )}
                                                        </div>

                                                        <span>{item.description || "Chưa có mô tả."}</span>

                                                        {item.locked && (
                                                            <small className="d-block text-danger mt-1">
                                                                {item.lockReason || "Nội dung này đang bị khóa"}
                                                            </small>
                                                        )}
                                                    </div>

                                                    <div className="lesson-meta">
                                                        {item.locked ? (
                                                            <i className="bi bi-lock"></i>
                                                        ) : item.completed ? (
                                                            <i className="bi bi-check-circle text-success"></i>
                                                        ) : isExam ? (
                                                            <i className="bi bi-clipboard-check text-warning"></i>
                                                        ) : isExpanded ? (
                                                            <i className="bi bi-chevron-up text-primary"></i>
                                                        ) : (
                                                            <i className="bi bi-chevron-down text-primary"></i>
                                                        )}
                                                    </div>
                                                </button>

                                                {isLesson && isExpanded && !item.locked && (
                                                    <div className="lesson-tree-wrapper">
                                                        {[
                                                            {
                                                                type: "videos",
                                                                title: "Video bài giảng",
                                                                description: "Xem các video hướng dẫn của bài học",
                                                                icon: "bi-play-circle",
                                                                colorClass: "video",
                                                            },
                                                            {
                                                                type: "vocabularies",
                                                                title: "Từ vựng",
                                                                description: "Học từ vựng thuộc bài học này",
                                                                icon: "bi-card-text",
                                                                colorClass: "vocabulary",
                                                            },
                                                            {
                                                                type: "grammars",
                                                                title: "Ngữ pháp",
                                                                description: "Xem phần ngữ pháp của bài học",
                                                                icon: "bi-journal-text",
                                                                colorClass: "grammar",
                                                            },
                                                            {
                                                                type: "practice",
                                                                title: "Bài ôn tập",
                                                                description: "Luyện tập để hoàn thành bài học",
                                                                icon: "bi-check2-circle",
                                                                colorClass: "practice",
                                                            },
                                                        ].map((child) => {
                                                            const isChildExpanded =
                                                                expandedChild?.lessonId === item.id &&
                                                                expandedChild?.childType === child.type;

                                                            return (
                                                                <div
                                                                    className={
                                                                        isChildExpanded
                                                                            ? "lesson-tree-row-wrapper active"
                                                                            : "lesson-tree-row-wrapper"
                                                                    }
                                                                    key={child.type}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="lesson-tree-row"
                                                                        onClick={(e) =>
                                                                            handleLessonChildClick(e, item.id, child.type)
                                                                        }
                                                                    >
                                                                        <div className={`lesson-tree-icon ${child.colorClass}`}>
                                                                            <i className={`bi ${child.icon}`}></i>
                                                                        </div>

                                                                        <div className="flex-grow-1 text-start">
                                                                            <strong>{child.title}</strong>
                                                                            <span>{child.description}</span>
                                                                        </div>

                                                                        <i
                                                                            className={
                                                                                isChildExpanded
                                                                                    ? "bi bi-chevron-up text-primary"
                                                                                    : "bi bi-chevron-down text-muted"
                                                                            }
                                                                        ></i>
                                                                    </button>

                                                                    {isChildExpanded && (
                                                                        <div className="lesson-child-panel">
                                                                            {renderChildContent(item.id, child.type)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {course?.isEnrolled && (
                                        <CertificateSection
                                            courseId={Number(courseId)}
                                            courseTitle={course?.title}
                                            isEnrolled={course?.isEnrolled}
                                            lessons={lessons}
                                        />
                                    )}

                                    {lessons.length === 0 && (
                                        <div className="text-center text-muted py-4">
                                            Khóa học chưa có nội dung.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div className="course-review-section compact">
                            <div className="review-shop-header">
                                <div className="review-shop-score">
                                    <div className="score-number">
                                        {course.rating || 0}
                                        <span>/5</span>
                                    </div>

                                    <div className="score-stars">
                                        {"★★★★★".slice(0, Math.round(Number(course.rating || 0)))}
                                        <span>
                                            {"★★★★★".slice(Math.round(Number(course.rating || 0)))}
                                        </span>
                                    </div>

                                    <p>{reviews.length} đánh giá</p>
                                </div>

                                <div className="review-shop-info">
                                    <h4>Đánh giá của học viên</h4>
                                    <p>Nhận xét thực tế từ những học viên đã tham gia khóa học.</p>

                                    <div className="review-summary-note">
                                        <i className="bi bi-shield-check"></i>
                                        Đánh giá đến từ học viên đã mua hoặc tham gia khóa học.
                                    </div>
                                </div>
                            </div>

                            {course.isEnrolled ? (
                                <form className="review-shop-form" onSubmit={handleSubmitReview}>
                                    <div className="review-form-title">
                                        <i className="bi bi-pencil-square"></i>

                                        <div>
                                            <h5>Viết đánh giá của bạn</h5>
                                            <p>Chia sẻ cảm nhận để giúp học viên khác chọn khóa học phù hợp.</p>
                                        </div>
                                    </div>

                                    <div className="review-form-group">
                                        <label>Số sao</label>

                                        <select
                                            value={reviewRating}
                                            onChange={(e) => setReviewRating(e.target.value)}
                                        >
                                            <option value="5">★★★★★ - Rất tốt</option>
                                            <option value="4">★★★★☆ - Tốt</option>
                                            <option value="3">★★★☆☆ - Bình thường</option>
                                            <option value="2">★★☆☆☆ - Chưa tốt</option>
                                            <option value="1">★☆☆☆☆ - Tệ</option>
                                        </select>
                                    </div>

                                    <div className="review-form-group">
                                        <label>Nhận xét</label>

                                        <textarea
                                            rows="4"
                                            placeholder="Bạn thấy khóa học này như thế nào?"
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div className="review-form-action">
                                        <button className="review-submit-btn" disabled={submittingReview}>
                                            {submittingReview ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                "Gửi đánh giá"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="review-login-box compact">
                                    <i className="bi bi-lock"></i>
                                    <span>Bạn cần mua khóa học để có thể gửi đánh giá.</span>
                                </div>
                            )}

                            <div className="review-shop-list">
                                <div className="review-list-heading">
                                    <h5>Nhận xét từ học viên</h5>
                                    <span>{reviews.length} đánh giá</span>
                                </div>

                                {loadingReviews ? (
                                    <div className="review-empty compact">
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Đang tải đánh giá...
                                    </div>
                                ) : reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div className="review-shop-item" key={review.reviewId}>
                                            <div className="review-avatar">
                                                {review.fullName?.charAt(0)?.toUpperCase() || "U"}
                                            </div>

                                            <div className="review-item-body">
                                                <div className="review-item-top">
                                                    <div>
                                                        <h6>{review.fullName || "Học viên"}</h6>

                                                        <div className="review-stars">
                                                            {"★★★★★".slice(0, Number(review.rating || 0))}
                                                            <span>
                                                                {"★★★★★".slice(Number(review.rating || 0))}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <small>{review.createdAt || "--"}</small>
                                                </div>

                                                <p>{review.comment || "Không có nội dung đánh giá."}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="review-empty compact">
                                        <i className="bi bi-chat-dots"></i>
                                        <h6>Chưa có đánh giá nào</h6>
                                        <p>Hãy là người đầu tiên chia sẻ cảm nhận về khóa học này.</p>
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


                </div>
            </div>

            {previewModal.open && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(15, 23, 42, 0.55)",
                    }}
                    tabIndex="-1"
                >
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 rounded-4">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {previewModal.type === "video" && "Video bài giảng"}
                                    {previewModal.type === "vocabulary" && "Chi tiết từ vựng"}
                                    {previewModal.type === "grammar" && "Chi tiết ngữ pháp"}
                                    {previewModal.type === "practice" && "Chi tiết câu hỏi"}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closePreviewModal}
                                ></button>
                            </div>

                            <div className="modal-body">
                                {previewModal.type === "video" && previewModal.data && (
                                    <div>
                                        <h5 className="fw-bold mb-3">
                                            {previewModal.data.title}
                                        </h5>

                                        <video
                                            ref={videoRef}
                                            className="w-100 rounded-3 bg-dark"
                                            style={{ maxHeight: 520 }}
                                            controls
                                            poster={
                                                previewModal.data.thumbnailUrl
                                                    ? getFileUrl(previewModal.data.thumbnailUrl)
                                                    : undefined
                                            }
                                            onPlay={() => {
                                                startAutoSaveVideoProgress(previewModal.data);
                                            }}
                                            onPause={() => {
                                                if (previewModal.data && videoRef.current) {
                                                    saveVideoProgress(
                                                        previewModal.data.videoId,
                                                        videoRef.current.currentTime
                                                    );
                                                }

                                                clearAutoSaveVideoProgress();
                                            }}
                                            onEnded={async () => {
                                                if (!previewModal.data || !videoRef.current) {
                                                    return;
                                                }

                                                const currentVideoId = previewModal.data.videoId;
                                                const watchedSeconds =
                                                    videoRef.current.duration || videoRef.current.currentTime;

                                                const result = await saveVideoProgress(
                                                    currentVideoId,
                                                    watchedSeconds
                                                );

                                                if (result?.videoCompleted) {
                                                    markVideoCompletedLocal(currentVideoId, watchedSeconds);
                                                }

                                                if (result?.shouldReloadLessons) {
                                                    await loadLessons();
                                                }

                                                clearAutoSaveVideoProgress();
                                            }}
                                        >
                                            <source src={getFileUrl(previewModal.data.videoUrl)} />
                                            Trình duyệt của bạn không hỗ trợ video.
                                        </video>

                                        <div className="text-muted small mt-3">
                                            Thời lượng:{" "}
                                            {formatDuration(previewModal.data.durationSeconds)} · Ngày tạo:{" "}
                                            {formatDate(previewModal.data.createdAt)}
                                        </div>
                                    </div>
                                )}

                                {previewModal.type === "vocabulary" && previewModal.data && (
                                    <div>
                                        <h4 className="fw-bold mb-2">
                                            {previewModal.data.word}
                                        </h4>

                                        <div className="text-muted mb-3">
                                            {previewModal.data.pronunciation || "Chưa có phiên âm"}
                                        </div>

                                        <div className="border rounded-3 p-3 mb-3">
                                            <div className="text-muted small">Nghĩa</div>
                                            <strong>{previewModal.data.meaning || "--"}</strong>
                                        </div>

                                        <div className="border rounded-3 p-3">
                                            <div className="text-muted small">Ví dụ</div>
                                            <p className="mb-0">
                                                {previewModal.data.exampleSentence || "Chưa có câu ví dụ."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {previewModal.type === "grammar" && previewModal.data && (
                                    <div>
                                        <h4 className="fw-bold mb-3">
                                            {previewModal.data.title}
                                        </h4>

                                        {previewModal.data.contentHtml ? (
                                            <div
                                                className="course-html-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: previewModal.data.contentHtml,
                                                }}
                                            ></div>
                                        ) : (
                                            <p className="text-muted mb-0">
                                                Chưa có nội dung ngữ pháp.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {previewModal.type === "practice" && previewModal.data && (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span
                                                className={
                                                    previewModal.data.isEnabled
                                                        ? "badge text-bg-success"
                                                        : "badge text-bg-secondary"
                                                }
                                            >
                                                {previewModal.data.isEnabled ? "Đang mở" : "Đang khóa"}
                                            </span>

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={lichSuLamBaiOnTap}
                                                disabled={!previewModal.data.soLanLam}
                                            >
                                                <i className="bi bi-clock-history me-1"></i>
                                                Lịch sử làm bài
                                            </button>
                                        </div>

                                        <h4 className="fw-bold mb-2">
                                            {getPracticeTypeText(previewModal.data.practiceType)}
                                        </h4>

                                        <div className="text-muted mb-4">
                                            {previewModal.data.practiceType}
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <div className="border rounded-3 p-3 h-100">
                                                    <div className="text-muted small">Số câu hỏi</div>
                                                    <strong>{previewModal.data.questionCount || 0} câu hỏi</strong>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="border rounded-3 p-3 h-100">
                                                    <div className="text-muted small">Số lần làm</div>
                                                    <strong>{previewModal.data.soLanLam || 0} lần</strong>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="border rounded-3 p-3 h-100">
                                                    <div className="text-muted small">Điểm cao nhất</div>
                                                    <strong>{formatScore(previewModal.data.diemCaoNhat)}</strong>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="border rounded-3 p-3 h-100">
                                                    <div className="text-muted small">Lần làm gần nhất</div>
                                                    <strong>{formatDateTime(previewModal.data.lanCuoi)}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {showAttemptHistory && (
                                            <div className="border rounded-3 p-3 mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="fw-bold mb-0">
                                                        <i className="bi bi-clock-history me-1"></i>
                                                        Lịch sử làm bài
                                                    </h6>

                                                    <button
                                                        type="button"
                                                        className="btn-close"
                                                        aria-label="Close"
                                                        onClick={() => setShowAttemptHistory(false)}
                                                    ></button>
                                                </div>

                                                {loadingAttemptHistory ? (
                                                    <div className="text-muted small">
                                                        Đang tải lịch sử làm bài...
                                                    </div>
                                                ) : attemptHistories.length === 0 ? (
                                                    <div className="text-muted small">
                                                        Chưa có lần làm bài nào.
                                                    </div>
                                                ) : (
                                                    <div className="table-responsive">
                                                        <table className="table table-sm table-bordered align-middle mb-0">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th style={{ width: "60px" }}>#</th>
                                                                    <th>Bắt đầu</th>
                                                                    <th>Nộp bài</th>
                                                                    <th>Điểm</th>
                                                                    <th>Số câu đúng</th>
                                                                    <th class="text-center">Hành động</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {attemptHistories.map((attempt, index) => (
                                                                    <tr key={attempt.attemptId || index}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{formatDateTime(attempt.startedAt)}</td>
                                                                        <td>{formatDateTime(attempt.submittedAt)}</td>
                                                                        <td>
                                                                            <strong>{formatScore(attempt.score)}</strong>
                                                                        </td>
                                                                        <td>
                                                                            <span className="badge text-bg-light">
                                                                                {attempt.totalCorrect || "0"}
                                                                            </span>
                                                                        </td>

                                                                        <td class="text-center">
                                                                            <button class="btn btn-primary"
                                                                                onClick={() => handleViewDetail(attempt.attemptId)}
                                                                            >Xem</button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={
                                                !previewModal.data.isEnabled ||
                                                !previewModal.data.questionCount
                                            }
                                            onClick={() => {
                                                navigate(
                                                    `/khoa-hoc/${courseId}/lessons/${previewModal.data.lessonId}/practice/${previewModal.data.practiceType}`
                                                );
                                            }}
                                        >
                                            <i className="bi bi-play-circle me-1"></i>
                                            Bắt đầu ôn tập
                                        </button>
                                    </div>
                                )}

                                {previewModal.type === "exam" && (
    <div>
        {loadingExamDetail || !previewModal.data ? (
            <div className="text-center py-4">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="text-muted">Đang tải thông tin bài thi...</div>
            </div>
        ) : (
            <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge text-bg-warning">
                        Bài thi
                    </span>

                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={lichSuThi}
                    >
                        <i className="bi bi-clock-history me-1"></i>
                        Lịch sử thi
                    </button>
                </div>

                <h4 className="fw-bold mb-2">
                    {previewModal.data.title ||
                        previewModal.data.examTitle ||
                        previewModal.data.name ||
                        "Bài thi"}
                </h4>

                <div className="text-muted mb-4">
                    {previewModal.data.description ||
                        "Bạn hãy kiểm tra thông tin bài thi trước khi bắt đầu."}
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small">Số câu hỏi</div>
                            <strong>{previewModal.data.questionCount || 0} câu hỏi</strong>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small">Số lần thi</div>
                            <strong>{previewModal.data.soLanLam || 0} lần</strong>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small">Điểm cao nhất</div>
                            <strong>{formatScore(previewModal.data.diemCaoNhat)}</strong>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="border rounded-3 p-3 h-100">
                            <div className="text-muted small">Lần thi gần nhất</div>
                            <strong>{formatDateTime(previewModal.data.lanCuoi)}</strong>
                        </div>
                    </div>

                    {(previewModal.data.durationMinutes || previewModal.data.duration) && (
                        <div className="col-md-6">
                            <div className="border rounded-3 p-3 h-100">
                                <div className="text-muted small">Thời gian làm bài</div>
                                <strong>
                                    {previewModal.data.durationMinutes ||
                                        previewModal.data.duration} phút
                                </strong>
                            </div>
                        </div>
                    )}
                </div>

                {showAttemptHistory && (
                    <div className="border rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0">
                                <i className="bi bi-clock-history me-1"></i>
                                Lịch sử thi
                            </h6>

                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => setShowAttemptHistory(false)}
                            ></button>
                        </div>

                        {loadingAttemptHistory ? (
                            <div className="text-muted small">
                                Đang tải lịch sử thi...
                            </div>
                        ) : attemptHistories.length === 0 ? (
                            <div className="text-muted small">
                                Chưa có lần thi nào.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: "60px" }}>#</th>
                                            <th>Bắt đầu</th>
                                            <th>Nộp bài</th>
                                            <th>Điểm</th>
                                            <th>Số câu đúng</th>
                                            <th className="text-center">Hành động</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {attemptHistories.map((attempt, index) => (
                                            <tr key={attempt.attemptId || index}>
                                                <td>{index + 1}</td>

                                                <td>{formatDateTime(attempt.startedAt)}</td>

                                                <td>{formatDateTime(attempt.submittedAt)}</td>

                                                <td>
                                                    <strong>{formatScore(attempt.score)}</strong>
                                                </td>

                                                <td>
                                                    <span className="badge text-bg-light">
                                                        {attempt.totalCorrect || "0"}
                                                    </span>
                                                </td>

                                                <td className="text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() =>
                                                            handleViewDetail(attempt.attemptId)
                                                        }
                                                    >
                                                        <i className="bi bi-eye me-1"></i>
                                                        Xem
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        const examId = previewModal.data.examId || previewModal.data.id;

                        setPreviewModal({
                            open: false,
                            type: "",
                            data: null,
                        });

                        navigate(`/exams/${examId}`);
                    }}
                >
                    <i className="bi bi-play-circle me-1"></i>
                    Bắt đầu làm bài
                </button>
            </>
        )}
    </div>
)}


                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentCourseDetail;
