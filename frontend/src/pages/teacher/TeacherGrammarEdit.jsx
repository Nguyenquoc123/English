import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JoditEditor from "jodit-react";
import "./TeacherGrammarCreate.css";
import CourseBreadcrumb from "../../components/CourseBreadcrumb/CourseBreadcrumb";
import { teacherLessonTrail } from "../../utils/breadcrumbPaths";

function TeacherGrammarEdit() {
  const navigate = useNavigate();
  const { courseId, lessonId, grammarId } = useParams();
  const editor = useRef(null);

  const API_BASE = "http://localhost:8080";

  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 360,
      placeholder: "Nhập nội dung ngữ pháp...",
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

  useEffect(() => {
    loadGrammarInfo();
  }, [grammarId]);

  const parseJsonSafely = async (response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const removeHtmlTags = (html) => {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();
  };

  const loadGrammarInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/grammar/${grammarId}`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        setError(data?.message || "Không thể tải thông tin ngữ pháp");
        return;
      }

      const grammarData = data?.result || data?.data || data;

      setTitle(grammarData.title || "");
      setContentHtml(grammarData.contentHtml || "");
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
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
      setSaving(true);

      const token = localStorage.getItem("token");

      const requestData = {
        grammarId: Number(grammarId),
        lessonId: Number(lessonId),
        title: title.trim(),
        contentHtml: contentHtml.trim(),
      };

      const response = await fetch(`${API_BASE}/grammar/${grammarId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestData),
      });

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        setError(data?.message || "Cập nhật ngữ pháp thất bại");
        return;
      }

      alert("Cập nhật ngữ pháp thành công");
      navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`);
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadGrammarInfo();
  };

  if (loading) {
    return (
      <div className="grammar-create-page">
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải thông tin ngữ pháp...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grammar-create-page">
      <CourseBreadcrumb
        items={teacherLessonTrail(courseId, lessonId, "Chỉnh sửa ngữ pháp")}
      />

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mt-3">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-1">
        <div className="card border-0 shadow-sm grammar-card">
          <div className="card-header bg-white border-0 pb-0">
            <h5 className="fw-bold mb-1">
              <i className="bi bi-journal-text text-primary me-2"></i>
              Thông tin ngữ pháp
            </h5>

            <small className="text-muted">
              Các trường có dấu <span className="text-danger">*</span> là bắt buộc
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
                  placeholder="Nhập tiêu đề ngữ pháp"
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
            </div>
          </div>
        </div>

        <div className="grammar-action-bar mt-4">
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
            ) : (
              <>
                <i className="bi bi-save me-1"></i>
                Lưu thay đổi
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleReset}
            disabled={saving}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Khôi phục
          </button>

          <button
            type="button"
            className="btn btn-light"
            onClick={() =>
              navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)
            }
            disabled={saving}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default TeacherGrammarEdit;