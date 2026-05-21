import { useEffect, useState } from "react";
import "./DanhSachBaiOnTap.css";
import { useNavigate } from "react-router-dom";


function DanhSachBaiOnTap() {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(false);

    const layDanhSachBaiOnTap = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (keyword.trim()) {
                params.append("keyword", keyword.trim());
            }

            if (type) {
                params.append("type", type);
            }

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:8080/personal-practices?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Không thể tải danh sách bài ôn tập");
            }

            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách bài ôn tập:", error);

            // Dữ liệu mẫu khi API chưa chạy hoặc lỗi
            setReviews(defaultReviews);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        layDanhSachBaiOnTap();
    }, []);

    const handleSearch = () => {
        layDanhSachBaiOnTap();
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc muốn xoá bài ôn tập này?");

        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/api/reviews/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Không thể xoá bài ôn tập");
            }

            setReviews((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Lỗi khi xoá bài ôn tập:", error);
            alert("Không thể xoá bài ôn tập.");
        }
    };

    const handleStartReview = (id) => {
        navigate(`/personal-practices/${id}`)
    };

    return (
        <div className="review-page">
            <div className="container py-4">


                <div className="filter-box bg-white p-4 rounded-4 shadow-sm mb-4">
                    <div className="d-flex align-items-center gap-2 mb-3 text-primary fw-semibold">

                        <span>Tìm kiếm và lọc bài ôn tập</span>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-5">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Từ khóa tìm kiếm..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="">Tất cả các dạng ôn tập</option>
                                <option value="Multi">Trắc nghiệm</option>
                                <option value="Grammar">Sắp xếp</option>
                                {/* <option value="Listening">Nghe</option>
                                <option value="Vocabulary">Từ vựng</option> */}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <button
                                className="btn btn-search btn-primary w-100"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? "Đang tìm..." : "Tìm kiếm"}
                            </button>
                        </div>

                        <div className="col-md-2">
                            <button
                                className="btn btn-search btn-success w-100"
                                onClick={() => navigate("/personal-practices/create")}

                            >
                                Tạo bài ôn tập mới
                            </button>
                        </div>
                    </div>
                </div>

                <h5 className="fw-bold mb-4">Danh sách bài ôn tập cá nhân</h5>

                {loading ? (
                    <div className="text-center py-5">
                        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="alert alert-light border">
                        Không có bài ôn tập nào.
                    </div>
                ) : (
                    <div className="row g-4">
                        {reviews.map((review) => (
                            <div className="col-md-4" key={review.personalPracticeId}>
                                <div className="review-card bg-white rounded-4 shadow-sm overflow-hidden">
                                    <div className={`review-card-header ${review.color || "blue"}`}>
                                        <h6 className="mb-0">{review.title}</h6>
                                        <div className="decor-icon">!</div>
                                    </div>

                                    <div className="review-card-body d-flex justify-content-between align-items-center">
                                        <button
                                            className="btn btn-light text-danger fw-semibold px-4"
                                            onClick={() => handleDelete(review.personalPracticeId)}
                                        >
                                            Xóa bài
                                        </button>

                                        <button
                                            className="btn btn-primary px-4"
                                            onClick={() => handleStartReview(review.personalPracticeId)}
                                        >
                                            Làm bài
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DanhSachBaiOnTap;