import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

function LichSuLamBai() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        layLichSuLamBai();
    }, []);

    const layLichSuLamBai = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/lich-su-lam-bai`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Không thể tải lịch sử làm bài");
            }

            const data = await response.json();
            setAttempts(data);
        } catch (err) {
            console.error(err);
            setError("Không thể tải lịch sử làm bài.");
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return "Chưa nộp";

        return new Date(dateTime).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatDuration = (seconds) => {
        if (seconds === null || seconds === undefined) return "-";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes} phút ${remainingSeconds} giây`;
    };

    const getAttemptName = (attempt) => {
        if (attempt.examTitle) return attempt.examTitle;
        if (attempt.lessonTitle) return attempt.lessonTitle;
        if (attempt.practiceType) return attempt.practiceType;

        return "Bài làm";
    };

    const getScoreText = (attempt) => {
        if (attempt.score === null || attempt.score === undefined) return "-";
        return attempt.score;
    };

    const getResultBadgeClass = (status) => {
        if (!status) return "bg-secondary";

        const value = status.toLowerCase();

        if (value.includes("pass") || value.includes("đạt")) {
            return "bg-success";
        }

        if (value.includes("fail") || value.includes("không đạt")) {
            return "bg-danger";
        }

        if (value.includes("submitted") || value.includes("completed") || value.includes("hoàn thành")) {
            return "bg-primary";
        }

        return "bg-secondary";
    };

    const handleViewDetail = (attemptId) => {
        navigate(`/lich-su-lam-bai/${attemptId}`);
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h3 className="mb-1">Lịch sử làm bài</h3>
                    
                </div>

           
            </div>

            {loading && (
                <div className="alert alert-info">
                    Đang tải dữ liệu...
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {!loading && !error && attempts.length === 0 && (
                <div className="alert alert-warning">
                    Chưa có lịch sử làm bài.
                </div>
            )}

            {!loading && !error && attempts.length > 0 && (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Tên bài</th>
                                        <th>Loại</th>
                                        <th>Bắt đầu</th>
                                        <th>Nộp bài</th>
                                        <th>Điểm</th>
                                        <th>Kết quả</th>
                                        <th>Thời lượng</th>
                                        <th className="text-end">Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {attempts.map((attempt, index) => (
                                        <tr key={attempt.attemptId}>
                                            <td>{index + 1}</td>

                                            <td>
                                                <strong>{getAttemptName(attempt)}</strong>
                                                
                                            </td>

                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {attempt.attemptType || "-"}
                                                </span>
                                            </td>

                                            <td>{formatDateTime(attempt.startedAt)}</td>

                                            <td>{formatDateTime(attempt.submittedAt)}</td>

                                            <td>
                                                <strong>{getScoreText(attempt)}</strong>
                                                {attempt.totalQuestions ? (
                                                    <div className="small text-muted">
                                                        {attempt.totalCorrect || 0}/{attempt.totalQuestions} câu đúng
                                                    </div>
                                                ) : null}
                                            </td>

                                            <td>
                                                <span className={`badge ${getResultBadgeClass(attempt.resultStatus)}`}>
                                                    {attempt.resultStatus || "Chưa có"}
                                                </span>
                                            </td>

                                            <td>{formatDuration(attempt.durationSeconds)}</td>

                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleViewDetail(attempt.attemptId)}
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
    );
}

export default LichSuLamBai;