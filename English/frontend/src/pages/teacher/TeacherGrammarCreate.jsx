import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JoditEditor from "jodit-react";
import "./TeacherGrammarCreate.css";

function TeacherGrammarCreate() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const editor = useRef(null);

  const API_BASE = "http://localhost:8080";

  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 360,
      placeholder:
        "Nhập nội dung ngữ pháp, ví dụ: cấu trúc, cách dùng, ví dụ minh họa...",
      language: "vi",
      toolbarAdaptive: false,
      toolbarSticky: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "brush",
        "|",
        "paragraph",
        "align",
        "|",
        "link",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "source",
      ],
      removeButtons: ["image", "video", "file"],
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",
    }),
    []
  );

  const removeHtmlTags = (html) => {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();
  };

  const validateForm = () => {
    if (!title.trim()) {
      return "Vui lòng nhập tiêu đề ngữ pháp";
    }

    if (title.trim().length > 255) {
      return "Tiêu đề ngữ pháp không được vượt quá 255 ký tự";
    }

    if (!removeHtmlTags(contentHtml)) {
      return "Vui lòng nhập nội dung ngữ pháp";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const validateMessage = validateForm();

    if (validateMessage) {
      setError(validateMessage);
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const requestData = {
        lessonId: Number(lessonId),
        title: title.trim(),
        contentHtml: contentHtml.trim(),
      };

      const response = await fetch(
        `${API_BASE}/grammar/${lessonId}/grammars`,
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
        setError(data?.message || "Thêm ngữ pháp thất bại");
        return;
      }

      alert("Thêm ngữ pháp thành công");

      navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`);
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setContentHtml("");
    setError("");
  };

  return (
    <div className="grammar-create-page">
      <div className="grammar-create-heading">
        <div>
          <button
            type="button"
            className="grammar-back-link"
            onClick={() =>
              navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
            }
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại chi tiết bài học
          </button>

          <h2>Thêm nội dung ngữ pháp</h2>

          <p>
            Soạn nội dung ngữ pháp cho bài học hiện tại. Nội dung sẽ được lưu
            dạng HTML và hiển thị ở tab Ngữ pháp trong chi tiết lesson.
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
            <div className="card border-0 shadow-sm grammar-card">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-journal-text text-primary me-2"></i>
                  Thông tin ngữ pháp
                </h5>

                <small className="text-muted">
                  Các trường có dấu <span className="text-danger">*</span> là
                  bắt buộc
                </small>
              </div>

              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Tiêu đề ngữ pháp <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-type"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Thì hiện tại đơn, Câu bị động, Mệnh đề quan hệ..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Nội dung ngữ pháp <span className="text-danger">*</span>
                  </label>

                  <div className="jodit-wrapper">
                    <JoditEditor
                      ref={editor}
                      value={contentHtml}
                      config={editorConfig}
                      tabIndex={1}
                      onBlur={(newContent) => setContentHtml(newContent)}
                      onChange={() => {}}
                    />
                  </div>

                  <small className="text-muted">
                    Có thể trình bày cấu trúc, cách dùng, ví dụ, lưu ý và bài
                    mẫu trong phần này.
                  </small>
                </div>
              </div>
            </div>

            <div className="grammar-action-bar mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i>
                    Lưu ngữ pháp
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Làm mới
              </button>

              <button
                type="button"
                className="btn btn-light"
                onClick={() =>
                  navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
                }
                disabled={loading}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Quay lại
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm grammar-side-card">
              <div className="card-header bg-white border-0 pb-0">
                <h6 className="fw-bold mb-1">
                  <i className="bi bi-eye text-primary me-2"></i>
                  Xem trước
                </h6>

                <small className="text-muted">
                  Nội dung sẽ hiển thị ở tab Ngữ pháp
                </small>
              </div>

              <div className="card-body">
                <div className="grammar-preview">
                  <h5>{title || "Tiêu đề ngữ pháp chưa nhập"}</h5>

                  {contentHtml ? (
                    <div
                      className="grammar-preview-html"
                      dangerouslySetInnerHTML={{ __html: contentHtml }}
                    ></div>
                  ) : (
                    <p className="text-muted mb-0">
                      Chưa có nội dung ngữ pháp.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-3">
              <strong>Gợi ý:</strong> Nội dung ngữ pháp nên có cấu trúc rõ ràng:
              khái niệm, công thức, cách dùng, ví dụ và lưu ý.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeacherGrammarCreate;