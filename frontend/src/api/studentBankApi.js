import axiosClient from "./axiosClient";

const BASE = "/hosocanhan/bank-accounts";

export const getMyStudentBankAccounts = () => axiosClient.get(BASE);

export const createStudentBankAccount = (payload) =>
  axiosClient.post(BASE, payload);

export const updateStudentBankAccount = (accountId, payload) =>
  axiosClient.put(`${BASE}/${accountId}`, payload);

export const setDefaultStudentBankAccount = (accountId) =>
  axiosClient.patch(`${BASE}/${accountId}/default`);

export const deleteStudentBankAccount = (accountId) =>
  axiosClient.delete(`${BASE}/${accountId}`);
