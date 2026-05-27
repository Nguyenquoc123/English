import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import "./QuestionCreateComponent.css";

const API_BASE = "http://localhost:8080";

const QUESTION_TYPES = [
    {
        value: "MULTIPLE_CHOICE",
        label: "Trắc nghiệm",
        icon: "bi-ui-checks-grid",
    },
    {
        value: "LISTENING_CHOICE",
        label: "Nghe chọn đáp án",
        icon: "bi-volume-up",
    },
    {
        value: "LISTENING_FILL_BLANK",
        label: "Nghe điền từ",
        icon: "bi-soundwave",
    },
    {
        value: "ARRANGE_SENTENCE",
        label: "Sắp xếp câu",
        icon: "bi-shuffle",
    },
    {
        value: "WRITING_SHORT",
        label: "Viết ngắn",
        icon: "bi-pencil-square",
    },
];

const DEFAULT_OPTIONS = [
    { optionText: "", isCorrect: true },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
];

function QuestionCreateComponent({
    title,
    breadcrumb,
    targetLabel,
    allowAttachExisting = true,
    showExamPoint = false,
    submitNewText = "Tạo câu hỏi",
    submitExistingText = "Gắn câu hỏi đã chọn",
    cancelPath,
    redirectPath,

    buildCreatePayload,
    createEndpoint,

    buildAttachPayload,
    attachEndpoint,

    bulkCreateEndpoint,
    buildBulkCreatePayload,
    successBulkCreateMessage = "Thêm danh sách câu hỏi thành công",

    successCreateMessage = "Tạo câu hỏi thành công",
    successAttachMessage = "Gắn câu hỏi thành công",
}) {
    const navigate = useNavigate();

    const [mode, setMode] = useState("NEW");
    const [questionType, setQuestionType] = useState("MULTIPLE_CHOICE");

    const [content, setContent] = useState("");
    const [correctText, setCorrectText] = useState("");
    const [explanation, setExplanation] = useState("");
    const [defaultPoint, setDefaultPoint] = useState(1);
    const [examPoint, setExamPoint] = useState(1);

    const [mediaFile, setMediaFile] = useState(null);
    const [mediaFileName, setMediaFileName] = useState("");

    const [options, setOptions] = useState(DEFAULT_OPTIONS);

    const [existingQuestions, setExistingQuestions] = useState([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [excelFileName, setExcelFileName] = useState("");
    const [excelQuestions, setExcelQuestions] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [levelIdFilter, setLevelIdFilter] = useState("");

    const selectedQuestionType = useMemo(() => {
        return QUESTION_TYPES.find((item) => item.value === questionType);
    }, [questionType]);

    const isChoiceType =
        questionType === "MULTIPLE_CHOICE" ||
        questionType === "LISTENING_CHOICE";

    const isExcelSupportedType =
        questionType === "MULTIPLE_CHOICE" ||
        questionType === "ARRANGE_SENTENCE";

    const isListeningType =
        questionType === "LISTENING_CHOICE" ||
        questionType === "LISTENING_FILL_BLANK";

    useEffect(() => {
        if (mode !== "EXISTING" || !allowAttachExisting) return;

        const timer = setTimeout(() => {
            loadExistingQuestions();
        }, 400);

        return () => clearTimeout(timer);
    }, [mode, questionType, searchKeyword, levelIdFilter]);

    const getToken = () => {
        return localStorage.getItem("english_token") || localStorage.getItem("token");
    };

    const authHeaders = () => {
        const token = getToken();

        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const resetFormByType = (nextType) => {
        setContent("");
        setCorrectText("");
        setExplanation("");
        setDefaultPoint(1);
        setExamPoint(1);
        setMediaFile(null);
        setMediaFileName("");
        setSelectedQuestionIds([]);
        setExcelFileName("");
        setExcelQuestions([]);

        if (nextType === "MULTIPLE_CHOICE" || nextType === "LISTENING_CHOICE") {
            setOptions(DEFAULT_OPTIONS);
        } else {
            setOptions([]);
        }
    };

    const handleChangeQuestionType = (value) => {
        setQuestionType(value);
        setSearchKeyword("");
        setLevelIdFilter("");
        resetFormByType(value);
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
        let nextOptions = options.filter((_, i) => i !== index);

        if (removedIsCorrect && nextOptions.length > 0) {
            nextOptions = nextOptions.map((item, i) => ({
                ...item,
                isCorrect: i === 0,
            }));
        }

        setOptions(nextOptions);
    };

    // const loadExistingQuestions = async () => {
    //     try {
    //         setLoadingQuestions(true);
    //         setError("");

    //         const response = await fetch(
    //             `${API_BASE}/questions/my-bank?questionType=${questionType}`,
    //             {
    //                 method: "GET",
    //                 headers: authHeaders(),
    //             }
    //         );

    //         let data = null;

    //         try {
    //             data = await response.json();
    //         } catch {
    //             data = null;
    //         }

    //         const result = data?.result || data?.data || data || [];

    //         if (!response.ok) {
    //             setError(result?.message || data?.message || "Không thể tải ngân hàng câu hỏi");
    //             return;
    //         }

    //         setExistingQuestions(Array.isArray(result) ? result : []);
    //     } catch (err) {
    //         console.error(err);
    //         setError("Lỗi kết nối server khi tải ngân hàng câu hỏi");
    //     } finally {
    //         setLoadingQuestions(false);
    //     }
    // };

    const loadExistingQuestions = async () => {
        try {
            setLoadingQuestions(true);
            setError("");

            const params = new URLSearchParams();

            params.append("questionType", questionType);

            if (searchKeyword.trim()) {
                params.append("keyword", searchKeyword.trim());
            }

            if (levelIdFilter) {
                params.append("levelId", levelIdFilter);
            }

            const response = await fetch(
                `${API_BASE}/questions/my-bank?${params.toString()}`,
                {
                    method: "GET",
                    headers: authHeaders(),
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
                setError(result?.message || data?.message || "Không thể tải ngân hàng câu hỏi");
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

    const validateNewQuestion = () => {
        if (!content.trim()) {
            return "Vui lòng nhập nội dung câu hỏi";
        }

        if (Number(defaultPoint) <= 0) {
            return "Điểm mặc định phải lớn hơn 0";
        }

        if (showExamPoint && Number(examPoint) <= 0) {
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

            const hasCorrect = validOptions.some((item) => item.isCorrect);

            if (!hasCorrect) {
                return "Vui lòng chọn đáp án đúng";
            }
        }

        if (!isChoiceType && !correctText.trim()) {
            return "Vui lòng nhập đáp án đúng hoặc đáp án gợi ý";
        }

        return "";
    };

    const validateExistingQuestions = () => {
        if (selectedQuestionIds.length === 0) {
            return "Vui lòng chọn ít nhất 1 câu hỏi";
        }

        if (showExamPoint && Number(examPoint) <= 0) {
            return "Điểm trong kỳ thi phải lớn hơn 0";
        }

        return "";
    };

    const getValidOptions = () => {
        return options
            .filter((item) => item.optionText.trim())
            .map((item) => ({
                optionText: item.optionText.trim(),
                isCorrect: item.isCorrect,
            }));
    };

    const createNewQuestion = async () => {
        const validateMessage = validateNewQuestion();

        if (validateMessage) {
            setError(validateMessage);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const basePayload = {
                questionType,
                content: content.trim(),
                correctText: correctText.trim() || null,
                explanation: explanation.trim() || null,
                defaultPoint: Number(defaultPoint),
                status: "Published",
                sourceType: "TEACHER_CREATED",
                options: isChoiceType ? getValidOptions() : [],
            };

            const payload = buildCreatePayload
                ? buildCreatePayload({
                    basePayload,
                    questionType,
                    examPoint: Number(examPoint),
                })
                : basePayload;

            const formData = new FormData();

            formData.append(
                "data",
                new Blob([JSON.stringify(payload)], {
                    type: "application/json",
                })
            );

            if (mediaFile) {
                formData.append("mediaFile", mediaFile);
            }

            const response = await fetch(createEndpoint, {
                method: "POST",
                headers: authHeaders(),
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
                setError(result?.message || data?.message || "Tạo câu hỏi thất bại");
                return;
            }

            alert(successCreateMessage);
            navigate(redirectPath);
        } catch (err) {
            console.error(err);
            setError("Lỗi hệ thống, vui lòng thử lại");
        } finally {
            setSaving(false);
        }
    };

    const attachExistingQuestions = async () => {
        const validateMessage = validateExistingQuestions();

        if (validateMessage) {
            setError(validateMessage);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = buildAttachPayload({
                questionType,
                questionIds: selectedQuestionIds,
                examPoint: Number(examPoint),
            });

            const response = await fetch(attachEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                body: JSON.stringify(payload),
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            const result = data?.result || data?.data || data;

            if (!response.ok) {
                setError(result?.message || data?.message || "Gắn câu hỏi thất bại");
                return;
            }

            alert(successAttachMessage);
            navigate(redirectPath);
        } catch (err) {
            console.error(err);
            setError("Lỗi hệ thống, vui lòng thử lại");
        } finally {
            setSaving(false);
        }
    };

    const saveExcelQuestions = async () => {
        const validateMessage = validateExcelQuestions();

        if (validateMessage) {
            setError(validateMessage);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const token =
                localStorage.getItem("english_token") ||
                localStorage.getItem("token");

            const questions = excelQuestions.map((question) => ({
                questionType: question.questionType,
                content: question.content.trim(),
                correctText: question.correctText?.trim() || null,
                explanation: question.explanation?.trim() || null,
                defaultPoint: Number(question.defaultPoint),
                status: "Published",
                sourceType: "TEACHER_CREATED",
                options:
                    question.questionType === "MULTIPLE_CHOICE"
                        ? question.options
                            .filter((option) => option.optionText.trim())
                            .map((option, index) => ({
                                optionText: option.optionText.trim(),
                                isCorrect: option.isCorrect,
                                optionOrder: index + 1,
                            }))
                        : [],
            }));

            const payload = buildBulkCreatePayload
                ? buildBulkCreatePayload({
                    questionType,
                    questions,
                    examPoint: Number(examPoint),
                })
                : {
                    questions,
                };

            const response = await fetch(bulkCreateEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                throw new Error(data?.message || "Lưu danh sách câu hỏi thất bại");
            }

            alert(successBulkCreateMessage || "Thêm danh sách câu hỏi thành công");
            navigate(redirectPath);
        } catch (err) {
            setError(err.message || "Lỗi hệ thống");
        } finally {
            setSaving(false);
        }
    };

    const normalizeExcelValue = (value) => {
        if (value === null || value === undefined) return "";
        return String(value).trim();
    };

    const getCorrectIndexFromExcel = (correctAnswer) => {
        const value = normalizeExcelValue(correctAnswer).toUpperCase();

        if (value === "A") return 0;
        if (value === "B") return 1;
        if (value === "C") return 2;
        if (value === "D") return 3;

        return -1;
    };

    const handleExcelFileChange = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!isExcelSupportedType) {
            setError("Import Excel hiện chỉ hỗ trợ Trắc nghiệm và Sắp xếp câu");
            return;
        }

        const validExtensions = [".xlsx", ".xls"];
        const isValidFile = validExtensions.some((ext) =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (!isValidFile) {
            setError("Vui lòng chọn file Excel .xlsx hoặc .xls");
            return;
        }

        try {
            setError("");
            setExcelFileName(file.name);

            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const rows = XLSX.utils.sheet_to_json(worksheet, {
                defval: "",
            });

            if (!rows.length) {
                setError("File Excel không có dữ liệu");
                setExcelQuestions([]);
                return;
            }

            let parsedQuestions = [];

            if (questionType === "MULTIPLE_CHOICE") {
                parsedQuestions = rows.map((row, index) => {
                    const correctIndex = getCorrectIndexFromExcel(row.correctAnswer);

                    return {
                        rowIndex: index + 1,
                        questionType: "MULTIPLE_CHOICE",
                        content: normalizeExcelValue(row.content),
                        defaultPoint: Number(row.defaultPoint) > 0 ? Number(row.defaultPoint) : 1,
                        explanation: normalizeExcelValue(row.explanation),
                        options: [
                            {
                                optionText: normalizeExcelValue(row.optionA),
                                isCorrect: correctIndex === 0,
                            },
                            {
                                optionText: normalizeExcelValue(row.optionB),
                                isCorrect: correctIndex === 1,
                            },
                            {
                                optionText: normalizeExcelValue(row.optionC),
                                isCorrect: correctIndex === 2,
                            },
                            {
                                optionText: normalizeExcelValue(row.optionD),
                                isCorrect: correctIndex === 3,
                            },
                        ],
                    };
                });
            }

            if (questionType === "ARRANGE_SENTENCE") {
                parsedQuestions = rows.map((row, index) => ({
                    rowIndex: index + 1,
                    questionType: "ARRANGE_SENTENCE",
                    content: normalizeExcelValue(row.content),
                    correctText: normalizeExcelValue(row.correctText),
                    defaultPoint: Number(row.defaultPoint) > 0 ? Number(row.defaultPoint) : 1,
                    explanation: normalizeExcelValue(row.explanation),
                    options: [],
                }));
            }

            setExcelQuestions(parsedQuestions);
        } catch (err) {
            console.error(err);
            setError("Không thể đọc file Excel");
            setExcelQuestions([]);
        }
    };

    const updateExcelQuestion = (index, field, value) => {
        setExcelQuestions((prev) =>
            prev.map((question, i) =>
                i === index
                    ? {
                        ...question,
                        [field]: value,
                    }
                    : question
            )
        );
    };

    const updateExcelOption = (questionIndex, optionIndex, value) => {
        setExcelQuestions((prev) =>
            prev.map((question, i) => {
                if (i !== questionIndex) return question;

                return {
                    ...question,
                    options: question.options.map((option, j) =>
                        j === optionIndex
                            ? {
                                ...option,
                                optionText: value,
                            }
                            : option
                    ),
                };
            })
        );
    };

    const updateExcelCorrectOption = (questionIndex, optionIndex) => {
        setExcelQuestions((prev) =>
            prev.map((question, i) => {
                if (i !== questionIndex) return question;

                return {
                    ...question,
                    options: question.options.map((option, j) => ({
                        ...option,
                        isCorrect: j === optionIndex,
                    })),
                };
            })
        );
    };

    const removeExcelQuestion = (index) => {
        setExcelQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const validateExcelQuestions = () => {
        if (!isExcelSupportedType) {
            return "Import Excel hiện chỉ hỗ trợ Trắc nghiệm và Sắp xếp câu";
        }

        if (excelQuestions.length === 0) {
            return "Vui lòng chọn file Excel và kiểm tra danh sách preview";
        }

        for (let i = 0; i < excelQuestions.length; i++) {
            const question = excelQuestions[i];
            const rowNumber = i + 1;

            if (!question.content.trim()) {
                return `Câu ${rowNumber}: Nội dung câu hỏi không được để trống`;
            }

            if (Number(question.defaultPoint) <= 0) {
                return `Câu ${rowNumber}: Điểm mặc định phải lớn hơn 0`;
            }

            if (question.questionType === "MULTIPLE_CHOICE") {
                const validOptions = question.options.filter((item) =>
                    item.optionText.trim()
                );

                if (validOptions.length < 2) {
                    return `Câu ${rowNumber}: Cần ít nhất 2 đáp án`;
                }

                const hasCorrect = question.options.some(
                    (item) => item.isCorrect && item.optionText.trim()
                );

                if (!hasCorrect) {
                    return `Câu ${rowNumber}: Vui lòng chọn đáp án đúng`;
                }
            }

            if (question.questionType === "ARRANGE_SENTENCE") {
                if (!question.correctText?.trim()) {
                    return `Câu ${rowNumber}: Vui lòng nhập câu đúng`;
                }
            }
        }

        return "";
    };

    const createQuestionsFromExcel = async () => {
        const validateMessage = validateExcelQuestions();

        if (validateMessage) {
            setError(validateMessage);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const questions = excelQuestions.map((question) => ({
                questionType: question.questionType,
                content: question.content.trim(),
                correctText: question.correctText?.trim() || null,
                explanation: question.explanation?.trim() || null,
                defaultPoint: Number(question.defaultPoint),
                status: "Published",
                sourceType: "TEACHER_CREATED",
                options:
                    question.questionType === "MULTIPLE_CHOICE"
                        ? question.options
                            .filter((option) => option.optionText.trim())
                            .map((option) => ({
                                optionText: option.optionText.trim(),
                                isCorrect: option.isCorrect,
                            }))
                        : [],
            }));

            const payload = buildBulkCreatePayload
                ? buildBulkCreatePayload({
                    questionType,
                    questions,
                    examPoint: Number(examPoint),
                })
                : {
                    questionType,
                    questions,
                };

            const response = await fetch(bulkCreateEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                body: JSON.stringify(payload),
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            const result = data?.result || data?.data || data;

            if (!response.ok) {
                setError(result?.message || data?.message || "Lưu danh sách câu hỏi thất bại");
                return;
            }

            alert(successBulkCreateMessage);
            navigate(redirectPath);
        } catch (err) {
            console.error(err);
            setError("Lỗi hệ thống, vui lòng thử lại");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === "NEW") {
            await createNewQuestion();
            return;
        }

        if (mode === "EXISTING") {
            await attachExistingQuestions();
            return;
        }

        if (mode === "EXCEL") {
            await createQuestionsFromExcel();
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

    const getCorrectTextLabel = () => {
        if (questionType === "WRITING_SHORT") {
            return "Đáp án mẫu / gợi ý chấm";
        }

        return "Đáp án đúng";
    };

    const getContentPlaceholder = () => {
        switch (questionType) {
            case "LISTENING_CHOICE":
                return "Ví dụ: Listen and choose the correct answer.";
            case "LISTENING_FILL_BLANK":
                return "Ví dụ: Listen and fill in the blank.";
            case "ARRANGE_SENTENCE":
                return "Ví dụ: Arrange the words into a correct sentence.";
            case "WRITING_SHORT":
                return "Ví dụ: Write 3 sentences about your daily routine.";
            default:
                return "Nhập nội dung câu hỏi...";
        }
    };

    const getLevelName = (question) => {
    return (
        question.levelName ||
        question.level?.levelName ||
        question.levelTitle ||
        "Chưa phân cấp"
    );
};

    return (
        <div className="question-reusable-page">
            <div className="container-fluid px-0">
                {breadcrumb && <div className="mb-3">{breadcrumb}</div>}

                <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">{title}</h2>
                        <p className="text-muted mb-0">{targetLabel}</p>
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
                        <div className="col-12 col-xl-8">
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-body p-4">
                                    <label className="form-label fw-semibold">
                                        Loại câu hỏi <span className="text-danger">*</span>
                                    </label>

                                    <div className="question-type-grid">
                                        {QUESTION_TYPES.map((type) => (
                                            <button
                                                type="button"
                                                key={type.value}
                                                className={
                                                    questionType === type.value
                                                        ? "question-type-card active"
                                                        : "question-type-card"
                                                }
                                                onClick={() => handleChangeQuestionType(type.value)}
                                            >
                                                <i className={`bi ${type.icon}`}></i>
                                                <span>{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {allowAttachExisting && (
                                <div className="card border-0 shadow-sm rounded-4 mb-4">
                                    <div className="card-body p-4">
                                        <label className="form-label fw-semibold d-block">
                                            Cách thêm câu hỏi <span className="text-danger">*</span>
                                        </label>

                                        <div className="d-flex flex-column flex-sm-row gap-2">
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
                                                Chọn từ ngân hàng
                                            </label>

                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="questionMode"
                                                id="modeExcel"
                                                checked={mode === "EXCEL"}
                                                onChange={() => {
                                                    setMode("EXCEL");
                                                    setExcelFileName("");
                                                    setExcelQuestions([]);
                                                }}
                                            />
                                            <label className="btn btn-outline-primary" htmlFor="modeExcel">
                                                <i className="bi bi-file-earmark-excel me-1"></i>
                                                Nhập từ Excel
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mode === "NEW" && (
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-header bg-white px-4 py-3">
                                        <h5 className="fw-bold mb-0">Thông tin câu hỏi</h5>
                                    </div>

                                    <div className="card-body p-4">
                                        {isListeningType && (
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    File audio <span className="text-danger">*</span>
                                                </label>

                                                <label className="audio-upload-box">
                                                    <input
                                                        type="file"
                                                        accept="audio/*,.mp3,.wav,.m4a,.aac"
                                                        hidden
                                                        onChange={handleMediaChange}
                                                    />

                                                    <i className="bi bi-file-earmark-music"></i>
                                                    <strong>{mediaFileName || "Chọn file audio"}</strong>
                                                    <span>MP3, WAV, M4A, AAC</span>
                                                </label>

                                                {mediaFile && (
                                                    <div className="selected-audio mt-2">
                                                        <span>{mediaFile.name}</span>

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
                                                placeholder={getContentPlaceholder()}
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                            />
                                        </div>

                                        {isChoiceType && (
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                                                    <label className="form-label fw-semibold mb-0">
                                                        Danh sách đáp án <span className="text-danger">*</span>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={addOption}
                                                    >
                                                        <i className="bi bi-plus-lg me-1"></i>
                                                        Thêm
                                                    </button>
                                                </div>

                                                <div className="option-list">
                                                    {options.map((option, index) => (
                                                        <div className="option-row" key={index}>
                                                            <input
                                                                className="form-check-input mt-0"
                                                                type="radio"
                                                                name="correctOption"
                                                                checked={option.isCorrect}
                                                                onChange={() => handleCorrectOptionChange(index)}
                                                            />

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
                                            </div>
                                        )}

                                        {!isChoiceType && (
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    {getCorrectTextLabel()} <span className="text-danger">*</span>
                                                </label>

                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Nhập đáp án đúng hoặc gợi ý chấm..."
                                                    value={correctText}
                                                    onChange={(e) => setCorrectText(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div className="row g-3">
                                            <div className={showExamPoint ? "col-12 col-md-4" : "col-12 col-md-4"}>
                                                <label className="form-label fw-semibold">
                                                    Điểm mặc định <span className="text-danger">*</span>
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

                                            {showExamPoint && (
                                                <div className="col-12 col-md-4">
                                                    <label className="form-label fw-semibold">
                                                        Điểm trong kỳ thi <span className="text-danger">*</span>
                                                    </label>

                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        min="0.25"
                                                        step="0.25"
                                                        value={examPoint}
                                                        onChange={(e) => setExamPoint(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div className={showExamPoint ? "col-12 col-md-4" : "col-12 col-md-8"}>
                                                <label className="form-label fw-semibold">
                                                    Giải thích đáp án
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nhập giải thích nếu có"
                                                    value={explanation}
                                                    onChange={(e) => setExplanation(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mode === "EXISTING" && allowAttachExisting && (
    <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white px-4 py-3">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <div>
                    <h5 className="fw-bold mb-1">Ngân hàng câu hỏi</h5>
                    <small className="text-muted">
                        Tìm kiếm và lọc câu hỏi theo cấp độ
                    </small>
                </div>

                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={loadExistingQuestions}
                    disabled={loadingQuestions}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Tải lại
                </button>
            </div>
        </div>

        <div className="card-body p-4">
            {showExamPoint && (
                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Điểm trong kỳ thi <span className="text-danger">*</span>
                    </label>

                    <input
                        type="number"
                        className="form-control"
                        min="0.25"
                        step="0.25"
                        value={examPoint}
                        onChange={(e) => setExamPoint(e.target.value)}
                    />
                </div>
            )}

            <div className="question-bank-filter mb-4">
                <div className="row g-2">
                    <div className="col-12 col-lg-8">
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <i className="bi bi-search"></i>
                            </span>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm theo nội dung, đáp án hoặc giải thích..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-12 col-lg-4">
                        <select
                            className="form-select"
                            value={levelIdFilter}
                            onChange={(e) => setLevelIdFilter(e.target.value)}
                        >
                            <option value="">Tất cả cấp độ</option>
                            <option value="1">Sơ cấp</option>
                            <option value="2">Trung cấp</option>
                            <option value="3">Cao cấp</option>
                        </select>
                    </div>
                </div>

                {(searchKeyword || levelIdFilter) && (
                    <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                        <small className="text-muted">
                            Đang lọc ngân hàng câu hỏi
                        </small>

                        <button
                            type="button"
                            className="btn btn-sm btn-link text-decoration-none px-0"
                            onClick={() => {
                                setSearchKeyword("");
                                setLevelIdFilter("");
                            }}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>

            {loadingQuestions ? (
                <div className="text-center text-muted py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Đang tải câu hỏi...
                </div>
            ) : existingQuestions.length === 0 ? (
                <div className="empty-question-box">
                    <i className="bi bi-search d-block fs-3 mb-2"></i>
                    Không tìm thấy câu hỏi phù hợp.
                    <div className="text-muted small mt-1">
                        Thử đổi từ khóa, cấp độ hoặc loại câu hỏi.
                    </div>
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
                            <span className="question-check">
                                {selectedQuestionIds.includes(question.questionId) ? (
                                    <i className="bi bi-check-circle-fill"></i>
                                ) : (
                                    <i className="bi bi-circle"></i>
                                )}
                            </span>

                            <span className="question-content">
                                <strong>{question.content}</strong>

                                <small className="d-flex align-items-center gap-2 flex-wrap">
                                    <span>
                                        <i className="bi bi-list-check me-1"></i>
                                        {question.optionCount || 0} đáp án
                                    </span>

                                    <span>
                                        <i className="bi bi-star me-1"></i>
                                        {question.defaultPoint || 1} điểm
                                    </span>

                                    <span className="badge rounded-pill text-bg-light border">
                                        {getLevelName(question)}
                                    </span>
                                </small>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
)}

                            {mode === "EXCEL" && (
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-header bg-white px-4 py-3">
                                        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                                            <div>
                                                <h5 className="fw-bold mb-1">Nhập câu hỏi từ Excel</h5>
                                                <small className="text-muted">
                                                    Hỗ trợ Trắc nghiệm và Sắp xếp câu. Chọn file xong sẽ hiển thị preview để chỉnh sửa trước khi lưu.
                                                </small>
                                            </div>

                                            {excelQuestions.length > 0 && (
                                                <span className="badge text-bg-primary">
                                                    {excelQuestions.length} câu hỏi
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-body p-4">
                                        {!isExcelSupportedType ? (
                                            <div className="alert alert-warning mb-0">
                                                Import Excel hiện chỉ hỗ trợ loại câu hỏi Trắc nghiệm và Sắp xếp câu.
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mb-4">
                                                    <label className="form-label fw-semibold">
                                                        File Excel <span className="text-danger">*</span>
                                                    </label>

                                                    <label className="excel-upload-box">
                                                        <input
                                                            type="file"
                                                            accept=".xlsx,.xls"
                                                            hidden
                                                            onChange={handleExcelFileChange}
                                                        />

                                                        <i className="bi bi-file-earmark-excel"></i>
                                                        <strong>{excelFileName || "Chọn file Excel"}</strong>
                                                        <span>Định dạng .xlsx hoặc .xls</span>
                                                    </label>
                                                </div>

                                                {showExamPoint && (
                                                    <div className="mb-4">
                                                        <label className="form-label fw-semibold">
                                                            Điểm trong kỳ thi <span className="text-danger">*</span>
                                                        </label>

                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            min="0.25"
                                                            step="0.25"
                                                            value={examPoint}
                                                            onChange={(e) => setExamPoint(e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                {excelQuestions.length > 0 && (
                                                    <div className="excel-preview-list">
                                                        {excelQuestions.map((question, questionIndex) => (
                                                            <div className="excel-preview-card" key={questionIndex}>
                                                                <div className="excel-preview-header">
                                                                    <strong>Câu {questionIndex + 1}</strong>

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => removeExcelQuestion(questionIndex)}
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <label className="form-label fw-semibold">
                                                                        Nội dung câu hỏi <span className="text-danger">*</span>
                                                                    </label>

                                                                    <textarea
                                                                        className="form-control"
                                                                        rows="3"
                                                                        value={question.content}
                                                                        onChange={(e) =>
                                                                            updateExcelQuestion(
                                                                                questionIndex,
                                                                                "content",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                {question.questionType === "MULTIPLE_CHOICE" && (
                                                                    <div className="mb-3">
                                                                        <label className="form-label fw-semibold">
                                                                            Đáp án <span className="text-danger">*</span>
                                                                        </label>

                                                                        <div className="option-list">
                                                                            {question.options.map((option, optionIndex) => (
                                                                                <div className="option-row" key={optionIndex}>
                                                                                    <input
                                                                                        className="form-check-input mt-0"
                                                                                        type="radio"
                                                                                        name={`excelCorrectOption-${questionIndex}`}
                                                                                        checked={option.isCorrect}
                                                                                        onChange={() =>
                                                                                            updateExcelCorrectOption(
                                                                                                questionIndex,
                                                                                                optionIndex
                                                                                            )
                                                                                        }
                                                                                    />

                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        placeholder={`Đáp án ${optionIndex + 1}`}
                                                                                        value={option.optionText}
                                                                                        onChange={(e) =>
                                                                                            updateExcelOption(
                                                                                                questionIndex,
                                                                                                optionIndex,
                                                                                                e.target.value
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {question.questionType === "ARRANGE_SENTENCE" && (
                                                                    <div className="mb-3">
                                                                        <label className="form-label fw-semibold">
                                                                            Câu đúng <span className="text-danger">*</span>
                                                                        </label>

                                                                        <textarea
                                                                            className="form-control"
                                                                            rows="2"
                                                                            value={question.correctText || ""}
                                                                            onChange={(e) =>
                                                                                updateExcelQuestion(
                                                                                    questionIndex,
                                                                                    "correctText",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="row g-3">
                                                                    <div className="col-12 col-md-4">
                                                                        <label className="form-label fw-semibold">
                                                                            Điểm mặc định <span className="text-danger">*</span>
                                                                        </label>

                                                                        <input
                                                                            type="number"
                                                                            className="form-control"
                                                                            min="0.25"
                                                                            step="0.25"
                                                                            value={question.defaultPoint}
                                                                            onChange={(e) =>
                                                                                updateExcelQuestion(
                                                                                    questionIndex,
                                                                                    "defaultPoint",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div className="col-12 col-md-8">
                                                                        <label className="form-label fw-semibold">
                                                                            Giải thích đáp án
                                                                        </label>

                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={question.explanation || ""}
                                                                            onChange={(e) =>
                                                                                updateExcelQuestion(
                                                                                    questionIndex,
                                                                                    "explanation",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-light border order-2 order-sm-1"
                                    onClick={() => navigate(cancelPath)}
                                    disabled={saving}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary px-4 order-1 order-sm-2"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang lưu...
                                        </>
                                    ) : mode === "NEW" ? (
                                        submitNewText
                                    ) : mode === "EXISTING" ? (
                                        submitExistingText
                                    ) : (
                                        "Lưu danh sách từ Excel"
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="col-12 col-xl-4">
                            <div className="card border-0 shadow-sm rounded-4 sticky-xl-top question-summary-card">
                                <div className="card-body p-4">
                                    <div className="summary-icon mb-3">
                                        <i className={`bi ${selectedQuestionType?.icon}`}></i>
                                    </div>

                                    <h5 className="fw-bold mb-3">{selectedQuestionType?.label}</h5>

                                    <div className="summary-row">
                                        <span>Chế độ</span>
                                        <strong>{mode === "NEW" ? "Tạo mới" : "Chọn từ ngân hàng"}</strong>
                                    </div>

                                    {mode === "EXISTING" && (
                                        <div className="summary-row">
                                            <span>Đã chọn</span>
                                            <strong>{selectedQuestionIds.length} câu</strong>
                                        </div>
                                    )}

                                    {showExamPoint && (
                                        <div className="summary-row">
                                            <span>Điểm kỳ thi</span>
                                            <strong>{examPoint}</strong>
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
                    </div>
                </form>
            </div>
        </div>
    );
}

export default QuestionCreateComponent;