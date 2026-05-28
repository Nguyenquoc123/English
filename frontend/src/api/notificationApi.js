import axiosClient from "./axiosClient";

export const getMyNotifications = () => axiosClient.get("/notifications/my");

export const getUnreadNotificationCount = () =>
  axiosClient.get("/notifications/unread-count");

export const markNotificationRead = (notificationReceiverId) =>
  axiosClient.put(`/notifications/${notificationReceiverId}/read`);

export const markAllNotificationsRead = () =>
  axiosClient.put("/notifications/read-all");
