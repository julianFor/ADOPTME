import axiosClient from "./axiosClient";


export const getTodasLasMascotas = () => axiosClient.get('/mascotas');
export const getAllMascotas = async () => {
  const response = await axiosClient.get('/mascotas');
  return response.data;
};

// Fundacion
export const getMascotasFundacion = () =>
  axiosClient.get("/mascotas/origen/fundacion");

export const getMascotasExternas = () =>
  axiosClient.get("/mascotas/origen/externo");

export const getMascotaById = async (id) => {
  const response = await axiosClient.get(`/mascotas/${id}`);
  return response.data; 
};


export const createMascota = (data) =>
  axiosClient.post("/mascotas", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateMascota = (id, data) =>
  axiosClient.put(`/mascotas/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteMascota = (id) =>
  axiosClient.delete(`/mascotas/${id}`);

export const getMascotasPorOrigen = (origen) =>
  axiosClient.get(`/mascotas/origen/${origen}`);
