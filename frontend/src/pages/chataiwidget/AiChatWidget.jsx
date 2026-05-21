import { useEffect, useRef, useState } from "react";
import "./AiChatWidget.css";

function AiChatWidget() {
    const API_BASE = "http://localhost:8080";

    const [open, setOpen] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: "ai",
            content:
                "Xin chào! Mình là trợ lý AI học tiếng Anh. Bạn có thể hỏi mình về từ vựng, ngữ pháp, dịch câu hoặc xin ví dụ.",
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

    const handleClearChat = () => {
        setMessages([
            {
                role: "ai",
                content: "Mình đã làm mới cuộc trò chuyện. Bạn muốn hỏi gì về tiếng Anh?",
            },
        ]);
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

            const response = await fetch(`${API_BASE}/chatbot/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    userMessage: message,
                }),
            });

            let data = null;
            const text = await response.text();

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = null;
                }
            }

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

            const result = data?.result || data?.data || data;

            const aiText =
                result?.aiResponse ||
                result?.response ||
                result?.answer ||
                "Mình chưa có câu trả lời phù hợp cho câu hỏi này.";

            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: aiText,
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
                                <h5>AI English Assistant</h5>
                                <p>Tra từ, hỏi ngữ pháp, dịch câu</p>
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

                    <div className="ai-widget-suggestions">
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

                                <div
                                    className={
                                        message.isError
                                            ? "ai-widget-bubble error"
                                            : "ai-widget-bubble"
                                    }
                                >
                                    {message.content}
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
                            placeholder="Hỏi AI điều gì đó..."
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