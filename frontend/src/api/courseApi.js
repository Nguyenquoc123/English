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

export const getRefundReasons = () => axiosClient.get("/refund-reasons");

export const getRefundEligibility = (courseId) =>
  axiosClient.get(`/khoa-hoc/${courseId}/refund-eligibility`);

export const requestCourseRefund = (courseId, payload) =>
  axiosClient.post(`/khoa-hoc/${courseId}/yeu-cau-hoan-tien`, payload);