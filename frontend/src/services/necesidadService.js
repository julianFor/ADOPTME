// src/services/necesidadService.js
import axiosClient from "./axiosClient";

export const listarNecesidades = async (params = {}) => {
  const res = await axiosClient.get("/necesidades", { params });
  return res.data;
};

export const getNecesidadById = async (id) => {
  const res = await axiosClient.get(`/necesidades/${id}`);
  return res.data;
};

// ⚠️ IGUAL QUE MASCOTAS: forzamos multipart/form-data
export const crearNecesidad = (data) =>
  axiosClient.post("/necesidades", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Tu backend usa PATCH; si prefieres PUT, cambia también en rutas
export const actualizarNecesidad = (id, data) =>
  axiosClient.patch(`/necesidades/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const cambiarEstadoNecesidad = async (id, estado) => {
  const res = await axiosClient.patch(
    `/necesidades/${id}/estado`,
    { estado },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};

export const eliminarNecesidad = async (id) => {
  const res = await axiosClient.delete(`/necesidades/${id}`);
  return res.data;
};
