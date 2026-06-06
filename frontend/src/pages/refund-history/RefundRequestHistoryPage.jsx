import React, { useEffect, useMemo, useState } from "react";
import "./RefundRequestHistoryPage.css";
import { getFileUrl } from "../../utils/fileurl";

const RefundRequestHistoryPage = () => {
    const [refundRequests, setRefundRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const API_BASE_URL = "http://localhost:8080";

    useEffect(() => {
        fetchRefundHistory();
    }, []);

    const fetchRefundHistory = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/refunds/history`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && {
                        Authorization: `Bearer ${token}`,
                    }),
                },
            });

            if (!response.ok) {
                const errorText = await response.text();

                if (response.status === 401) {
                    throw new Error("Bạn cần đăng nhập để xem lịch sử khiếu nại.");
                }

                if (response.status === 403) {
                    throw new Error("Bạn không có quyền xem lịch sử khiếu nại này.");
                }

                throw new Error(errorText || "Không thể tải lịch sử khiếu nại.");
            }

            const data = await response.json();

            setRefundRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error.message || "Không thể tải lịch sử khiếu nại. Vui lòng thử lại sau."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredRefundRequests = useMemo(() => {
        return refundRequests.filter((item) => {
            const matchStatus =
                statusFilter === "ALL" || item.status === statusFilter;

            const searchText = `${item.courseTitle || ""} ${item.reason || ""} ${item.reasonCode || ""
                } ${item.refundRequestId || ""}`.toLowerCase();

            const matchKeyword = searchText.includes(keyword.toLowerCase().trim());

            return matchStatus && matchKeyword;
        });
    }, [refundRequests, statusFilter, keyword]);

    const formatDateTime = (value) => {
        if (!value) return "Chưa có";

        const date = new Date(value);

        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return "0 ₫";

        return Number(value).toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return <span className="badge text-bg-warning">Đang chờ duyệt</span>;

            case "APPROVED":
                return <span className="badge text-bg-success">Đã chấp nhận</span>;

            case "REJECTED":
                return <span className="badge text-bg-danger">Đã từ chối</span>;

            case "CANCELLED":
                return <span className="badge text-bg-secondary">Đã hủy</span>;

            default:
                return <span className="badge text-bg-light">{status}</span>;
        }
    };

    const closeDetailModal = () => {
        setSelectedRequest(null);
    };

    return (
        <div className="refund-history-page">
            <div className="container py-4">
                <div className="refund-page-header mb-4">
                    <div>
                        <h3 className="fw-bold mb-1">Lịch sử khiếu nại hoàn tiền</h3>
                        <p className="text-muted mb-0">
                            Xem lại các yêu cầu hoàn tiền khóa học và trạng thái xử lý.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={fetchRefundHistory}
                        disabled={loading}
                    >
                        Làm mới
                    </button>
                </div>



                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}

                {loading ? (
                    <div className="refund-loading-box">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3 text-muted mb-0">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredRefundRequests.length === 0 ? (
                    <div className="refund-empty-box text-center">
                        <div className="refund-empty-icon">📄</div>
                        <h5>Chưa có yêu cầu phù hợp</h5>
                        <p className="text-muted mb-0">
                            Khi bạn gửi yêu cầu hoàn tiền, lịch sử xử lý sẽ hiển thị tại đây.
                        </p>
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Mã yêu cầu</th>
                                            <th>Khóa học</th>
                                            <th>Số tiền</th>
                                            <th>Tiến độ</th>
                                            <th>Ngày gửi</th>
                                            <th>Trạng thái</th>
                                            <th className="text-end">Thao tác</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredRefundRequests.map((item) => (
                                            <tr key={item.refundRequestId}>
                                                <td>
                                                    <span className="fw-semibold">
                                                        #{item.refundRequestId}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="refund-course-thumb">
                                                            {item.courseThumbnailUrl ? (
                                                                <img
                                                                    src={getFileUrl(item.courseThumbnailUrl)}
                                                                    alt={item.courseTitle}
                                                                />
                                                            ) : (
                                                                <span>📘</span>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="fw-semibold refund-course-title">
                                                                {item.courseTitle}
                                                            </div>
                                                            <small className="one-line-text">
                                                                {item.shortDescription}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="fw-semibold">
                                                    {formatCurrency(item.refundAmount)}
                                                </td>

                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="progress refund-progress">
                                                            <div
                                                                className="progress-bar"
                                                                role="progressbar"
                                                                style={{
                                                                    width: `${Number(item.progressPercent || 0)}%`,
                                                                }}
                                                            ></div>
                                                        </div>

                                                        <span className="small">
                                                            {Number(item.progressPercent || 0)}%
                                                        </span>
                                                    </div>

                                                    <small className="text-muted">
                                                        {item.completedLessons || 0}/{item.totalLessons || 0} bài
                                                    </small>
                                                </td>

                                                <td>{formatDateTime(item.createdAt)}</td>

                                                <td>{getStatusBadge(item.status)}</td>

                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => setSelectedRequest(item)}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedRequest && (
                <>
                    <div className="modal fade show refund-modal d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div>
                                        <h5 className="modal-title mb-1">
                                            Chi tiết yêu cầu #{selectedRequest.refundRequestId}
                                        </h5>
                                        <small className="text-muted">
                                            {selectedRequest.courseTitle}
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeDetailModal}
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Trạng thái</label>
                                                <div>{getStatusBadge(selectedRequest.status)}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Số tiền hoàn</label>
                                                <div className="fw-bold">
                                                    {formatCurrency(selectedRequest.refundAmount)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Ngày gửi yêu cầu</label>
                                                <div>{formatDateTime(selectedRequest.createdAt)}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Hạn hoàn tiền</label>
                                                <div>
                                                    {formatDateTime(selectedRequest.refundDeadlineAt)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Ngày mua</label>
                                                <div>{formatDateTime(selectedRequest.purchaseAt)}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Ngày thanh toán</label>
                                                <div>{formatDateTime(selectedRequest.paidAt)}</div>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <hr />
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Mã lý do</label>
                                                <div>{selectedRequest.reasonCode || "Không có"}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Lý do</label>
                                                <div>{selectedRequest.reason || "Không có"}</div>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="refund-detail-box">
                                                <label>Mô tả chi tiết</label>
                                                <div>
                                                    {selectedRequest.detailDescription || "Không có"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <hr />
                                        </div>

                                        <div className="col-md-4">
                                            <div className="refund-detail-box">
                                                <label>Số bài đã học</label>
                                                <div>
                                                    {selectedRequest.completedLessons || 0}/
                                                    {selectedRequest.totalLessons || 0}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-8">
                                            <div className="refund-detail-box">
                                                <label>Tiến độ học</label>
                                                <div className="progress mt-2">
                                                    <div
                                                        className="progress-bar"
                                                        role="progressbar"
                                                        style={{
                                                            width: `${Number(
                                                                selectedRequest.progressPercent || 0
                                                            )}%`,
                                                        }}
                                                    >
                                                        {Number(selectedRequest.progressPercent || 0)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <hr />
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Ngân hàng nhận hoàn tiền</label>
                                                <div>{selectedRequest.refundBankName || "Chưa có"}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Số tài khoản</label>
                                                <div>
                                                    {selectedRequest.refundAccountNumber || "Chưa có"}
                                                </div>
                                            </div>
                                        </div>



                                        <div className="col-12">
                                            <hr />
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Người xử lý</label>
                                                <div>
                                                    {selectedRequest.reviewedByName || "Chưa xử lý"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="refund-detail-box">
                                                <label>Thời gian xử lý</label>
                                                <div>{formatDateTime(selectedRequest.reviewedAt)}</div>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="refund-detail-box">
                                                <label>Ghi chú xử lý</label>
                                                <div>{selectedRequest.reviewNote || "Không có"}</div>
                                            </div>
                                        </div>

                                        {selectedRequest.status === "REJECTED" && (
                                            <div className="col-12">
                                                <div className="alert alert-danger mb-0">
                                                    <strong>Lý do từ chối: </strong>
                                                    {selectedRequest.rejectReason || "Không có"}
                                                </div>
                                            </div>
                                        )}

                                        {selectedRequest.status === "APPROVED" && (
                                            <div className="col-12">
                                                <div className="alert alert-success mb-0">
                                                    Yêu cầu hoàn tiền của bạn đã được chấp nhận.
                                                </div>
                                            </div>
                                        )}

                                        {selectedRequest.status === "PENDING" && (
                                            <div className="col-12">
                                                <div className="alert alert-warning mb-0">
                                                    Yêu cầu đang chờ admin xử lý.
                                                </div>
                                            </div>
                                        )}

                                        {selectedRequest.status === "CANCELLED" && (
                                            <div className="col-12">
                                                <div className="alert alert-secondary mb-0">
                                                    Yêu cầu hoàn tiền này đã được hủy.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeDetailModal}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </div>
    );
};

export default RefundRequestHistoryPage;