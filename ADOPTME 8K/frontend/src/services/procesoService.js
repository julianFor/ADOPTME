// src/services/procesoService.js

import axiosClient from './axiosClient';

// Crear proceso
export const crearProceso = async (solicitudId) => {
  const { data } = await axiosClient.post('/proceso', { solicitudId });
  return data;
};

// Obtener todos los procesos (admin/adminFundacion)
export const getAllProcesos = async () => {
  const { data } = await axiosClient.get('/proceso');
  return data;
};

// Obtener procesos de adopción del usuario autenticado (adoptante)
export const getMisProcesos = async () => {
  const { data } = await axiosClient.get('/proceso/mis-procesos');
  return data;
};


// Obtener proceso por solicitud (todos los roles)
export const getProcesoPorSolicitud = async (solicitudId) => {
  const { data } = await axiosClient.get(`/proceso/solicitud/${solicitudId}`);
  return data;
};

// Agendar entrevista virtual
export const agendarEntrevista = async (idProceso, datosEntrevista) => {
  const { data } = await axiosClient.patch(`/proceso/${idProceso}/entrevista`, datosEntrevista);
  return data;
};

// Registrar visita presencial
export const registrarVisita = async (idProceso, datosVisita) => {
  const { data } = await axiosClient.patch(`/proceso/${idProceso}/visita`, datosVisita);
  return data;
};

// Subir compromiso (PDF firmado)
export const subirCompromiso = async (idProceso, formData) => {
  const { data } = await axiosClient.post(`/proceso/${idProceso}/compromiso`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};


// Registrar entrega
export const registrarEntrega = async (idProceso, datosEntrega) => {
  const { data } = await axiosClient.patch(`/proceso/${idProceso}/entrega`, datosEntrega);
  return data;
};

// Aprobar etapa (entrevista, visita, compromiso, entrega)
export const aprobarEtapa = async (idProceso, etapa) => {
  const { data } = await axiosClient.patch(`/proceso/${idProceso}/aprobar/${etapa}`);
  return data;
};

// Rechazar etapa con motivo
export const rechazarEtapa = async (idProceso, etapa, motivo) => {
  const { data } = await axiosClient.patch(`/proceso/${idProceso}/rechazar/${etapa}`, {
    motivo
  });
  return data;
};
//Consultar Proceso Por Id
export const getProcesoPorId = async (procesoId) => {
  const response = await axiosClient.get(`/proceso/${procesoId}`);
  return response.data;
};
