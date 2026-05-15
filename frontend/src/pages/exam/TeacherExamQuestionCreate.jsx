import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherExamQuestionCreate.css";

function TeacherExamQuestionCreate() {
    const navigate = useNavigate();
    const { examId } = useParams();

    const API_BASE = "http://localhost:8080";

    const QUESTION_TYPES = [
        {
            value: "MULTIPLE_CHOICE",
            label: "Trắc nghiệm",
            description: "Câu hỏi có nhiều đáp án, học viên chọn 1 đáp án đúng.",
            icon: "bi-ui-checks-grid",
        },
        {
            value: "LISTENING_CHOICE",
            label: "Nghe chọn đáp án",
            description: "Học viên nghe audio và chọn đáp án đúng.",
            icon: "bi-volume-up",
        },
        {
            value: "LISTENING_FILL_BLANK",
            label: "Nghe điền từ",
            description: "Học viên nghe audio và nhập đáp án còn thiếu.",
            icon: "bi-soundwave",
        },
        {
            value: "ARRANGE_SENTENCE",
            label: "Sắp xếp câu",
            description: "Học viên sắp xếp các từ thành câu đúng.",
            icon: "bi-shuffle",
        },
        {
            value: "WRITING_SHORT",
            label: "Viết ngắn",
            description: "Học viên nhập câu trả lời ngắn.",
            icon: "bi-pencil-square",
        },
    ];

    const [mode, setMode] = useState("NEW");
    const [questionType, setQuestionType] = useState("MULTIPLE_CHOICE");

    const [content, setContent] = useState("");
    const [correctText, setCorrectText] = useState("");
    const [explanation, setExplanation] = useState("");
    const [defaultPoint, setDefaultPoint] = useState(1);

    const [point, setPoint] = useState(1);


    const [mediaFile, setMediaFile] = useState(null);
    const [mediaFileName, setMediaFileName] = useState("");

    const [options, setOptions] = useState([
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
    ]);

    const [existingQuestions, setExistingQuestions] = useState([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const selectedQuestionType = useMemo(() => {
        return QUESTION_TYPES.find((item) => item.value === questionType);
    }, [questionType]);

    const isChoiceType =
        questionType === "MULTIPLE_CHOICE" || questionType === "LISTENING_CHOICE";

    const isListeningType =
        questionType === "LISTENING_CHOICE" ||
        questionType === "LISTENING_FILL_BLANK";

    useEffect(() => {
        if (mode === "EXISTING") {
            loadExistingQuestions();
        }
    }, [mode, questionType]);

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    const loadExistingQuestions = async () => {
        try {
            setLoadingQuestions(true);
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/dang-nhap");
                return;
            }

            const response = await fetch(
                `${API_BASE}/questions/my-bank?questionType=${questionType}`,
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

            const result = data?.result || data?.data || data || [];

            if (!response.ok) {
                setError(result?.message || "Không thể tải ngân hàng câu hỏi");
                return;
            }

            setExistingQuestions(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error(err);
            setError("Lỗi kết nối server khi tải ngân hàng câu hỏi");
        } finally {
            setLoadingQuestions(false);
        }
    };

    const resetNewQuestionForm = (nextType) => {
        setContent("");
        setCorrectText("");
        setExplanation("");
        setDefaultPoint(1);
        setPoint(1);
        setMediaFile(null);
        setMediaFileName("");
        setSelectedQuestionIds([]);

        if (nextType === "MULTIPLE_CHOICE" || nextType === "LISTENING_CHOICE") {
            setOptions([
                { optionText: "", isCorrect: true },
                { optionText: "", isCorrect: false },
                { optionText: "", isCorrect: false },
                { optionText: "", isCorrect: false },
            ]);
        } else {
            setOptions([]);
        }
    };

    const handleChangeQuestionType = (value) => {
        setQuestionType(value);
        resetNewQuestionForm(value);
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("audio/")) {
            setError("Vui lòng chọn file audio");
            return;
        }

        setError("");
        setMediaFile(file);
        setMediaFileName(file.name);
    };

    const handleOptionTextChange = (index, value) => {
        setOptions((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, optionText: value } : item
            )
        );
    };

    const handleCorrectOptionChange = (index) => {
        setOptions((prev) =>
            prev.map((item, i) => ({
                ...item,
                isCorrect: i === index,
            }))
        );
    };

    const addOption = () => {
        setOptions((prev) => [...prev, { optionText: "", isCorrect: false }]);
    };

    const removeOption = (index) => {
        if (options.length <= 2) {
            setError("Câu hỏi chọn đáp án cần ít nhất 2 đáp án");
            return;
        }

        const removedIsCorrect = options[index].isCorrect;

        let newOptions = options.filter((_, i) => i !== index);

        if (removedIsCorrect && newOptions.length > 0) {
            newOptions = newOptions.map((item, i) => ({
                ...item,
                isCorrect: i === 0,
            }));
        }

        setOptions(newOptions);
    };

    const validateNewQuestion = () => {
        if (!content.trim()) {
            return "Vui lòng nhập nội dung câu hỏi";
        }

        if (Number(defaultPoint) <= 0) {
            return "Điểm mặc định phải lớn hơn 0";
        }

        if (Number(point) <= 0) {
            return "Điểm trong kỳ thi phải lớn hơn 0";
        }

        

        if (isListeningType && !mediaFile) {
            return "Dạng nghe cần có file audio";
        }

        if (isChoiceType) {
            const validOptions = options.filter((item) => item.optionText.trim());

            if (validOptions.length < 2) {
                return "Câu hỏi chọn đáp án cần ít nhất 2 đáp án";
            }

            const hasCorrect = options.some(
                (item) => item.isCorrect && item.optionText.trim()
            );

            if (!hasCorrect) {
                return "Vui lòng chọn đáp án đúng";
            }
        }

        if (
            questionType === "LISTENING_FILL_BLANK" ||
            questionType === "ARRANGE_SENTENCE" ||
            questionType === "WRITING_SHORT"
        ) {
            if (!correctText.trim()) {
                return "Vui lòng nhập đáp án đúng hoặc đáp án gợi ý";
            }
        }

        return "";
    };

    const validateExistingQuestion = () => {
        if (selectedQuestionIds.length === 0) {
            return "Vui lòng chọn ít nhất 1 câu hỏi";
        }

        if (Number(point) <= 0) {
            return "Điểm trong kỳ thi phải lớn hơn 0";
        }

        

        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (mode === "NEW") {
            await createNewQuestionAndAttachToExam();
        } else {
            await attachExistingQuestionsToExam();
        }
    };

    const createNewQuestionAndAttachToExam = async () => {
        const validateMessage = validateNewQuestion();

        if (validateMessage) {
            setError(validateMessage);
            return;
        }

        try {
            setSaving(true);

            const token = getToken();

            if (!token) {
                navigate("/dang-nhap");
                return;
            }

            const validOptions = options
                .filter((item) => item.optionText.trim())
                .map((item) => ({
                    optionText: item.optionText.trim(),
                    isCorrect: item.isCorrect,
                }));

            const requestData = {
                examId: Number(examId),
                questionType,
                content: content.trim(),
                correctText: correctText.trim() || null,
                explanation: explanation.trim() || null,
                defaultPoint: Number(defaultPoint),
                point: Number(point),
                status: "Published",
                sourceType: "TEACHER_CREATED",
                options: isChoiceType ? validOptions : [],
            };

            const formData = new FormData();

            formData.append(
                "data",
                new Blob([JSON.stringify(requestData)], {
                    type: "application/json",
                })
            );

            if (mediaFile) {
                formData.append("mediaFile", mediaFile);
            }

            const response = await fetch(`${API_BASE}/questions/exams/${examId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            const result = data?.result || data?.data || data;

            if (!response.ok) {
                setError(result?.message || "Thêm câu hỏi vào kỳ thi thất bại");
                return;
            }

            alert("Thêm câu hỏi vào kỳ thi thành công");

            navigate(`/teacher/exams/${examId}`);
        } catch (err) {
            console.error(err);
            setError("Lỗi hệ thống, vui lòng thử lại");
        } finally {
            setSaving(false);
        }
    };

    const attachExistingQuestionsToExam = async () => {
        const validateMessage = validateExistingQuestion();

        if (validateMessage) {
            setError(validateMessage);
            return;
        }

        try {
            setSaving(true);

            const token = getToken();

            if (!token) {
                navigate("/dang-nhap");
                return;
            }

            const requestData = {
                examId: Number(examId),
                questionType,
                questionIds: selectedQuestionIds,
                point: Number(point)
            };

            const response = await fetch(
                `${API_BASE}/exam-questions/exams/${examId}/attach`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestData),
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
                setError(result?.message || "Gắn câu hỏi cũ vào kỳ thi thất bại");
                return;
            }

            alert("Gắn câu hỏi vào kỳ thi thành công");

            navigate(`/teacher/exams/${examId}`);
        } catch (err) {
            console.error(err);
            setError("Lỗi hệ thống, vui lòng thử lại");
        } finally {
            setSaving(false);
        }
    };

    const toggleSelectQuestion = (questionId) => {
        setSelectedQuestionIds((prev) => {
            if (prev.includes(questionId)) {
                return prev.filter((id) => id !== questionId);
            }

            return [...prev, questionId];
        });
    };

    const getQuestionTypeGuide = () => {
        if (questionType === "MULTIPLE_CHOICE") {
            return "Nhập nội dung câu hỏi, thêm các đáp án và chọn 1 đáp án đúng.";
        }

        if (questionType === "LISTENING_CHOICE") {
            return "Tải file audio, nhập câu hỏi nghe hiểu, thêm đáp án và chọn đáp án đúng.";
        }

        if (questionType === "LISTENING_FILL_BLANK") {
            return "Tải file audio, nhập yêu cầu nghe và nhập đáp án đúng vào ô Đáp án.";
        }

        if (questionType === "ARRANGE_SENTENCE") {
            return "Nhập yêu cầu và nhập câu hoàn chỉnh đúng. Hệ thống sẽ tách câu thành các từ để học viên sắp xếp.";
        }

        if (questionType === "WRITING_SHORT") {
            return "Nhập đề bài viết ngắn và đáp án mẫu hoặc từ khóa gợi ý để giáo viên/AI chấm.";
        }

        return "";
    };

    return (
        <div className="exam-question-create-page">
            <div className="exam-question-create-container">
                <div className="exam-question-create-heading">
                    <div>
                        <button
                            type="button"
                            className="question-back-link"
                            onClick={() => navigate(`/teacher/exams/${examId}`)}
                        >
                            <i className="bi bi-arrow-left"></i>
                            Quay lại chi tiết kỳ thi
                        </button>

                        <h2>Thêm câu hỏi vào kỳ thi</h2>

                        <p>
                            Giáo viên có thể tạo câu hỏi mới hoặc chọn lại câu hỏi đã tạo trước
                            đó để thêm vào kỳ thi hiện tại.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2">
                        <i className="bi bi-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm question-card">
                                

                                <div className="card-body">
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-7">
                                            <label className="form-label fw-semibold">
                                                Loại câu hỏi <span className="text-danger">*</span>
                                            </label>

                                            <select
                                                className="form-select"
                                                value={questionType}
                                                onChange={(e) => handleChangeQuestionType(e.target.value)}
                                            >
                                                {QUESTION_TYPES.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        
                                    </div>

                                   
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm question-card mt-4">
                                

                                <div className="card-body">
                                    <div className="mode-switch">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="questionMode"
                                            id="modeNew"
                                            checked={mode === "NEW"}
                                            onChange={() => setMode("NEW")}
                                        />
                                        <label className="btn btn-outline-primary" htmlFor="modeNew">
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Tạo câu hỏi mới
                                        </label>

                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="questionMode"
                                            id="modeExisting"
                                            checked={mode === "EXISTING"}
                                            onChange={() => setMode("EXISTING")}
                                        />
                                        <label className="btn btn-outline-primary" htmlFor="modeExisting">
                                            <i className="bi bi-bank me-1"></i>
                                            Chọn từ ngân hàng câu hỏi
                                        </label>
                                    </div>
                                </div>
                            </div>

                            

                            {mode === "NEW" && (
                                <div className="card border-0 shadow-sm question-card mt-4">
                                    <div className="card-header bg-white border-0 pb-0">
                                        <h5 className="fw-bold mb-1">
                                            <i className="bi bi-pencil-square text-primary me-2"></i>
                                            Thông tin câu hỏi mới
                                        </h5>

                                        <small className="text-muted">{getQuestionTypeGuide()}</small>
                                    </div>

                                    <div className="card-body">
                                        {isListeningType && (
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    File audio <span className="text-danger">*</span>
                                                </label>

                                                <label className="media-upload-box">
                                                    <input
                                                        type="file"
                                                        accept="audio/*,.mp3,.wav,.m4a,.aac"
                                                        hidden
                                                        onChange={handleMediaChange}
                                                    />

                                                    <div className="upload-placeholder">
                                                        <i className="bi bi-file-earmark-music"></i>
                                                        <strong>
                                                            {mediaFileName || "Chọn file audio cho câu hỏi"}
                                                        </strong>
                                                        <span>Hỗ trợ MP3, WAV, M4A, AAC</span>
                                                    </div>
                                                </label>

                                                {mediaFile && (
                                                    <div className="selected-file mt-2">
                                                        <div>
                                                            <strong>{mediaFile.name}</strong>
                                                            <span>
                                                                {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                                                            </span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => {
                                                                setMediaFile(null);
                                                                setMediaFileName("");
                                                            }}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Nội dung câu hỏi <span className="text-danger">*</span>
                                            </label>

                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                placeholder={
                                                    questionType === "LISTENING_CHOICE"
                                                        ? "Ví dụ: Listen and choose the correct answer."
                                                        : questionType === "LISTENING_FILL_BLANK"
                                                            ? "Ví dụ: Listen and fill in the blank."
                                                            : questionType === "ARRANGE_SENTENCE"
                                                                ? "Ví dụ: Arrange the words into a correct sentence."
                                                                : questionType === "WRITING_SHORT"
                                                                    ? "Ví dụ: Write 3 sentences about your daily routine."
                                                                    : "Nhập nội dung câu hỏi..."
                                                }
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                            ></textarea>
                                        </div>

                                        {isChoiceType && (
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <label className="form-label fw-semibold mb-0">
                                                        Danh sách đáp án{" "}
                                                        <span className="text-danger">*</span>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={addOption}
                                                    >
                                                        <i className="bi bi-plus-lg me-1"></i>
                                                        Thêm đáp án
                                                    </button>
                                                </div>

                                                <div className="option-list">
                                                    {options.map((option, index) => (
                                                        <div className="option-item-add" key={index}>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="correctOption"
                                                                    checked={option.isCorrect}
                                                                    onChange={() => handleCorrectOptionChange(index)}
                                                                />
                                                            </div>

                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder={`Đáp án ${index + 1}`}
                                                                value={option.optionText}
                                                                onChange={(e) =>
                                                                    handleOptionTextChange(index, e.target.value)
                                                                }
                                                            />

                                                            <button
                                                                type="button"
                                                                className="btn btn-light text-danger"
                                                                onClick={() => removeOption(index)}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <small className="text-muted">
                                                    Tick vào radio để chọn đáp án đúng.
                                                </small>
                                            </div>
                                        )}

                                        {!isChoiceType && (
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    {questionType === "WRITING_SHORT"
                                                        ? "Đáp án mẫu / gợi ý chấm"
                                                        : "Đáp án đúng"}{" "}
                                                    <span className="text-danger">*</span>
                                                </label>

                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder={
                                                        questionType === "ARRANGE_SENTENCE"
                                                            ? "Nhập câu đúng hoàn chỉnh, ví dụ: I wake up at six o'clock."
                                                            : questionType === "WRITING_SHORT"
                                                                ? "Nhập đáp án mẫu hoặc các ý chính cần có..."
                                                                : "Nhập đáp án đúng..."
                                                    }
                                                    value={correctText}
                                                    onChange={(e) => setCorrectText(e.target.value)}
                                                ></textarea>
                                            </div>
                                        )}

                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">
                                                    Điểm mặc định
                                                </label>

                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0.25"
                                                    step="0.25"
                                                    value={defaultPoint}
                                                    onChange={(e) => setDefaultPoint(e.target.value)}
                                                />
                                            </div>

                                            <div className="col-md-8">
                                                <label className="form-label fw-semibold">
                                                    Giải thích đáp án
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nhập giải thích ngắn nếu có"
                                                    value={explanation}
                                                    onChange={(e) => setExplanation(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mode === "EXISTING" && (
                                <div className="card border-0 shadow-sm question-card mt-4">
                                    <div className="card-header bg-white border-0 pb-0">
                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                            <div>
                                                <h5 className="fw-bold mb-1">
                                                    <i className="bi bi-bank text-primary me-2"></i>
                                                    Ngân hàng câu hỏi của tôi
                                                </h5>

                                                <small className="text-muted">
                                                    Chọn câu hỏi đã tạo trước đó để thêm vào kỳ thi này.
                                                </small>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={loadExistingQuestions}
                                            >
                                                <i className="bi bi-arrow-clockwise me-1"></i>
                                                Tải lại
                                            </button>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        {loadingQuestions ? (
                                            <div className="text-center text-muted py-4">
                                                <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                                Đang tải ngân hàng câu hỏi...
                                            </div>
                                        ) : existingQuestions.length === 0 ? (
                                            <div className="empty-box">
                                                Chưa có câu hỏi nào thuộc dạng{" "}
                                                <strong>{selectedQuestionType?.label}</strong>.
                                            </div>
                                        ) : (
                                            <div className="existing-question-list">
                                                {existingQuestions.map((question) => (
                                                    <button
                                                        type="button"
                                                        key={question.questionId}
                                                        className={
                                                            selectedQuestionIds.includes(question.questionId)
                                                                ? "existing-question-item active"
                                                                : "existing-question-item"
                                                        }
                                                        onClick={() => toggleSelectQuestion(question.questionId)}
                                                    >
                                                        <div className="question-check">
                                                            {selectedQuestionIds.includes(question.questionId) ? (
                                                                <i className="bi bi-check-circle-fill"></i>
                                                            ) : (
                                                                <i className="bi bi-circle"></i>
                                                            )}
                                                        </div>

                                                        <div className="flex-grow-1 text-start">
                                                            <strong>{question.content}</strong>

                                                            <div className="existing-meta">
                                                                <span>{question.optionCount || 0} đáp án</span>
                                                                <span>{question.defaultPoint || 1} điểm mặc định</span>
                                                                <span>{question.status || "Published"}</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="question-action-bar mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang lưu...
                                        </>
                                    ) : mode === "NEW" ? (
                                        <>
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Tạo và thêm vào kỳ thi
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-link-45deg me-1"></i>
                                            Thêm câu hỏi đã chọn vào kỳ thi
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => navigate(`/teacher/exams/${examId}`)}
                                    disabled={saving}
                                >
                                    <i className="bi bi-arrow-left me-1"></i>
                                    Quay lại
                                </button>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm question-side-card sticky-preview">
                                <div className="card-header bg-white border-0 pb-0">
                                    <h6 className="fw-bold mb-1">
                                        <i className="bi bi-info-circle text-primary me-2"></i>
                                        Tóm tắt câu hỏi kỳ thi
                                    </h6>
                                </div>

                                <div className="card-body">
                                    <div className="practice-summary">
                                        <div className="summary-icon">
                                            <i className={`bi ${selectedQuestionType?.icon}`}></i>
                                        </div>

                                        <h5>{selectedQuestionType?.label}</h5>
                                        <p>{selectedQuestionType?.description}</p>

                                        <hr />

                                        <div className="summary-row">
                                            <span>Exam ID</span>
                                            <strong>{examId}</strong>
                                        </div>

                                        <div className="summary-row">
                                            <span>Loại câu hỏi</span>
                                            <strong>{questionType}</strong>
                                        </div>

                                        <div className="summary-row">
                                            <span>Cách thêm</span>
                                            <strong>{mode === "NEW" ? "Tạo mới" : "Chọn câu cũ"}</strong>
                                        </div>

                                        <div className="summary-row">
                                            <span>Điểm trong kỳ thi</span>
                                            <strong>{point} điểm</strong>
                                        </div>

                                        

                                        {mode === "EXISTING" && (
                                            <div className="summary-row">
                                                <span>Đã chọn</span>
                                                <strong>{selectedQuestionIds.length} câu</strong>
                                            </div>
                                        )}

                                        {mode === "NEW" && isChoiceType && (
                                            <div className="summary-row">
                                                <span>Số đáp án</span>
                                                <strong>
                                                    {options.filter((item) => item.optionText.trim()).length}
                                                </strong>
                                            </div>
                                        )}

                                        {mode === "NEW" && isListeningType && (
                                            <div className="summary-row">
                                                <span>Audio</span>
                                                <strong>{mediaFile ? "Đã chọn" : "Chưa chọn"}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm question-side-card mt-3">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">
                                        <i className="bi bi-lightbulb text-warning me-2"></i>
                                        Lưu ý
                                    </h6>

                                    <ul className="exam-question-note-list">
                                        <li>
                                            Điểm trong kỳ thi có thể khác điểm mặc định của câu hỏi.
                                        </li>
                                        <li>
                                            Nếu chọn nhiều câu hỏi cũ, thứ tự sẽ tự tăng từ thứ tự bắt đầu.
                                        </li>
                                        <li>
                                            Câu hỏi mới sẽ được lưu vào ngân hàng câu hỏi của giáo viên.
                                        </li>
                                        <li>
                                            Dạng nghe bắt buộc phải có file audio.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TeacherExamQuestionCreate;