
import axiosClient from "./axiosClient";

export const getDashboard = () => axiosClient.get("/admin/dashboard");

export const getAllUsers = (keyword = "", roleName = "", status = "") =>
  axiosClient.get("/admin/users", { params: { keyword, roleName, status } });

export const getUserDetail = (userId) => axiosClient.get(`/admin/users/${userId}`);

export const createUser = (data) => axiosClient.post("/admin/users", data);

export const updateUserRole = (userId, roleName) =>
  axiosClient.put(`/admin/users/${userId}/role`, { roleName });

export const updateUserStatus = (userId, status) =>
  axiosClient.put(`/admin/users/${userId}/status`, { status });

export const getPendingTeachers = () => axiosClient.get("/admin/teachers/pending");

export const getAllTeacherProfiles = () => axiosClient.get("/admin/teachers");

export const getPendingCourses = () => axiosClient.get("/admin/courses/pending");

export const getAllAdminCourses = () => axiosClient.get("/admin/courses");

export const approveTeacher = (teacherProfileId, approvalStatus, rejectReason) =>
  axiosClient.put(`/teacher-profile/${teacherProfileId}/approve`, {
    approvalStatus,
    rejectReason,
  });

export const approveCourse = (courseId) =>
  axiosClient.put(`/khoa-hoc/${courseId}/duyet`);

export const rejectCourse = (courseId, rejectReason) =>
  axiosClient.put(`/khoa-hoc/${courseId}/tu-choi`, { rejectReason });

export const getPendingWithdrawals = () => axiosClient.get("/admin/withdrawals/pending");

export const getAllWithdrawals = () => axiosClient.get("/admin/withdrawals");

export const reviewWithdrawal = (withdrawalId, status, rejectReason) =>
  axiosClient.put(`/admin/withdrawals/${withdrawalId}/review`, { status, rejectReason });

export const getFreeLessons = () => axiosClient.get("/admin/lessons/free");

export const createFreeLesson = (title, description, status) =>
  axiosClient.post("/admin/lessons/free", { title, description, status });

export const updateFreeLesson = (lessonId, title, description, status) =>
  axiosClient.put(`/admin/lessons/free/${lessonId}`, { title, description, status });

export const deleteFreeLesson = (lessonId) =>
  axiosClient.delete(`/admin/lessons/free/${lessonId}`);

export const getAllExams = () => axiosClient.get("/admin/exams");

export const updateExamStatus = (examId, status) =>
  axiosClient.put(`/admin/exams/${examId}/status`, { status });

export const getAllNotifications = () => axiosClient.get("/admin/notifications");

export const createNotification = (title, message, targetType, targetValue) =>
  axiosClient.post("/admin/notifications", { title, message, targetType, targetValue });

export const getAllTransactions = () => axiosClient.get("/admin/transactions");

export const getAllReviews = () => axiosClient.get("/admin/reviews");

export const deleteReview = (reviewId) =>
  axiosClient.delete(`/admin/reviews/${reviewId}`);

export const getCourseList = (keyword, status) =>
  axiosClient.get("/khoa-hoc/danh-sach-khoa-hoc", { params: { keyword, status } });

export const getCourseDetailForAdmin = (courseId) =>
  axiosClient.get(`/khoa-hoc/chi-tiet-khoa-hoc-teacher/${courseId}`);

export const getLessonsForAdmin = (courseId) =>
  axiosClient.get(`/lesson/${courseId}/teacher`);

export const getLessonDetailForAdmin = (courseId, lessonId) =>
  axiosClient.get(`/lesson/${courseId}/admin/lessons/${lessonId}`);

export const getVideosByLesson = (lessonId) =>
  axiosClient.get(`/video/${lessonId}/lessons`);

export const getVideoDetailForAdmin = (videoId) =>
  axiosClient.get(`/video/${videoId}/admin`);

export const getGrammarsByLesson = (lessonId) =>
  axiosClient.get(`/grammar/${lessonId}/grammars`);

export const getGrammarDetailForAdmin = (grammarId) =>
  axiosClient.get(`/grammar/${grammarId}/admin`);

export const changeAdminPassword = (oldPassword, newPassword, confirmPassword) =>
  axiosClient.put("/admin/change-password", { oldPassword, newPassword, confirmPassword });

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
