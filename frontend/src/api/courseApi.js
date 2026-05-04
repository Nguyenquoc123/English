import axiosClient from "./axiosClient";

export const getAllCourses = (params) =>
  axiosClient.get("/khoa-hoc/danh-sach", { params });
export const searchCourses = (keyword, levelId) =>
  axiosClient.get("/khoa-hoc/tim-kiem", { params: { keyword, levelId } });
export const getCourseById = (id) => axiosClient.get(`/khoa-hoc/${id}`);
