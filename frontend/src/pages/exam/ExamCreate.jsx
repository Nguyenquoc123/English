import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JoditEditor from "jodit-react";
import "./ExamCreate.css";

function TeacherExamCreate() {
  const navigate = useNavigate();
  const editor = useRef(null);
  const { courseId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    courseId: courseId || "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    durationMinutes: 45,
    maxAttempts: 1,
    status: "Draft",
  });

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const joditConfig = useMemo(
    () => ({
      readonly: false,
      height: 260,
      placeholder: "Nhập mô tả chi tiết nội dung, yêu cầu và lưu ý của kỳ thi...",
      toolbarAdaptive: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "link",
        "|",
        "align",
        "undo",
        "redo",
      ],
    }),
    []
  );

  useEffect(() => {
    if (!courseId) {
      loadTeacherCourses();
    }
  }, [courseId]);

  const loadTeacherCourses = async () => {
    try {
      setLoadingCourses(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/khoa-hoc/danh-sach-khoa-hoc-teacher`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const result = data?.result || data?.data || data || [];

      if (!response.ok) {
        alert(result?.message || "Không thể tải danh sách khóa học");
        return;
      }

      setCourses(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server khi tải khóa học");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
  };

  const validateForm = () => {
    if (!formData.courseId) {
      alert("Vui lòng chọn khóa học");
      return false;
    }

    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên kỳ thi");
      return false;
    }

    if (formData.title.trim().length < 5) {
      alert("Tên kỳ thi nên có ít nhất 5 ký tự");
      return false;
    }

    const plainDescription = stripHtml(formData.description).trim();

    if (!plainDescription) {
      alert("Vui lòng nhập mô tả kỳ thi");
      return false;
    }

    if (!formData.startTime) {
      alert("Vui lòng chọn thời gian bắt đầu");
      return false;
    }

    if (!formData.endTime) {
      alert("Vui lòng chọn thời gian kết thúc");
      return false;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (start >= end) {
      alert("Thời gian kết thúc phải sau thời gian bắt đầu");
      return false;
    }

    if (!formData.durationMinutes || Number(formData.durationMinutes) <= 0) {
      alert("Thời lượng làm bài phải lớn hơn 0");
      return false;
    }

    if (Number(formData.durationMinutes) > 300) {
      alert("Thời lượng làm bài không nên vượt quá 300 phút");
      return false;
    }

    if (!formData.maxAttempts || Number(formData.maxAttempts) <= 0) {
      alert("Số lần làm bài tối đa phải lớn hơn 0");
      return false;
    }

    if (Number(formData.maxAttempts) > 20) {
      alert("Số lần làm bài tối đa không nên vượt quá 20");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const ok = window.confirm("Bạn có chắc muốn tạo kỳ thi này không?");
    if (!ok) return;

    try {
      setSubmitting(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const payload = {
        courseId: Number(formData.courseId),
        title: formData.title.trim(),
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationMinutes: Number(formData.durationMinutes),
        maxAttempts: Number(formData.maxAttempts),
        status: formData.status,
      };

      const response = await fetch(`${API_BASE}/exams/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        alert(result?.message || "Tạo kỳ thi thất bại");
        return;
      }

      alert("Tạo kỳ thi thành công");

      if (result?.examId) {
        navigate(`/teacher/exams/${result.examId}`);
      } else {
        navigate("/teacher/exams");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống khi tạo kỳ thi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (courseId) {
      navigate(`/teacher/courses/${courseId}`);
      return;
    }

    navigate("/teacher/exams");
  };

  return (
    <div className="teacher-exam-create-page">
      <div className="teacher-exam-create-container">
        <button type="button" className="exam-create-back" onClick={handleBack}>
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>

        <div className="exam-create-heading">
          <div>
            <span className="exam-create-tag">Giáo viên</span>
            <h2>Tạo kỳ thi mới</h2>
            <p>
              Thiết lập thông tin cơ bản cho kỳ thi. Sau khi tạo, bạn có thể thêm câu hỏi vào đề thi.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="exam-create-card">
                <div className="exam-create-card-header">
                  <div className="exam-create-icon">
                    <i className="bi bi-clipboard-check"></i>
                  </div>

                  <div>
                    <h5>Thông tin kỳ thi</h5>
                    <p>Nhập tên kỳ thi, mô tả và thời gian mở bài thi.</p>
                  </div>
                </div>

                <div className="exam-create-body">
                  {!courseId && (
                    <div className="mb-4">
                      <label className="form-label">
                        Khóa học <span>*</span>
                      </label>

                      <select
                        className="form-select"
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleChange}
                        disabled={loadingCourses}
                      >
                        <option value="">
                          {loadingCourses ? "Đang tải khóa học..." : "Chọn khóa học"}
                        </option>

                        {courses.map((course) => (
                          <option key={course.courseId} value={course.courseId}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="form-label">
                      Tên kỳ thi <span>*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Nhập tên kỳ thi, ví dụ: Kiểm tra giữa kỳ - Unit 1"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Mô tả kỳ thi <span>*</span>
                    </label>

                    <div className="exam-editor-box">
                      <JoditEditor
                        ref={editor}
                        value={formData.description}
                        config={joditConfig}
                        onBlur={handleDescriptionChange}
                        onChange={() => {}}
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Thời gian bắt đầu <span>*</span>
                      </label>

                      <input
                        type="datetime-local"
                        className="form-control"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Thời gian kết thúc <span>*</span>
                      </label>

                      <input
                        type="datetime-local"
                        className="form-control"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Thời lượng làm bài <span>*</span>
                      </label>

                      <div className="input-with-suffix">
                        <input
                          type="number"
                          className="form-control"
                          name="durationMinutes"
                          value={formData.durationMinutes}
                          onChange={handleChange}
                          min="1"
                          max="300"
                        />
                        <span>phút</span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Số lần làm bài tối đa <span>*</span>
                      </label>

                      <div className="input-with-suffix">
                        <input
                          type="number"
                          className="form-control"
                          name="maxAttempts"
                          value={formData.maxAttempts}
                          onChange={handleChange}
                          min="1"
                          max="20"
                        />
                        <span>lần</span>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Trạng thái kỳ thi</label>

                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="Draft">Draft - Bản nháp</option>
                        <option value="Open">Open - Mở bài thi</option>
                        <option value="Closed">Closed - Đóng bài thi</option>
                        <option value="Hidden">Hidden - Ẩn bài thi</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="exam-create-footer">
                  <button
                    type="button"
                    className="btn btn-light exam-create-action"
                    onClick={handleBack}
                    disabled={submitting}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Quay lại
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary exam-create-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        Tạo kỳ thi
                        <i className="bi bi-check-circle ms-2"></i>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="exam-create-side-card">
                <div className="side-icon">
                  <i className="bi bi-info-circle"></i>
                </div>

                <h5>Lưu ý khi tạo kỳ thi</h5>

                <ul>
                  <li>
                    <i className="bi bi-check-circle"></i>
                    Nên tạo kỳ thi ở trạng thái Draft trước.
                  </li>

                  <li>
                    <i className="bi bi-check-circle"></i>
                    Sau khi tạo, hãy thêm câu hỏi vào kỳ thi.
                  </li>

                  <li>
                    <i className="bi bi-check-circle"></i>
                    Thời gian kết thúc phải sau thời gian bắt đầu.
                  </li>

                  <li>
                    <i className="bi bi-check-circle"></i>
                    Số lần làm bài tối đa giúp giới hạn số lượt thi của học viên.
                  </li>
                </ul>
              </div>

              <div className="exam-create-side-card mt-3">
                <div className="side-icon warning">
                  <i className="bi bi-shield-check"></i>
                </div>

                <h5>Quy trình đề xuất</h5>

                <div className="exam-create-steps">
                  <div>
                    <span>1</span>
                    <p>Tạo kỳ thi ở trạng thái Draft.</p>
                  </div>

                  <div>
                    <span>2</span>
                    <p>Thêm câu hỏi và điểm cho từng câu.</p>
                  </div>

                  <div>
                    <span>3</span>
                    <p>Kiểm tra lại đề thi trước khi mở.</p>
                  </div>

                  <div>
                    <span>4</span>
                    <p>Chuyển trạng thái sang Open khi sẵn sàng.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherExamCreate;