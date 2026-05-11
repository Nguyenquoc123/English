import axiosClient from "./axiosClient";

export const getAllCourses = (params) =>
  axiosClient.get("http://localhost:8080/khoa-hoc/danh-sach-khoa-hoc-public", { params });
export const searchCourses = (keyword, levelId) =>
  axiosClient.get("/khoa-hoc/tim-kiem", { params: { keyword, levelId } });
export const getCourseById = (id) => axiosClient.get(`/khoa-hoc/${id}`);
