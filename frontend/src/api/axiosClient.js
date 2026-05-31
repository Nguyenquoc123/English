import axios from "axios";
const axiosClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    Accept: "application/json;charset=UTF-8",
  },
});
axiosClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("english_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("english_token");
      window.location.href = "/dang-nhap";
    }
    return Promise.reject(error);
  },
);
export default axiosClient;
