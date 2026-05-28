import axiosClient from "./axiosClient";

export const getTeacherProfile = () =>
  axiosClient.get("/teacher-profile/profile-register");

export const getTeacherApplicationSummary = () =>
  axiosClient.get("/teacher-profile/profile-registered");

/** @deprecated use getTeacherApplicationSummary */
export const hasTeacherProfile = getTeacherApplicationSummary;

export const registerAsTeacher = (formData) =>
  axiosClient.post("/teacher-profile/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
