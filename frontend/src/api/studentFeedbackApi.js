import axiosClient from "./axiosClient";

export const createStudentFeedbackTask = (title, content) =>
  axiosClient.post("/student-feedbacks", { title, content });

export const getAdminStudentFeedbackTasks = (status = "") =>
  axiosClient.get("/admin/student-feedbacks", { params: { status } });

export const reviewAdminStudentFeedbackTask = (feedbackTaskId, status, adminNote) =>
  axiosClient.put(`/admin/student-feedbacks/${feedbackTaskId}/review`, {
    status,
    adminNote,
  });
