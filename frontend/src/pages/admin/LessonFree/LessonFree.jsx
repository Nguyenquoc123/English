import { useEffect, useState } from "react";
import {
  getFreeLessons,
  createFreeLesson,
  updateFreeLesson,
  deleteFreeLesson,
} from "../../../api/adminApi";
import "./LessonFree.css";

function LessonFree() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("Published");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await getFreeLessons();
      setLessons(res.data);
    } catch {
      alert("Lỗi tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditLesson(null);
    setFormTitle("");
    setFormDescription("");
    setFormStatus("Published");
    setShowModal(true);
  };

  const openEditModal = (lesson) => {
    setEditLesson(lesson);
    setFormTitle(lesson.title || "");
    setFormDescription(lesson.description || "");
    setFormStatus(lesson.status || "Published");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditLesson(null);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      alert("Vui lòng nhập tiêu đề bài học");
      return;
    }

    try {
      setSaving(true);
      if (editLesson) {
        await updateFreeLesson(editLesson.lessonId, formTitle, formDescription, formStatus);
        alert("Cập nhật bài học thành công");
      } else {
        await createFreeLesson(formTitle, formDescription, formStatus);
        alert("Tạo bài học miễn phí thành công");
      }
      closeModal();
      fetchLessons();
    } catch {
      alert("Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId, title) => {
    const ok = window.confirm(`Xóa bài học "${title}"?\nBài học sẽ bị ẩn khỏi hệ thống.`);
    if (!ok) return;

    setDeletingId(lessonId);
    try {
      await deleteFreeLesson(lessonId);
      alert("Đã xóa bài học");
      fetchLessons();
    } catch {
      alert("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Published") return "badge rounded-pill text-bg-success";
    if (status === "Hidden") return "badge rounded-pill text-bg-warning";
    if (status === "deleted") return "badge rounded-pill text-bg-danger";
    return "badge rounded-pill text-bg-secondary";
  };

  return (
    <div className="admin-lesson-free-page">
      <div className="admin-page-heading">
        <div>
          <h2>Quản lý bài học miễn phí</h2>
          <p>Tạo, chỉnh sửa và xóa các bài học miễn phí hiển thị công khai cho học viên.</p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="bi bi-plus-lg me-1"></i>
          Tạo bài học mới
        </button>
      </div>

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải danh sách bài học...</div>
        </div>
      )}

      {!loading && (
        <div className="admin-table-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Tiêu đề</th>
                  <th>Mô tả</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {lessons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-5">
                      Chưa có bài học miễn phí nào. Nhấn "Tạo bài học mới" để bắt đầu.
                    </td>
                  </tr>
                ) : (
                  lessons.map((lesson, idx) => (
                    <tr key={lesson.lessonId}>
                      <td>{idx + 1}</td>
                      <td className="lesson-title-cell">{lesson.title}</td>
                      <td className="lesson-desc-cell">
                        {lesson.description
                          ? lesson.description.length > 80
                            ? lesson.description.substring(0, 80) + "..."
                            : lesson.description
                          : "—"}
                      </td>
                      <td>
                        <span className="badge rounded-pill bg-primary-subtle text-primary">
                          {lesson.lessonType || "Free"}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadge(lesson.status)}>
                          {lesson.status}
                        </span>
                      </td>
                      <td>
                        {lesson.createdAt
                          ? new Date(lesson.createdAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(lesson)}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Sửa
                          </button>

                          {lesson.status !== "deleted" && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              disabled={deletingId === lesson.lessonId}
                              onClick={() => handleDelete(lesson.lessonId, lesson.title)}
                            >
                              {deletingId === lesson.lessonId ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <>
                                  <i className="bi bi-trash me-1"></i>
                                  Xóa
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="lesson-modal-overlay" onClick={closeModal}>
          <div className="lesson-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="lesson-modal-header">
              <h5 className="mb-0 fw-bold">
                {editLesson ? "Chỉnh sửa bài học" : "Tạo bài học miễn phí"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
              ></button>
            </div>

            <div className="lesson-modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Tiêu đề <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Nhập tiêu đề bài học..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={255}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Mô tả</label>
                <textarea
                  className="form-control"
                  placeholder="Mô tả ngắn về nội dung bài học..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Trạng thái</label>
                <select
                  className="form-select"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  <option value="Published">Hiển thị (Published)</option>
                  <option value="Hidden">Ẩn (Hidden)</option>
                </select>
              </div>
            </div>

            <div className="lesson-modal-footer">
              <button className="btn btn-light" onClick={closeModal}>
                Huỷ
              </button>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang lưu...
                  </>
                ) : editLesson ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonFree;
