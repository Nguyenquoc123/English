import React, { useEffect, useMemo, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import { useNavigate } from "react-router-dom";

import "./TeacherProfileUpdatePage.css"

const TeacherProfileUpdatePage = () => {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        bio: "",
        experience: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const editorConfig = useMemo(
        () => ({
            readonly: false,
            height: 320,
            placeholder: "Mô tả kinh nghiệm giảng dạy, bằng cấp, thành tích...",
            toolbarAdaptive: false,
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
                "align",
                "|",
                "link",
                "table",
                "|",
                "undo",
                "redo"
            ],
        }),
        []
    );

    const loadTeacherProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:8080/teacher-profile/profile-register",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Không thể tải hồ sơ");
            }

            const data = await response.json();

            setFormData({
                email: data.email || "",
                phone: data.phone || "",
                bio: data.bio || "",
                experience: data.experience || "",
            });
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeacherProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.email.trim()) {
            return "Vui lòng nhập email";
        }

        if (!formData.phone.trim()) {
            return "Vui lòng nhập số điện thoại";
        }

        if (!formData.bio.trim()) {
            return "Vui lòng nhập giới thiệu";
        }

        if (!formData.experience.trim() || formData.experience === "<p><br></p>") {
            return "Vui lòng nhập kinh nghiệm";
        }

        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validateMessage = validateForm();

        if (validateMessage) {
            setError(validateMessage);
            setSuccess("");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:8080/teacher-profile/update",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                    body: JSON.stringify({
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        bio: formData.bio.trim(),
                        experience: formData.experience,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Cập nhật hồ sơ thất bại");
            }

            alert("Cập nhật thông tin thành công");
            navigate("/teacher/profile");
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi khi cập nhật");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="teacher-update-page py-3 py-md-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10 col-xl-8">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-header bg-white px-3 px-md-4 py-3 border-bottom">
                                <h4 className="mb-0 fw-bold">
                                    Cập nhật hồ sơ
                                </h4>
                            </div>

                            <div className="card-body p-3 p-md-4">
                                {error && (
                                    <div className="alert alert-danger py-2 mb-3">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="alert alert-success py-2 mb-3">
                                        {success}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="email" className="form-label fw-semibold">
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                className="form-control"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Nhập email"
                                                required
                                            />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="phone" className="form-label fw-semibold">
                                                Số điện thoại <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                className="form-control"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Nhập số điện thoại"
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="bio" className="form-label fw-semibold">
                                                Giới thiệu <span className="text-danger">*</span>
                                            </label>
                                            <textarea 
                                                id="bio"
                                                name="bio"
                                                className="form-control"
                                                rows="4"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                placeholder="Nhập giới thiệu ngắn về bản thân"
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                Kinh nghiệm <span className="text-danger">*</span>
                                            </label>

                                            <div className="jodit-bootstrap-wrapper">
                                                <JoditEditor
                                                    ref={editorRef}
                                                    value={formData.experience}
                                                    config={editorConfig}
                                                    onBlur={(newContent) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            experience: newContent,
                                                        }))
                                                    }
                                                    onChange={() => {}}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 border-top mt-4 pt-3">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary order-2 order-sm-1"
                                            onClick={() => navigate(-1)}
                                            disabled={saving}
                                        >
                                            Hủy
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary order-1 order-sm-2"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Đang lưu
                                                </>
                                            ) : (
                                                "Lưu thay đổi"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfileUpdatePage;