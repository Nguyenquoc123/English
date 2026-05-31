import axiosClient from "./axiosClient";

export const getTeacherDashboard = () => axiosClient.get("/teacher/dashboard");

export const getWithdrawalSummary = () => axiosClient.get("/teacher/withdrawals/summary");

export const getMyWithdrawals = () => axiosClient.get("/teacher/withdrawals");

export const createWithdrawal = (amount, bankAccountId) =>
  axiosClient.post("/teacher/withdrawals", { amount, bankAccountId });
