import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherQuestionCreate.css";

function TeacherQuestionCreate() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const PRACTICE_TYPES = [
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

  const selectedPracticeType = useMemo(() => {
    return PRACTICE_TYPES.find((item) => item.value === questionType);
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

  const loadExistingQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setError("");

      const token = localStorage.getItem("token");

      /*
        API gợi ý:
        GET /teacher/questions/my-bank?questionType=MULTIPLE_CHOICE

        Response:
        [
          {
            questionId,
            questionType,
            content,
            correctText,
            optionCount,
            defaultPoint,
            status
          }
        ]
      */

      const response = await fetch(
        `${API_BASE}/questions/my-bank?questionType=${questionType}`,
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
        setError(data?.message || "Không thể tải ngân hàng câu hỏi");
        return;
      }

      const list = data.result || data.data || data;

      setExistingQuestions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetNewQuestionForm = (nextType) => {
    setContent("");
    setCorrectText("");
    setExplanation("");
    setDefaultPoint(1);
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

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (mode === "NEW") {
      await createNewQuestionAndAttach();
    } else {
      await attachExistingQuestions();
    }
  };

  const createNewQuestionAndAttach = async () => {
    const validateMessage = validateNewQuestion();

    if (validateMessage) {
      setError(validateMessage);
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const validOptions = options
        .filter((item) => item.optionText.trim())
        .map((item) => ({
          optionText: item.optionText.trim(),
          isCorrect: item.isCorrect,
        }));

      const requestData = {
        lessonId: Number(lessonId),
        questionType,
        content: content.trim(),
        correctText: correctText.trim() || null,
        explanation: explanation.trim() || null,
        defaultPoint: Number(defaultPoint),
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

      /*
        API gợi ý:
        POST /teacher/lessons/{lessonId}/questions

        Backend:
        - tạo question
        - tạo question_options nếu có
        - tạo lesson_questions
        - ensure lesson_practice_configs tồn tại cho questionType
      */

      const response = await fetch(
        `${API_BASE}/questions/lessons/${lessonId}`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Thêm câu hỏi thất bại");
        return;
      }

      alert("Thêm câu hỏi vào lesson thành công");

      navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`);
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const attachExistingQuestions = async () => {
    const validateMessage = validateExistingQuestion();

    if (validateMessage) {
      setError(validateMessage);
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const requestData = {
        lessonId: Number(lessonId),
        questionType,
        questionIds: selectedQuestionIds,
      };

      /*
        API gợi ý:
        POST /teacher/lessons/{lessonId}/questions/attach

        Backend:
        - kiểm tra các questionId thuộc giáo viên hiện tại
        - kiểm tra questionType khớp
        - gắn vào lesson_questions
        - tránh gắn trùng
        - ensure lesson_practice_configs tồn tại cho questionType
      */

      const response = await fetch(
        `${API_BASE}/questions/lessons/${lessonId}/attach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

      if (!response.ok) {
        setError(data?.message || "Gắn câu hỏi cũ thất bại");
        return;
      }

      alert("Gắn câu hỏi vào lesson thành công");

      navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`);
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
      return "Nhập yêu cầu và nhập câu hoàn chỉnh đúng. Sau này hệ thống có thể tách câu thành các từ để học viên sắp xếp.";
    }

    if (questionType === "WRITING_SHORT") {
      return "Nhập đề bài viết ngắn và đáp án mẫu hoặc từ khóa gợi ý để giáo viên/AI chấm.";
    }

    return "";
  };

  return (
    <div className="question-create-page">
      <div className="question-create-heading">
        <div>
          <button
            type="button"
            className="question-back-link"
            onClick={() =>
              navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
            }
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại chi tiết bài học
          </button>

          <h2>Thêm câu hỏi ôn tập</h2>

          <p>
            Giáo viên có thể tạo câu hỏi mới hoặc chọn lại câu hỏi đã tạo trước
            đó để gắn vào lesson hiện tại.
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
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-question-circle text-primary me-2"></i>
                  Chọn dạng ôn tập
                </h5>

                <small className="text-muted">
                  Dạng ôn tập sẽ quyết định cách nhập câu hỏi và cách học viên
                  làm bài.
                </small>
              </div>

              <div className="card-body">
                <div className="practice-type-grid">
                  {PRACTICE_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.value}
                      className={
                        questionType === type.value
                          ? "practice-type-card active"
                          : "practice-type-card"
                      }
                      onClick={() => handleChangeQuestionType(type.value)}
                    >
                      <i className={`bi ${type.icon}`}></i>
                      <strong>{type.label}</strong>
                      <span>{type.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm question-card mt-4">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-gear text-primary me-2"></i>
                  Cách thêm câu hỏi
                </h5>
              </div>

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
                  <label
                    className="btn btn-outline-primary"
                    htmlFor="modeExisting"
                  >
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

                  <small className="text-muted">
                    {getQuestionTypeGuide()}
                  </small>
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
                          <div className="option-item" key={index}>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="correctOption"
                                checked={option.isCorrect}
                                onChange={() =>
                                  handleCorrectOptionChange(index)
                                }
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
                        Chọn câu hỏi đã tạo trước đó để gắn vào lesson này.
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
                      <strong>{selectedPracticeType?.label}</strong>.
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
                          onClick={() =>
                            toggleSelectQuestion(question.questionId)
                          }
                        >
                          <div className="question-check">
                            {selectedQuestionIds.includes(
                              question.questionId
                            ) ? (
                              <i className="bi bi-check-circle-fill"></i>
                            ) : (
                              <i className="bi bi-circle"></i>
                            )}
                          </div>

                          <div className="flex-grow-1 text-start">
                            <strong>{question.content}</strong>

                            <div className="existing-meta">
                              <span>
                                {question.optionCount || 0} đáp án
                              </span>
                              <span>
                                {question.defaultPoint || 1} điểm
                              </span>
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
                    Tạo và gắn câu hỏi
                  </>
                ) : (
                  <>
                    <i className="bi bi-link-45deg me-1"></i>
                    Gắn câu hỏi đã chọn
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-light"
                onClick={() =>
                  navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
                }
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
                  Tóm tắt dạng ôn tập
                </h6>
              </div>

              <div className="card-body">
                <div className="practice-summary">
                  <div className="summary-icon">
                    <i className={`bi ${selectedPracticeType?.icon}`}></i>
                  </div>

                  <h5>{selectedPracticeType?.label}</h5>
                  <p>{selectedPracticeType?.description}</p>

                  <hr />

                  <div className="summary-row">
                    <span>Lesson ID</span>
                    <strong>{lessonId}</strong>
                  </div>

                  <div className="summary-row">
                    <span>Loại câu hỏi</span>
                    <strong>{questionType}</strong>
                  </div>

                  <div className="summary-row">
                    <span>Cách thêm</span>
                    <strong>
                      {mode === "NEW" ? "Tạo mới" : "Chọn câu cũ"}
                    </strong>
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
                        {
                          options.filter((item) => item.optionText.trim())
                            .length
                        }
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

            <div className="alert alert-info mt-3">
              <strong>Lưu ý:</strong> Khi thêm câu hỏi vào lesson, backend nên
              đảm bảo có bản ghi trong <code>lesson_practice_configs</code> cho
              dạng ôn tập tương ứng.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeacherQuestionCreate;