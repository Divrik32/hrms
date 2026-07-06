import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
  if (error.response?.status === 401) {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/admin")) {
      window.location.href = "/admin-login";
    } else if (currentPath.startsWith("/employee")) {
      window.location.href = "/employee-login";
    } else {
      window.location.href = "/";
    }
  }
    return Promise.reject(error);
  }
);

export default api;