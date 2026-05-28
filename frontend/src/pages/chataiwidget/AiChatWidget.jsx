import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFileUrl } from "../../utils/fileurl.js";
import "./AiChatWidget.css";

function AiChatWidget() {
    const API_BASE = "http://localhost:8080";

    const navigate = useNavigate();

    const CHAT_MODE = {
        LEARNING: "learning",
        COURSE: "course",
    };

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState(CHAT_MODE.LEARNING);

    const [messages, setMessages] = useState([
        {
            role: "ai",
            content:
                "Xin chào! Mình là trợ lý AI học tiếng Anh. Bạn có thể hỏi mình về từ vựng, ngữ pháp, dịch câu hoặc chọn chế độ gợi ý khóa học phù hợp.",
        },
    ]);

    const [userMessage, setUserMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    useEffect(() => {
        if (open) {
            scrollToBottom();
        }
    }, [messages, loading, open]);

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 80);
    };

    const handleQuickQuestion = (text) => {
        setUserMessage(text);
    };

    const getModeTitle = () => {
        if (mode === CHAT_MODE.LEARNING) {
            return "AI English Assistant";
        }

        return "AI Course Advisor";
    };

    const getModeSubtitle = () => {
        if (mode === CHAT_MODE.LEARNING) {
            return "Tra từ, hỏi ngữ pháp, dịch câu";
        }

        return "Gợi ý khóa học theo nhu cầu";
    };

    const getWelcomeMessage = (selectedMode) => {
        if (selectedMode === CHAT_MODE.LEARNING) {
            return "Mình đang ở chế độ chatbot học tập. Bạn có thể hỏi về từ vựng, ngữ pháp, dịch câu hoặc nhờ mình sửa lỗi tiếng Anh.";
        }

        return "Mình đang ở chế độ gợi ý khóa học. Hãy mô tả trình độ, ngân sách, mục tiêu học và thời gian bạn muốn học.";
    };

    const handleChangeMode = (selectedMode) => {
        if (selectedMode === mode) {
            return;
        }

        setMode(selectedMode);
        setUserMessage("");
        setMessages([
            {
                role: "ai",
                content: getWelcomeMessage(selectedMode),
            },
        ]);
    };

    const handleClearChat = () => {
        setMessages([
            {
                role: "ai",
                content: getWelcomeMessage(mode),
            },
        ]);
    };

    const parseResponseBody = async (response) => {
        const text = await response.text();

        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    };

    const normalizeLearningResponse = (data) => {
        const result = data?.result || data?.data || data;

        return (
            result?.aiResponse ||
            result?.response ||
            result?.answer ||
            result?.message ||
            "Mình chưa có câu trả lời phù hợp cho câu hỏi này."
        );
    };

    const normalizeCourseResponse = (data) => {
        const result = data?.result || data?.data || data;

        return {
            message:
                result?.message ||
                result?.aiResponse ||
                result?.response ||
                result?.answer ||
                "Mình đã tìm một số khóa học có thể phù hợp với bạn.",
            courses:
                result?.courses ||
                result?.recommendedCourses ||
                result?.recommendations ||
                [],
        };
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const message = userMessage.trim();

        if (!message || loading) {
            return;
        }

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: message,
            },
        ]);

        setUserMessage("");
        setLoading(true);

        try {
            const token = getToken();

            const endpoint =
                mode === CHAT_MODE.LEARNING
                    ? `${API_BASE}/chatbot/ask`
                    : `${API_BASE}/chatbot/recommend-courses`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    userMessage: message,
                }),
            });

            const data = await parseResponseBody(response);

            if (!response.ok) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "ai",
                        content:
                            data?.message ||
                            data?.error ||
                            "AI hiện chưa thể trả lời. Vui lòng thử lại sau.",
                        isError: true,
                    },
                ]);
                return;
            }

            if (mode === CHAT_MODE.LEARNING) {
                const aiText = normalizeLearningResponse(data);

                setMessages((prev) => [
                    ...prev,
                    {
                        role: "ai",
                        content: aiText,
                    },
                ]);

                return;
            }

            const courseResult = normalizeCourseResponse(data);

            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: courseResult.message,
                    courses: courseResult.courses,
                },
            ]);
        } catch (error) {
            console.error("Lỗi gửi tin nhắn AI:", error);

            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: "Lỗi kết nối server. Vui lòng kiểm tra lại backend.",
                    isError: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined || price === "") {
            return "Chưa cập nhật";
        }

        const numberPrice = Number(price);

        if (Number.isNaN(numberPrice)) {
            return price;
        }

        if (numberPrice === 0) {
            return "Miễn phí";
        }

        return `${numberPrice.toLocaleString("vi-VN")} VNĐ`;
    };

    

    const handleViewCourse = (courseId) => {
        if (!courseId) {
            return;
        }

        navigate(`/courses/${courseId}`);
    };

    const renderQuickQuestions = () => {
        if (mode === CHAT_MODE.LEARNING) {
            return (
                <>
                    <button
                        type="button"
                        onClick={() =>
                            handleQuickQuestion("Giải thích từ achievement và cho 3 ví dụ.")
                        }
                    >
                        Tra từ
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleQuickQuestion("Khi nào dùng present perfect?")
                        }
                    >
                        Ngữ pháp
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleQuickQuestion("Dịch câu: Tôi đang học tiếng Anh mỗi ngày.")
                        }
                    >
                        Dịch câu
                    </button>
                </>
            );
        }

        return (
            <>
                <button
                    type="button"
                    onClick={() =>
                        handleQuickQuestion(
                            "Tôi mất gốc tiếng Anh, ngân sách khoảng 500k, muốn học giao tiếp để đi làm."
                        )
                    }
                >
                    Mất gốc
                </button>

                <button
                    type="button"
                    onClick={() =>
                        handleQuickQuestion(
                            "Tôi muốn học tiếng Anh giao tiếp công việc, trình độ cơ bản."
                        )
                    }
                >
                    Giao tiếp
                </button>

                <button
                    type="button"
                    onClick={() =>
                        handleQuickQuestion(
                            "Tôi cần khóa luyện ngữ pháp nền tảng, học phí càng thấp càng tốt."
                        )
                    }
                >
                    Ngữ pháp
                </button>
            </>
        );
    };

    const renderCourseCards = (courses) => {
        if (!courses || courses.length === 0) {
            return null;
        }

        return (
            <div className="ai-course-list">
                {courses.map((course, index) => {
                    const courseId = course.courseId || course.id;
                    const title = course.title || course.courseName || "Khóa học";
                    const shortDescription =
                        course.shortDescription ||
                        course.description ||
                        "Chưa có mô tả ngắn.";
                    const levelName =
                        course.levelName ||
                        course.level?.levelName ||
                        course.level ||
                        "Chưa cập nhật";
                    const price = course.price;
                    const thumbnailUrl = course.thumbnailUrl;
                    const matchScore = course.matchScore || course.score;
                    const reason = course.reason || course.matchReason;
                    const courseType = course.courseType;

                    return (
                        <div key={courseId || index} className="ai-course-card">
                            <div className="ai-course-image-wrap">
                                <img
                                    src={getFileUrl(thumbnailUrl)}
                                    alt={title}
                                    className="ai-course-image"
                                    onError={(e) => {
                                        e.currentTarget.src = "/default-course-thumbnail.png";
                                    }}
                                />

                                {matchScore !== undefined && matchScore !== null && (
                                    <div className="ai-course-match-badge">
                                        {matchScore}% phù hợp
                                    </div>
                                )}
                            </div>

                            <div className="ai-course-content">
                                <div className="ai-course-badges">
                                    <span className="ai-course-level-badge">
                                        {levelName}
                                    </span>

                                    {courseType && (
                                        <span
                                            className={
                                                courseType === "FREE"
                                                    ? "ai-course-type-badge free"
                                                    : "ai-course-type-badge paid"
                                            }
                                        >
                                            {courseType === "FREE" ? "FREE" : "PAID"}
                                        </span>
                                    )}
                                </div>

                                <h6 className="ai-course-title">{title}</h6>

                                <p className="ai-course-description">
                                    {shortDescription}
                                </p>

                                {reason && (
                                    <div className="ai-course-reason">
                                        <span>Lý do phù hợp</span>
                                        <p>{reason}</p>
                                    </div>
                                )}

                                <div className="ai-course-footer">
                                    <div className="ai-course-price">
                                        {formatPrice(price)}
                                    </div>

                                    <button
                                        type="button"
                                        className="ai-course-detail-btn"
                                        onClick={() => handleViewCourse(courseId)}
                                        disabled={!courseId}
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const inputPlaceholder =
        mode === CHAT_MODE.LEARNING
            ? "Hỏi AI về từ vựng, ngữ pháp, dịch câu..."
            : "Mô tả trình độ, ngân sách, mục tiêu học của bạn...";

    return (
        <>
            {!open && (
                <button
                    type="button"
                    className="ai-floating-button"
                    onClick={() => setOpen(true)}
                    title="Chat với AI"
                >
                    <i className="bi bi-robot"></i>
                    <span className="ai-floating-dot"></span>
                </button>
            )}

            {open && (
                <div className="ai-widget-panel">
                    <div className="ai-widget-header">
                        <div className="ai-widget-title">
                            <div className="ai-widget-avatar">
                                <i className="bi bi-robot"></i>
                            </div>

                            <div>
                                <h5>{getModeTitle()}</h5>
                                <p>{getModeSubtitle()}</p>
                            </div>
                        </div>

                        <div className="ai-widget-actions">
                            <button
                                type="button"
                                className="ai-widget-icon-btn"
                                onClick={handleClearChat}
                                title="Xóa chat"
                            >
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>

                            <button
                                type="button"
                                className="ai-widget-icon-btn"
                                onClick={() => setOpen(false)}
                                title="Đóng"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>

                    <div className="ai-widget-mode-tabs">
                        <button
                            type="button"
                            className={
                                mode === CHAT_MODE.LEARNING
                                    ? "ai-widget-mode-tab active"
                                    : "ai-widget-mode-tab"
                            }
                            onClick={() => handleChangeMode(CHAT_MODE.LEARNING)}
                        >
                            <i className="bi bi-chat-dots"></i>
                            Hỏi tiếng Anh
                        </button>

                        <button
                            type="button"
                            className={
                                mode === CHAT_MODE.COURSE
                                    ? "ai-widget-mode-tab active"
                                    : "ai-widget-mode-tab"
                            }
                            onClick={() => handleChangeMode(CHAT_MODE.COURSE)}
                        >
                            <i className="bi bi-mortarboard"></i>
                            Gợi ý khóa học
                        </button>
                    </div>

                    <div className="ai-widget-suggestions">
                        {renderQuickQuestions()}
                    </div>

                    <div className="ai-widget-body">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={
                                    message.role === "user"
                                        ? "ai-widget-message user"
                                        : "ai-widget-message ai"
                                }
                            >
                                {message.role === "ai" && (
                                    <div className="ai-widget-message-avatar">
                                        <i className="bi bi-robot"></i>
                                    </div>
                                )}

                                <div className="ai-widget-message-content">
                                    <div
                                        className={
                                            message.isError
                                                ? "ai-widget-bubble error"
                                                : "ai-widget-bubble"
                                        }
                                    >
                                        {message.content}
                                    </div>

                                    {message.role === "ai" &&
                                        renderCourseCards(message.courses)}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-widget-message ai">
                                <div className="ai-widget-message-avatar">
                                    <i className="bi bi-robot"></i>
                                </div>

                                <div className="ai-widget-bubble typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef}></div>
                    </div>

                    <form className="ai-widget-form" onSubmit={handleSendMessage}>
                        <textarea
                            rows="1"
                            placeholder={inputPlaceholder}
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        ></textarea>

                        <button type="submit" disabled={loading || !userMessage.trim()}>
                            {loading ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                <i className="bi bi-send-fill"></i>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}

export default AiChatWidget;