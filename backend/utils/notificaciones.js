const Notificacion = require('../models/Notificacion');
const User = require('../models/User');

// Lista de tipos permitidos (importante mantener en sincronía)
const tiposPermitidos = [
  'solicitud-adopcion-creada',
  'solicitud-adopcion-aprobada',
  'solicitud-adopcion-rechazada',
  'proceso-entrega-confirmada',
  'nueva-solicitud-publicacion',
  'solicitud-publicacion-aprobada',
  'solicitud-publicacion-rechazada'
];

/**
 * Envía notificación a usuarios por ID
 * @param {Array<string>} userIds - IDs de los destinatarios
 * @param {string} tipo - Tipo de notificación
 * @param {string} mensaje - Mensaje visible
 * @param {Object} datosAdicionales - Objeto con info útil (opcional)
 */
const enviarNotificacionPersonalizada = async (userIds, tipo, mensaje, datosAdicionales = {}) => {
  if (!tiposPermitidos.includes(tipo)) {
    throw new Error(`Tipo de notificación inválido: ${tipo}`);
  }

  const notificaciones = userIds.map(userId => ({
    user: userId,
    tipo,
    mensaje,
    datosAdicionales
  }));

  await Notificacion.insertMany(notificaciones);
};


/**
 * Envía notificación a todos los usuarios de un rol
 * @param {string} rol - Rol objetivo (ej: 'admin', 'adminFundacion')
 * @param {string} tipo - Tipo de notificación
 * @param {string} mensaje - Mensaje visible
 * @param {Object} datosAdicionales - Objeto con info útil (opcional)
 */
const enviarNotificacionesPorRol = async (rol, tipo, mensaje, datosAdicionales = {}) => {
  const usuarios = await User.find({ role: rol }).select('_id');
  const ids = usuarios.map(u => u._id.toString());

  if (ids.length > 0) {
    await enviarNotificacionPersonalizada(ids, tipo, mensaje, datosAdicionales);
  }
};

module.exports = {
  enviarNotificacionPersonalizada,
  enviarNotificacionesPorRol
};
