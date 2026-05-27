import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFileUrl } from '../../utils/fileurl';
import "./CartPage.css"

export default function CartPage() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/dang-nhap');
            return;
        }

        dsKhoaHocInGioHang();
    }, []);

    const dsKhoaHocInGioHang = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await fetch('http://localhost:8080/gio-hang/khoa-hoc', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Không thể tải giỏ hàng');
            }

            const data = await res.json();

            /*
              data có thể là:
              [
                {
                  cartItemId,
                  courseId,
                  title,
                  shortDescription,
                  thumbnailUrl,
                  price,
                  teacherName,
                  levelName
                }
              ]
            */

            setCartItems(Array.isArray(data) ? data : data.items || []);
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tải giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        const confirmDelete = window.confirm('Bạn có muốn xóa khóa học này khỏi giỏ hàng không?');
        if (!confirmDelete) return;

        try {
            setRemovingId(cartItemId);

            const res = await fetch(`http://localhost:8080/gio-hang/xoa/${cartItemId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Không thể xóa khóa học khỏi giỏ hàng');
            }

            setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
            window.dispatchEvent(new Event('cartChanged'));
        } catch (err) {
            alert(err.message || 'Xóa khóa học thất bại');
        } finally {
            setRemovingId(null);
        }
    };

    const totalAmount = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
    }, [cartItems]);

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('vi-VN') + ' đ';
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        navigate('/thanh-toan');
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-3 mb-0">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Giỏ hàng của tôi</h3>

                </div>


            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-cart-x display-4 text-muted" />
                        <h5 className="fw-bold mt-3">Giỏ hàng đang trống</h5>
                        <p className="text-muted">
                            Bạn chưa thêm khóa học nào vào giỏ hàng.
                        </p>
                        <Link to="/danh-sach-khoa-hoc" className="btn btn-primary">
                            Khám phá khóa học
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            

                            <div className="list-group list-group-flush">
                                {cartItems.map((item) => (
                                    <div className="list-group-item p-3" key={item.cartItemId}>
                                        <div className="row g-3 align-items-center">
                                            <div className="col-md-3">
                                                <img
                                                    src={
                                                        getFileUrl(item.thumbnailUrl) ||
                                                        'https://via.placeholder.com/300x180?text=Course'
                                                    }
                                                    alt={item.title}
                                                    className="img-fluid rounded"
                                                    style={{
                                                        width: '100%',
                                                        height: '120px',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <h5 className="fw-bold mb-2 cart-course-title">
                                                    <Link
                                                        to={`/khoa-hoc/${item.courseId}`}
                                                        className="text-decoration-none text-dark"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </h5>

                                                <p className="text-muted small mb-2 cart-course-description">
                                                    {item.shortDescription || 'Chưa có mô tả ngắn cho khóa học này.'}
                                                </p>

                                                <div className="d-flex flex-wrap gap-2">
                                                    {/* {item.teacherName && (
                                                        <span className="badge text-bg-light">
                                                            <i className="bi bi-person me-1" />
                                                            {item.teacherName}
                                                        </span>
                                                    )} */}

                                                    {item.levelName && (
                                                        <span className="badge text-bg-light">
                                                            <i className="bi bi-bar-chart me-1" />
                                                            {item.levelName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-md-3 text-md-end">
                                                <div className="fw-bold text-primary fs-5 mb-3">
                                                    {formatPrice(item.price)}
                                                </div>

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    disabled={removingId === item.cartItemId}
                                                    onClick={() => handleRemoveItem(item.cartItemId)}
                                                >
                                                    {removingId === item.cartItemId ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1" />
                                                            Đang xóa
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-trash me-1" />
                                                            Xóa
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white">
                                <strong>Tóm tắt đơn hàng</strong>
                            </div>

                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Số khóa học</span>
                                    <strong>{cartItems.length}</strong>
                                </div>

                                

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="fw-bold">Tổng cộng</span>
                                    <span className="fw-bold text-primary fs-4">
                                        {formatPrice(totalAmount)}
                                    </span>
                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                    onClick={handleCheckout}
                                >
                                    <i className="bi bi-credit-card me-2" />
                                    Thanh toán
                                </button>
                            </div>
                        </div>

                        
                    </div>
                </div>
            )}
        </div>
    );
}