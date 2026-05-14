import { useEffect, useState } from "react";
import { getAllReviews, deleteReview } from "../../../api/adminApi";
import "./ReviewManagement.css";

function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllReviews();
      setReviews(res.data || []);
    } catch {
      setError("Lỗi tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId, fullName) => {
    const ok = window.confirm(
      `Xóa đánh giá của "${fullName}"?\nThao tác này không thể hoàn tác.`
    );
    if (!ok) return;

    setDeletingId(reviewId);

    try {
      await deleteReview(reviewId);
      loadReviews();
    } catch {
      alert("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  };

  const reviewsWithRating = reviews.filter((r) => r.rating);
  const avgRating =
    reviewsWithRating.length > 0
      ? reviewsWithRating.reduce((sum, r) => sum + r.rating, 0) / reviewsWithRating.length
      : 0;

  const filteredReviews = reviews
    .filter((r) => ratingFilter === 0 || r.rating === ratingFilter)
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (r.fullName || "").toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q)
      );
    });

  const formatDateTime = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
  };

  const renderStars = (rating) => {
    return (
      <span className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "review-star review-star--filled" : "review-star review-star--empty"}
          >
            &#9733;
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="admin-review-page">
      <div className="admin-page-heading">
        <div>
          <h2>Quản lý bình luận &amp; đánh giá</h2>
          <p>
            Admin kiểm duyệt và xóa các đánh giá vi phạm chính sách của hệ thống.
          </p>
        </div>

        <button className="btn btn-outline-secondary" onClick={loadReviews}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Tải lại
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Tổng đánh giá</div>
              <h3 className="fw-bold">{reviews.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Điểm trung bình</div>
              <h3 className="fw-bold review-avg-rating">
                &#9733; {avgRating.toFixed(1)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-filter-card">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="d-flex gap-2 flex-wrap">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              return (
                <button
                  key={star}
                  className={`btn btn-sm ${ratingFilter === star ? "btn-warning" : "btn-outline-secondary"}`}
                  onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                >
                  {"★".repeat(star)} ({count})
                </button>
              );
            })}

            {ratingFilter > 0 && (
              <button
                className="btn btn-sm btn-light"
                onClick={() => { setRatingFilter(0); setSearch(""); }}
              >
                <i className="bi bi-x-circle me-1"></i>
                Xóa lọc
              </button>
            )}
          </div>

          <div className="ms-auto">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm theo tên học viên hoặc nội dung..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <small className="text-muted">
            {filteredReviews.length} / {reviews.length} đánh giá
          </small>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-3"></div>
          <div>Đang tải danh sách đánh giá...</div>
        </div>
      )}

      {!loading && filteredReviews.length === 0 && (
        <div className="admin-table-card text-center text-muted py-5">
          Không có đánh giá nào phù hợp với điều kiện tìm kiếm.
        </div>
      )}

      {!loading && filteredReviews.length > 0 && (
        <div className="review-list">
          {filteredReviews.map((review) => (
            <div key={review.reviewId} className="admin-table-card review-card">
              <div className="review-card-header">
                <div className="review-card-avatar">
                  {review.avatarUrl ? (
                    <img src={review.avatarUrl} alt={review.fullName} />
                  ) : (
                    <div className="review-card-avatar-placeholder">
                      {(review.fullName || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="review-card-info">
                  <div className="fw-bold">{review.fullName || "Học viên ẩn danh"}</div>
                  <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="badge rounded-pill bg-secondary-subtle text-secondary">
                      Khóa học #{review.courseId}
                    </span>
                    <small className="text-muted">{formatDateTime(review.createdAt)}</small>
                  </div>
                </div>

                <button
                  className="btn btn-sm btn-outline-danger ms-auto"
                  disabled={deletingId === review.reviewId}
                  onClick={() => handleDelete(review.reviewId, review.fullName)}
                >
                  {deletingId === review.reviewId ? "Đang xóa..." : "Xóa"}
                </button>
              </div>

              <div className="review-card-comment">
                {review.comment || <em className="text-muted">Không có nội dung bình luận</em>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewManagement;
