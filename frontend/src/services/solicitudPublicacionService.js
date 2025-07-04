import axiosClient from './axiosClient';

/**
 * Enviar solicitud de publicación de mascota (solo adoptantes)
 * @param {FormData} data - Información del formulario incluyendo imágenes y documento
 * @returns {Promise} respuesta del servidor
 */
export const crearSolicitud = async (data) => {
  const response = await axiosClient.post('/publicaciones', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Obtener todas las solicitudes de publicación (solo admin)
 */
export const getSolicitudes = async () => {
  const response = await axiosClient.get('/publicaciones');
  console.log("Respuesta del backend:", response.data); // <--- Añade esto
  return response.data;
};


/**
 * Obtener detalles de una solicitud de publicación por ID
 */
export const obtenerSolicitudPublicacionPorId = async (id) => {
  const response = await axiosClient.get(`/publicaciones/${id}`);
  return response.data;
};

/**
 * Aprobar solicitud (solo admin)
 */
export const aprobarSolicitudPublicacion = async (id) => {
  const response = await axiosClient.patch(`/publicaciones/${id}/aprobar`);
  return response.data;
};

/**
 * Rechazar solicitud (solo admin)
 */
export const rechazarSolicitudPublicacion = async (id) => {
  const response = await axiosClient.patch(`/publicaciones/${id}/rechazar`);
  return response.data;
};

/**
 * Obtener las solicitudes de publicación del usuario autenticado (adoptante)
 */
export const getMisSolicitudes = async () => {
  const response = await axiosClient.get('/publicaciones/mias');
  return response.data.solicitudes;
};