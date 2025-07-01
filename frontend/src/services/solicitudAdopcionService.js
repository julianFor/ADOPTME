// src/services/solicitudAdopcionService.js
import axiosClient from "./axiosClient";

// ✅ Obtener resumen de solicitudes agrupadas por mascota (para tabla)
export const getMascotasConSolicitudes = () => {
  return axiosClient.get("/solicitudesAdopcion/resumen-por-mascota");
};

// ✅ Obtener todas las solicitudes para una mascota específica
export const obtenerSolicitudesPorMascota = (mascotaId) => {
  return axiosClient.get(`/solicitudesAdopcion/porMascota/${mascotaId}`);
};

export const crearSolicitud = async (formData) => {
  const response = await axiosClient.post("/solicitudesAdopcion", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const getSolicitudById = async (id) => {
  const { data } = await axiosClient.get(`/solicitudesAdopcion/${id}`);
  return data;
};

export const rechazarSolicitud = async (id) => {
  const { data } = await axiosClient.put(`/solicitudesAdopcion/${id}/rechazar`);
  return data;
};

