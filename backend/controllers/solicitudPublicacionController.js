// controllers/solicitudPublicacionController.js
const SolicitudPublicacion = require('../models/SolicitudPublicacion');
const Mascota = require('../models/Mascota');
const { enviarNotificacionesPorRol } = require('../utils/notificaciones');
const { enviarNotificacionPersonalizada } = require('../utils/notificaciones');

/* ===========================
   Helpers para parsear Body
   =========================== */
// Si llega string (JSON en form-data), intenta parsear; si falla, devuelve tal cual.
const asJSON = (v) => {
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
};

// Convierte claves tipo form-data con corchetes:
// ej. mascota[raza]=X, mascota[sexo]=Y  → { raza:'X', sexo:'Y' }
const fromBracketed = (body, prefix) => {
  const obj = {};
  const re = new RegExp(`^${prefix}\\[(.+?)\\]$`);
  for (const k of Object.keys(body || {})) {
    const m = k.match(re);
    if (m) obj[m[1]] = body[k];
  }
  return Object.keys(obj).length ? obj : null;
};

/* ==============================
   Crear nueva solicitud (POST /)
   ============================== */
exports.crearSolicitud = async (req, res) => {
  try {
    const adoptante = req.userId;

    // 1) Datos (acepta JSON string o notación con corchetes de form-data)
    const contacto =
      asJSON(req.body?.contacto) || fromBracketed(req.body, 'contacto') || {};
    const mascota =
      asJSON(req.body?.mascota) || fromBracketed(req.body, 'mascota') || {};
    const condiciones =
      asJSON(req.body?.condiciones) || fromBracketed(req.body, 'condiciones') || {};
    const confirmaciones =
      asJSON(req.body?.confirmaciones) || fromBracketed(req.body, 'confirmaciones') || {};

    // 2) Archivos subidos a Cloudinary por el middleware uploadPublicacionDocs
    //    req.cloudinaryPublicacion = { documentoIdentidad: {secure_url,...} | null, imagenes: [{secure_url,...}] }
    const doc  = req.cloudinaryPublicacion?.documentoIdentidad || null;
    const imgs = Array.isArray(req.cloudinaryPublicacion?.imagenes)
      ? req.cloudinaryPublicacion.imagenes
      : [];

    const documentoIdentidad = doc?.secure_url || null;            // URL pública
    const imagenes = imgs.map(i => i?.secure_url).filter(Boolean); // Array de URLs públicas

    // 3) Validación mínima
    if (!imagenes.length) {
      return res.status(400).json({
        success: false,
        message: 'Debes adjuntar al menos una imagen de la mascota.'
      });
    }

    // 4) Guardar solicitud
    const nuevaSolicitud = new SolicitudPublicacion({
      adoptante,
      documentoIdentidad,
      contacto,
      mascota,
      condiciones,
      confirmaciones,
      imagenes
    });

    const guardada = await nuevaSolicitud.save();

    // 5) Notificaciones
    const mensaje = 'Nueva solicitud para publicar una mascota ha sido registrada';
    const datosAdicionales = { solicitudId: guardada._id };

    await enviarNotificacionesPorRol('admin', 'nueva-solicitud-publicacion', mensaje, datosAdicionales);
    await enviarNotificacionesPorRol('adminFundacion', 'nueva-solicitud-publicacion', mensaje, datosAdicionales);

    return res.status(201).json({
      success: true,
      message: 'Solicitud creada',
      solicitud: guardada
    });

  } catch (error) {
    console.error('Error al crear solicitud de publicación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear solicitud',
      error: error.message
    });
  }
};

/* ====================================
   Obtener todas las solicitudes (GET /)
   Solo admin y adminFundacion
   ==================================== */
