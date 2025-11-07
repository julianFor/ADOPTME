// src/services/dashboardService.js
import api from './axiosClient'; // <- tu instancia con baseURL + token interceptors

/* ---------- ADMIN / ADMIN-FUNDACION ---------- */

export const getSummary = async () => {
  const { data } = await api.get('/dashboard/summary');
  return data;
};

export const getSeriesAdopcion = async ({ months = 6 } = {}) => {
  const { data } = await api.get('/dashboard/activity/adopcion', { params: { months } });
  return data; // { series: [{name, val}, ...] }
};

export const getSeriesPublicacion = async ({ months = 6 } = {}) => {
  const { data } = await api.get('/dashboard/activity/publicacion', { params: { months } });
  return data; // { series: [...] }
};

export const getSeriesDonaciones = async ({ months = 6 } = {}) => {
  const { data } = await api.get('/dashboard/activity/donaciones', { params: { months } });
  return data; // { currency, series: [...] }
};

export const getProcesosEnCurso = async ({ limit = 10 } = {}) => {
  const { data } = await api.get('/dashboard/processes/in-progress', { params: { limit } });
  return data; // { totalEtapas: 4, rows: [...] }
};

/* ---------- ADOPTANTE ---------- */

export const getAdoptanteSummary = async () => {
  const { data } = await api.get('/dashboard/adoptante/summary');
  return data; // { solicitudesAdopcion:{total}, solicitudesPublicacion:{total}, publicacionesAdoptMe:{total} }
};

export const getMisProcesosEnCurso = async ({ limit = 10 } = {}) => {
  const { data } = await api.get('/dashboard/adoptante/processes/in-progress', { params: { limit } });
  return data; // { totalEtapas: 4, rows: [...] }
};

export const getMisSolicitudesPublicacion = async ({ limit = 10 } = {}) => {
  const { data } = await api.get('/dashboard/adoptante/solicitudes-publicacion', { params: { limit } });
  return data; // { rows: [...] }
};
