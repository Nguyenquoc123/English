import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherVocabularyCreate.css";

function TeacherVocabularyCreate() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const API_BASE = "http://localhost:8080";

  const [word, setWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [meaning, setMeaning] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");

  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [audioPreviewName, setAudioPreviewName] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [displayOrder, setDisplayOrder] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!word.trim()) {
      return "Vui lòng nhập từ vựng";
    }

    if (word.trim().length > 255) {
      return "Từ vựng không được vượt quá 255 ký tự";
    }

    if (!meaning.trim()) {
      return "Vui lòng nhập nghĩa của từ vựng";
    }

    if (meaning.trim().length > 1000) {
      return "Nghĩa của từ không được vượt quá 1000 ký tự";
    }

    if (pronunciation.trim().length > 255) {
      return "Phiên âm không được vượt quá 255 ký tự";
    }

    if (exampleSentence.trim().length > 1000) {
      return "Câu ví dụ không được vượt quá 1000 ký tự";
    }

    if (displayOrder && Number(displayOrder) < 0) {
      return "Thứ tự hiển thị không được âm";
    }

    return "";
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",
      "audio/aac",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("File audio chỉ hỗ trợ MP3, WAV, M4A hoặc AAC");
      return;
    }

    setError("");
    setAudioFile(file);
    setAudioPreviewName(file.name);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
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

      const vocabularyData = {
        word: word.trim(),
        pronunciation: pronunciation.trim(),
        meaning: meaning.trim(),
        exampleSentence: exampleSentence.trim(),
        audioUrl: null,
        imageUrl: null,

        // Vì chỉ upload 1 audio và 1 image nên index = 0 nếu có file
        audioFileIndex: audioFile ? 0 : null,
        imageFileIndex: imageFile ? 0 : null,

        displayOrder: displayOrder ? Number(displayOrder) : null,
      };

      const formData = new FormData();

      formData.append(
        "data",
        new Blob([JSON.stringify(vocabularyData)], {
          type: "application/json",
        })
      );

      if (audioFile) {
        formData.append("audioFiles", audioFile);
      }

      if (imageFile) {
        formData.append("imageFiles", imageFile);
      }

      /*
        Backend gợi ý nhận:
        @RequestPart("data") VocabularyRequest request
        @RequestPart(value = "audioFiles", required = false) List<MultipartFile> audioFiles
        @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles
      */

      const response = await fetch(
        `${API_BASE}/tu-vung/${lessonId}/them-tu-vung`,
        {
          method: "POST",
          headers: {
            // Không set Content-Type khi dùng FormData
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
        setError(data?.message || "Thêm từ vựng thất bại");
        return;
      }

      alert("Thêm từ vựng thành công");

      navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`);
    } catch (err) {
      console.error(err);
      setError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWord("");
    setPronunciation("");
    setMeaning("");
    setExampleSentence("");
    setDisplayOrder("");

    setAudioFile(null);
    setImageFile(null);
    setAudioPreviewName("");
    setImagePreviewUrl("");

    setError("");
  };

  return (
    <div className="vocab-create-page">
      <div className="vocab-create-heading">
        <div>
          <button
            type="button"
            className="vocab-back-link"
            onClick={() => navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại chi tiết bài học
          </button>

          <h2>Thêm từ vựng mới</h2>

          <p>
            Thêm từ vựng vào bài học hiện tại. Giáo viên có thể nhập từ, phiên
            âm, nghĩa, câu ví dụ và tải thêm audio phát âm hoặc hình ảnh minh
            họa.
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
            <div className="card border-0 shadow-sm vocab-card">
              <div className="card-header bg-white border-0 pb-0">
                <h5 className="fw-bold mb-1">
                  <i className="bi bi-card-text text-primary me-2"></i>
                  Thông tin từ vựng
                </h5>

                <small className="text-muted">
                  Các trường có dấu <span className="text-danger">*</span> là
                  bắt buộc
                </small>
              </div>

              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Từ vựng <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-light">Aa</span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập từ vựng tiếng Anh, ví dụ: daily routine"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Phiên âm</label>

                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-volume-up"></i>
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập phiên âm, ví dụ: /ˈdeɪ.li ruːˈtiːn/"
                      value={pronunciation}
                      onChange={(e) => setPronunciation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Nghĩa <span className="text-danger">*</span>
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Nhập nghĩa tiếng Việt hoặc giải thích ngắn"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Câu ví dụ</label>

                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Nhập câu ví dụ sử dụng từ vựng"
                    value={exampleSentence}
                    onChange={(e) => setExampleSentence(e.target.value)}
                  ></textarea>

                  <small className="text-muted">
                    Gợi ý: hãy cung cấp ít nhất 1 ví dụ trong các ngữ cảnh khác nhau.
                  </small>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Thứ tự hiển thị
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-sort-numeric-down"></i>
                      </span>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        placeholder="Bỏ trống nếu muốn tự động"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(e.target.value)}
                      />
                    </div>

                    <small className="text-muted">
                      Nếu bỏ trống, backend có thể tự xếp ở cuối danh sách.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="vocab-action-bar mt-4">
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
                    Lưu từ vựng
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
                onClick={() => navigate(`/teacher/courses/${courseId}/lessons/${lessonId}`)}
                disabled={loading}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Quay lại
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm vocab-side-card mb-4">
              <div className="card-header bg-white border-0 pb-0">
                <h6 className="fw-bold mb-1">Audio phát âm</h6>
                <small className="text-muted">Tải lên file phát âm của từ</small>
              </div>

              <div className="card-body">
                <label className="upload-audio-box">
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,.aac,audio/*"
                    hidden
                    onChange={handleAudioChange}
                  />

                  <div className="upload-placeholder">
                    <i className="bi bi-file-earmark-music"></i>
                    <strong>
                      {audioPreviewName || "Kéo thả file audio"}
                    </strong>
                    <span>Hoặc click để tải lên</span>
                    <small>Hỗ trợ MP3, WAV, M4A</small>
                  </div>
                </label>

                {audioFile && (
                  <div className="selected-file mt-3">
                    <div>
                      <strong>{audioFile.name}</strong>
                      <span>{(audioFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setAudioFile(null);
                        setAudioPreviewName("");
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm vocab-side-card mb-4">
              <div className="card-header bg-white border-0 pb-0">
                <h6 className="fw-bold mb-1">Hình ảnh minh họa</h6>
                <small className="text-muted">Tải ảnh minh họa cho từ vựng</small>
              </div>

              <div className="card-body">
                <label className="upload-image-box">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />

                  {imagePreviewUrl ? (
                    <img src={imagePreviewUrl} alt="Preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <i className="bi bi-image"></i>
                      <strong>Chọn hình minh họa</strong>
                      <span>PNG, JPG, JPEG, WEBP</span>
                    </div>
                  )}
                </label>

                {imageFile && (
                  <div className="selected-file mt-3">
                    <div>
                      <strong>{imageFile.name}</strong>
                      <span>{(imageFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreviewUrl("");
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm vocab-side-card">
              <div className="card-header bg-white border-0 pb-0">
                <h6 className="fw-bold mb-1">Xem trước</h6>
                <small className="text-muted">Thông tin từ vựng sẽ lưu</small>
              </div>

              <div className="card-body">
                <div className="vocab-preview">
                  <div className="preview-word">
                    {word || "Từ vựng chưa nhập"}
                  </div>

                  <div className="preview-pronunciation">
                    {pronunciation || "Chưa có phiên âm"}
                  </div>

                  <div className="preview-meaning">
                    {meaning || "Chưa nhập nghĩa"}
                  </div>

                  {exampleSentence && (
                    <div className="preview-example">
                      “{exampleSentence}”
                    </div>
                  )}

                  <div className="preview-media mt-3">
                    <span>
                      <i className="bi bi-volume-up me-1"></i>
                      {audioFile ? "Có audio" : "Chưa có audio"}
                    </span>

                    <span>
                      <i className="bi bi-image me-1"></i>
                      {imageFile ? "Có ảnh" : "Chưa có ảnh"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-info mt-3">
              <strong>Gợi ý:</strong> Một từ vựng tốt nên có nghĩa rõ ràng,
              ví dụ cụ thể và audio phát âm nếu có.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeacherVocabularyCreate;