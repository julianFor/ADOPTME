// src/services/dashboardService.js
import api from './axiosClient'; // <- tu instancia con baseURL + token interceptors

export const getSummary = async () => {
  const { data } = await api.get('/dashboard/summary');
  return data;
};

export const getSeriesAdopcion = async (params = { months: 6 }) => {
  const { data } = await api.get('/dashboard/activity/adopcion', { params });
  return data; // { series: [{name, val}, ...] }
};

export const getSeriesPublicacion = async (params = { months: 6 }) => {
  const { data } = await api.get('/dashboard/activity/publicacion', { params });
  return data; // { series: [...] }
};

export const getSeriesDonaciones = async (params = { months: 6 }) => {
  const { data } = await api.get('/dashboard/activity/donaciones', { params });
  return data; // { currency, series: [...] }
};

export const getProcesosEnCurso = async (params = { limit: 10 }) => {
  const { data } = await api.get('/dashboard/processes/in-progress', { params });
  return data; // { totalEtapas: 4, rows: [...] }
};
