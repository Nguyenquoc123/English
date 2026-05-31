import axiosClient from "./axiosClient";

export const getCertificateStatus = (courseId) =>
  axiosClient.get(`/khoa-hoc/${courseId}/certificate/status`);

export const getMyCertificate = (courseId) =>
  axiosClient.get(`/khoa-hoc/${courseId}/certificate`);

export const issueCertificate = (courseId, studentNameOnCertificate) =>
  axiosClient.post(`/khoa-hoc/${courseId}/certificate`, {
    studentNameOnCertificate,
  });
