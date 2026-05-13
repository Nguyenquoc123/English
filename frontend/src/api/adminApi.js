
import axiosClient from "./axiosClient";

// DASHBOARD
export const getDashboard = () => axiosClient.get("/admin/dashboard");

// USER MANAGEMENT
export const getAllUsers = (keyword = "", roleName = "", status = "") =>
  axiosClient.get("/admin/users", { params: { keyword, roleName, status } });

export const getUserDetail = (userId) => axiosClient.get(`/admin/users/${userId}`);

export const createUser = (data) => axiosClient.post("/admin/users", data);

export const updateUserRole = (userId, roleName) =>
  axiosClient.put(`/admin/users/${userId}/role`, { roleName });

export const updateUserStatus = (userId, status) =>
  axiosClient.put(`/admin/users/${userId}/status`, { status });

// TEACHER MANAGEMENT
export const getPendingTeachers = () => axiosClient.get("/admin/teachers/pending");

export const getAllTeacherProfiles = () => axiosClient.get("/admin/teachers");

// COURSE MANAGEMENT
export const getPendingCourses = () => axiosClient.get("/admin/courses/pending");

export const getAllAdminCourses = () => axiosClient.get("/admin/courses");

// TEACHER APPROVAL
export const approveTeacher = (teacherProfileId, approvalStatus, rejectReason) =>
  axiosClient.put(`/teacher-profile/${teacherProfileId}/approve`, {
    approvalStatus,
    rejectReason,
  });

// COURSE APPROVAL
export const approveCourse = (courseId) =>
  axiosClient.put(`/khoa-hoc/${courseId}/duyet`);

export const rejectCourse = (courseId, rejectReason) =>
  axiosClient.put(`/khoa-hoc/${courseId}/tu-choi`, { rejectReason });

// WITHDRAWAL MANAGEMENT
export const getPendingWithdrawals = () => axiosClient.get("/admin/withdrawals/pending");

export const getAllWithdrawals = () => axiosClient.get("/admin/withdrawals");

export const reviewWithdrawal = (withdrawalId, status, rejectReason) =>
  axiosClient.put(`/admin/withdrawals/${withdrawalId}/review`, { status, rejectReason });

// LESSON FREE MANAGEMENT
export const getFreeLessons = () => axiosClient.get("/admin/lessons/free");

export const createFreeLesson = (title, description, status) =>
  axiosClient.post("/admin/lessons/free", { title, description, status });

export const updateFreeLesson = (lessonId, title, description, status) =>
  axiosClient.put(`/admin/lessons/free/${lessonId}`, { title, description, status });

export const deleteFreeLesson = (lessonId) =>
  axiosClient.delete(`/admin/lessons/free/${lessonId}`);

// EXAM MANAGEMENT
export const getAllExams = () => axiosClient.get("/admin/exams");

export const updateExamStatus = (examId, status) =>
  axiosClient.put(`/admin/exams/${examId}/status`, { status });

// NOTIFICATION MANAGEMENT
export const getAllNotifications = () => axiosClient.get("/admin/notifications");

// targetType: "ALL" | "ROLE" | "USER"; targetValue: null | roleName | userId
export const createNotification = (title, message, targetType, targetValue) =>
  axiosClient.post("/admin/notifications", { title, message, targetType, targetValue });

// TRANSACTION MANAGEMENT
export const getAllTransactions = () => axiosClient.get("/admin/transactions");

// REVIEW MANAGEMENT
export const getAllReviews = () => axiosClient.get("/admin/reviews");

export const deleteReview = (reviewId) =>
  axiosClient.delete(`/admin/reviews/${reviewId}`);

// COURSE LIST & REVIEW
// Lấy danh sách khóa học với bộ lọc keyword và status
export const getCourseList = (keyword, status) =>
  axiosClient.get("/khoa-hoc/danh-sach-khoa-hoc", { params: { keyword, status } });

// Lấy chi tiết khóa học để admin review
export const getCourseDetailForAdmin = (courseId) =>
  axiosClient.get(`/khoa-hoc/chi-tiet-khoa-hoc-teacher/${courseId}`);

// Lấy danh sách bài học của khóa học (dùng cho admin)
export const getLessonsForAdmin = (courseId) =>
  axiosClient.get(`/lesson/${courseId}/teacher`);

// Lấy chi tiết bài học cho admin review
export const getLessonDetailForAdmin = (courseId, lessonId) =>
  axiosClient.get(`/lesson/${courseId}/admin/lessons/${lessonId}`);

// Lấy danh sách video của bài học
export const getVideosByLesson = (lessonId) =>
  axiosClient.get(`/video/${lessonId}/lessons`);

// Lấy chi tiết video cho admin
export const getVideoDetailForAdmin = (videoId) =>
  axiosClient.get(`/video/${videoId}/admin`);

// Lấy danh sách ngữ pháp của bài học
export const getGrammarsByLesson = (lessonId) =>
  axiosClient.get(`/grammar/${lessonId}/grammars`);

// Lấy chi tiết ngữ pháp cho admin
export const getGrammarDetailForAdmin = (grammarId) =>
  axiosClient.get(`/grammar/${grammarId}/admin`);

// CHANGE PASSWORD
export const changeAdminPassword = (oldPassword, newPassword, confirmPassword) =>
  axiosClient.put("/admin/change-password", { oldPassword, newPassword, confirmPassword });

// ADMIN PROFILE
export const getAdminProfile = () => axiosClient.get("/hosocanhan");

export const updateAdminProfile = (fullName, email, avatarFile) => {
  const formData = new FormData();
  formData.append("fullName", fullName);
  formData.append("email", email);
  if (avatarFile) formData.append("avatarFile", avatarFile);
  return axiosClient.put("/hosocanhan", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
