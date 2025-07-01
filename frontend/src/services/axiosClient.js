// src/services/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token automáticamente
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // asegúrate que lo guardas ahí al hacer login
  if (token) {
    config.headers["x-access-token"] = token;
  }
  return config;
});

export default axiosClient;
