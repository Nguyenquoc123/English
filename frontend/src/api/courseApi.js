import axiosClient from "./axiosClient";

export const getAllCourses = (params) =>
  axiosClient.get("/khoa-hoc/danh-sach-khoa-hoc-public", { params });

export const searchCourses = (keyword, levelId) =>
  axiosClient.get("/khoa-hoc/tim-kiem", { params: { keyword, levelId } });

export const getCourseById = (id) => axiosClient.get(`/khoa-hoc/${id}`);

export const getPurchasedCourses = () =>
  axiosClient.get("/khoa-hoc/danh-sach-khoa-hoc-da-mua");

export const getMyRefundStatus = () =>
  axiosClient.get("/khoa-hoc/refund-status");

export const requestCourseRefund = (courseId, reason) =>
  axiosClient.post(`/khoa-hoc/${courseId}/yeu-cau-hoan-tien`, { reason });