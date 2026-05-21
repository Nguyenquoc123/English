import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePersonalPractice.css";

function CreatePersonalPractice() {
    const API_BASE = "http://localhost:8080";
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [type, setType] = useState("MULTIPLE_CHOICE");
    const [questionLimit, setQuestionLimit] = useState(5);
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createdPractice, setCreatedPractice] = useState(null);

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    const getUserId = () => {
        return localStorage.getItem("userId");
    };

    const getPracticeTypeText = (value) => {
        if (value === "MULTIPLE_CHOICE") return "Trắc nghiệm";
        if (value === "LISTENING_CHOICE") return "Nghe chọn đáp án";
        if (value === "LISTENING_FILL_BLANK") return "Nghe điền từ";
        if (value === "ARRANGE_SENTENCE") return "Sắp xếp câu";
        if (value === "WRITING_SHORT") return "Viết ngắn";
        return value;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setCreatedPractice(null);

        if (!title.trim()) {
            setError("Vui lòng nhập tên bài ôn tập.");
            return;
        }

        if (!description.trim()) {
            setError("Vui lòng nhập mô tả nội dung câu hỏi.");
            return;
        }

        if (!questionLimit || Number(questionLimit) <= 0) {
            setError("Số lượng câu hỏi phải lớn hơn 0.");
            return;
        }

        const token = getToken();
        const userId = getUserId();

        if (!token) {
            alert("Bạn cần đăng nhập để tạo bài ôn tập.");
            navigate("/dang-nhap");
            return;
        }

        

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE}/personal-practices/ai-generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: title.trim(),
                        type,
                        questionLimit: Number(questionLimit),
                        description: description.trim(),
                    }),
                }
            );

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
                setError(data?.message || data?.error || "Tạo bài ôn tập thất bại.");
                return;
            }

            const result = data?.result || data?.data || data;
            setCreatedPractice(result);

            alert("Tạo bài ôn tập thành công!");
            navigate("/personal-practices");
        } catch (err) {
            console.error("Lỗi tạo bài ôn tập:", err);
            setError("Lỗi kết nối server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container personal-practice-page">
            <div className="personal-practice-card">
                <div className="practice-card-header">
                    <div className="practice-header-icon">
                        <i className="bi bi-magic"></i>
                    </div>

                    <div>
                        <h3>Tạo bài ôn tập cá nhân bằng AI</h3>
                        <p>
                            Nhập nội dung bạn muốn luyện tập, AI sẽ tự tạo câu hỏi phù hợp.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="practice-alert error">
                        <i className="bi bi-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                <form className="personal-practice-form" onSubmit={handleSubmit}>
                    <div className="practice-form-group">
                        <label>Tên bài ôn tập</label>

                        <div className="practice-input-icon">
                            
                            <input
                                type="text"
                                placeholder="Nhập tên bài ôn tập, ví dụ: Ôn tập Unit 1"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="practice-form-group">
                        <label>Dạng ôn tập</label>

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                            {/* <option value="LISTENING_CHOICE">Nghe chọn đáp án</option> */}
                            {/* <option value="LISTENING_FILL_BLANK">Nghe điền từ</option> */}
                            <option value="ARRANGE_SENTENCE">Sắp xếp câu</option>
                            {/* <option value="WRITING_SHORT">Viết ngắn</option> */}
                        </select>
                    </div>

                    <div className="practice-form-group">
                        <label>Số lượng câu hỏi</label>

                        <input
                            type="number"
                            min="1"
                            max="30"
                            placeholder="Số lượng, ví dụ: 10"
                            value={questionLimit}
                            onChange={(e) => setQuestionLimit(e.target.value)}
                        />

                        <small>Nên tạo từ 5 đến 20 câu để AI trả lời ổn định hơn.</small>
                    </div>

                    <div className="practice-form-group">
                        <label>Mô tả nội dung câu hỏi</label>

                        <textarea
                            rows="6"
                            placeholder="Ví dụ: Tạo câu hỏi ôn tập về thì hiện tại hoàn thành, mức độ A2, có giải thích bằng tiếng Việt."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="practice-form-actions">
                        <button
                            type="button"
                            className="practice-back-btn"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Quay lại
                        </button>

                        <button
                            type="submit"
                            className="practice-create-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    AI đang tạo câu hỏi...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-stars"></i>
                                    Tạo bài ôn tập
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            
        </div>
    );
}

export default CreatePersonalPractice;