exports.getSolicitudes = async (_req, res) => {
  try {
    const solicitudes = await SolicitudPublicacion.find()
      .sort({ createdAt: -1 })
      .populate('adoptante', 'username email');
    return res.status(200).json({ success: true, solicitudes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al obtener solicitudes', error: error.message });
  }
};

/* =========================
   Obtener solicitud por ID
   ========================= */
exports.getSolicitudById = async (req, res) => {
  try {
    const solicitud = await SolicitudPublicacion.findById(req.params.id)
      .populate('adoptante', 'username email');

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // Solo el adoptante dueño puede ver la suya; admins y adminFundación pueden ver todas
    if (req.userRole === 'adoptante' && solicitud.adoptante?._id?.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    return res.status(200).json({ success: true, solicitud });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al consultar solicitud',
      error: error.message
    });
  }
};

/* =============================================
   Obtener todas las solicitudes del usuario log
   ============================================= */
exports.getMisSolicitudes = async (req, res) => {
  try {
    const userId = req.userId;
    const solicitudes = await SolicitudPublicacion.find({ adoptante: userId })
      .sort({ createdAt: -1 })
      .populate('adoptante', 'username email');

    return res.status(200).json({ success: true, solicitudes });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tus solicitudes',
      error: error.message
    });
  }
};

/* ===============================
   Aprobar y publicar (admin-only)
   =============================== */
exports.aprobarYPublicar = async (req, res) => {
  try {
    const solicitud = await SolicitudPublicacion.findById(req.params.id).populate('adoptante');
    if (!solicitud || solicitud.estado !== 'pendiente') {
      return res.status(400).json({ success: false, message: 'Solicitud no válida o ya procesada.' });
    }

    // Las imágenes en la solicitud YA son URLs Cloudinary
    const nuevaMascota = new Mascota({
      nombre: solicitud.mascota?.nombre,
      especie: solicitud.mascota?.especie,
      raza: solicitud.mascota?.raza,
      fechaNacimiento: solicitud.mascota?.fechaNacimiento,
      tamaño: solicitud.mascota?.tamaño,
      estadoSalud: solicitud.mascota?.estadoSalud,
      sexo: solicitud.mascota?.sexo,
      descripcion: `${solicitud.mascota?.personalidad || ''}\n\nHistoria: ${solicitud.mascota?.historia || ''}`,
      imagenes: solicitud.imagenes,  // URLs Cloudinary
      origen: 'externo',
      publicadaPor: solicitud.adoptante?._id || req.userId,
      publicada: true,
      disponible: true,
      contactoExterno: {
        nombre: solicitud.contacto?.nombre,
        telefono: solicitud.contacto?.telefono,
        correo: solicitud.contacto?.correo,
        ubicacion: `${solicitud.contacto?.ciudad || ''} - ${solicitud.contacto?.barrio || ''}`,
        observaciones: solicitud.observacionesAdmin || ''
      }
    });

    await nuevaMascota.save();

    solicitud.estado = 'aprobada';
    await solicitud.save();

    const mensaje = '¡Tu mascota ha sido publicada exitosamente en la plataforma!';
    const datosAdicionales = { mascotaId: nuevaMascota._id };

    await enviarNotificacionPersonalizada(
      [solicitud.adoptante._id],
      'solicitud-publicacion-aprobada',
      mensaje,
      datosAdicionales
    );

    return res.status(200).json({
      success: true,
      message: 'Solicitud aprobada y mascota publicada',
      mascota: nuevaMascota
    });

  } catch (error) {
    console.error('Error al aprobar y publicar:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al aprobar y publicar',
      error: error.message
    });
  }
};

/* ==========================
   Rechazar solicitud (admin)
   ========================== */
exports.rechazarSolicitud = async (req, res) => {
  try {
    const solicitud = await SolicitudPublicacion.findById(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    solicitud.estado = 'rechazada';
    solicitud.observacionesAdmin = req.body?.observaciones || '';
    await solicitud.save();

    if (solicitud.adoptante) {
      try {
        await enviarNotificacionPersonalizada(
          [solicitud.adoptante],
          'solicitud-publicacion-rechazada',
          'Tu solicitud para publicar una mascota fue rechazada. Revisa las observaciones o contáctanos.',
          { solicitudId: solicitud._id }
        );
      } catch (notiError) {
        console.error('⚠️ Error al enviar notificación de rechazo:', notiError.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Solicitud rechazada', solicitud });

  } catch (error) {
    console.error('⛔ Error completo al rechazar solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar solicitud',
      error: error.message
    });
  }
};

/* =======================================================
   Mis publicaciones (mascotas creadas desde mis solicitudes)
   ======================================================= */
exports.getMisPublicaciones = async (req, res) => {
  try {
    const userId = req.userId;
    const mascotas = await Mascota.find({
      origen: 'externo',
      publicadaPor: userId
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, mascotas });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tus publicaciones',
      error: error.message
    });
  }
};
