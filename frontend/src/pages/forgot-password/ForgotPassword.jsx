import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
    const API_BASE = "http://localhost:8080";

    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    useEffect(() => {
        if (resendCountdown <= 0) {
            return;
        }

        const timer = setTimeout(() => {
            setResendCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendCountdown]);

    const parseResponseBody = async (response) => {
        const text = await response.text();

        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Vui lòng nhập email.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                }),
            });

            const data = await parseResponseBody(response);

            if (!response.ok) {
                setError(
                    data?.message ||
                    data?.error ||
                    "Không thể gửi mã xác nhận. Vui lòng thử lại."
                );
                return;
            }

            setMessage(
                data?.message ||
                "Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
            );
            setStep(2);
            setResendCountdown(60);
        } catch (err) {
            console.error("Lỗi gửi OTP:", err);
            setError("Lỗi kết nối server. Vui lòng kiểm tra lại backend.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setMessage("");
        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Vui lòng nhập email trước khi gửi lại mã.");
            return;
        }

        if (resendCountdown > 0 || resendLoading) {
            return;
        }

        try {
            setResendLoading(true);

            const response = await fetch(`${API_BASE}/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                }),
            });

            const data = await parseResponseBody(response);

            if (!response.ok) {
                setError(
                    data?.message ||
                    data?.error ||
                    "Không thể gửi lại mã xác nhận. Vui lòng thử lại."
                );
                return;
            }

            setOtp("");
            setMessage(
                data?.message ||
                "Mã xác nhận mới đã được gửi đến email của bạn."
            );
            setResendCountdown(60);
        } catch (err) {
            console.error("Lỗi gửi lại OTP:", err);
            setError("Lỗi kết nối server. Vui lòng kiểm tra lại backend.");
        } finally {
            setResendLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const trimmedEmail = email.trim();
        const trimmedOtp = otp.trim();

        if (!trimmedEmail || !trimmedOtp || !newPassword || !confirmPassword) {
            setError("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                    otp: trimmedOtp,
                    newPassword,
                }),
            });

            const data = await parseResponseBody(response);

            if (!response.ok) {
                setError(
                    data?.message ||
                    data?.error ||
                    "Không thể đặt lại mật khẩu. Vui lòng thử lại."
                );
                return;
            }

            setMessage(
                data?.message ||
                "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
            );

            setTimeout(() => {
                navigate("/dang-nhap");
            }, 1200);
        } catch (err) {
            console.error("Lỗi đặt lại mật khẩu:", err);
            setError("Lỗi kết nối server. Vui lòng kiểm tra lại backend.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToEmailStep = () => {
        setStep(1);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage("");
        setError("");
        setResendCountdown(0);
        setResendLoading(false);
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">
                <button
                    type="button"
                    className="forgot-password-back"
                    onClick={() => navigate("/dang-nhap")}
                >
                    <i className="bi bi-arrow-left"></i>
                    Quay lại đăng nhập
                </button>

                <div className="forgot-password-header">
                    <div className="forgot-password-icon">
                        <i className="bi bi-shield-lock"></i>
                    </div>

                    <h2>Quên mật khẩu?</h2>

                    <p>
                        {step === 1
                            ? "Nhập email tài khoản của bạn để nhận mã xác nhận."
                            : "Nhập mã xác nhận và mật khẩu mới để khôi phục tài khoản."}
                    </p>
                </div>

                {message && (
                    <div className="forgot-password-alert success">
                        <i className="bi bi-check-circle"></i>
                        <span>{message}</span>
                    </div>
                )}

                {error && (
                    <div className="forgot-password-alert error">
                        <i className="bi bi-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {step === 1 && (
                    <form className="forgot-password-form" onSubmit={handleSendOtp}>
                        <div className="forgot-password-field">
                            <label>Email</label>
                            <div className="forgot-password-input-wrap">
                                <i className="bi bi-envelope"></i>
                                <input
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="forgot-password-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm"></span>
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    Gửi mã xác nhận
                                    <i className="bi bi-send"></i>
                                </>
                            )}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form
                        className="forgot-password-form"
                        onSubmit={handleResetPassword}
                    >
                        <div className="forgot-password-field">
                            <label>Email</label>
                            <div className="forgot-password-input-wrap">
                                <i className="bi bi-envelope"></i>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="forgot-password-field">
                            <label>Mã xác nhận</label>
                            <div className="forgot-password-input-wrap">
                                <i className="bi bi-key"></i>
                                <input
                                    type="text"
                                    placeholder="Nhập mã OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="forgot-password-resend">
                                <span>Không nhận được mã?</span>

                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={loading || resendLoading || resendCountdown > 0}
                                >
                                    {resendLoading
                                        ? "Đang gửi..."
                                        : resendCountdown > 0
                                            ? `Gửi lại sau ${resendCountdown}s`
                                            : "Gửi lại mã"}
                                </button>
                            </div>
                        </div>

                        <div className="forgot-password-field">
                            <label>Mật khẩu mới</label>
                            <div className="forgot-password-input-wrap">
                                <i className="bi bi-lock"></i>
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="forgot-password-field">
                            <label>Xác nhận mật khẩu</label>
                            <div className="forgot-password-input-wrap">
                                <i className="bi bi-lock-fill"></i>
                                <input
                                    type="password"
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="forgot-password-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm"></span>
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    Đặt lại mật khẩu
                                    <i className="bi bi-check2-circle"></i>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="forgot-password-secondary"
                            onClick={handleBackToEmailStep}
                            disabled={loading}
                        >
                            Đổi email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;