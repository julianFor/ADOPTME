// src/services/axiosClient.js
import axios from "axios";

// ✅ Base URL tomada del archivo .env (VITE_API_URL=http://<IP>:3000/api)
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor para incluir el token en cada solicitud si existe
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor de respuesta (opcional: manejo de errores globales)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Error en la respuesta Axios:", error?.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
