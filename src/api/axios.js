import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const isAdminRoute =
    window.location.pathname.startsWith("/admin");

  const token = isAdminRoute
    ? localStorage.getItem("adminToken")
    : localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;