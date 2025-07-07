import axiosClient from './axiosClient';

const BASE_URL = '/notificaciones';

export const crearNotificacion = (data) => {
  return axiosClient.post(`${BASE_URL}`, data);
};

export const getMisNotificaciones = () => {
  return axiosClient.get(`${BASE_URL}/mias`);
};

export const marcarComoLeida = (id) => {
  return axiosClient.patch(`${BASE_URL}/${id}/leida`);
};

export const contarNoLeidas = () => {
  return axiosClient.get(`${BASE_URL}/pendientes/contador`);
};
