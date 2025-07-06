const SolicitudPublicacion = require('../models/SolicitudPublicacion');
const Mascota = require('../models/Mascota');
const { enviarNotificacionesPorRol } = require('../utils/notificaciones');
const { enviarNotificacionPersonalizada } = require('../utils/notificaciones');
// Crear nueva solicitud (la llena el adoptante)
exports.crearSolicitud = async (req, res) => {
  try {
    const {
      contacto,
      mascota,
      condiciones,
      confirmaciones
    } = req.body;

    const adoptante = req.userId;

    const documentoIdentidad = req.files?.documento?.[0]?.filename || null;
    const imagenes = req.files?.imagenes?.map(file => file.filename) || [];

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

    //  Enviar notificación a admin y adminFundacion
    const mensaje = 'Nueva solicitud para publicar una mascota ha sido registrada';
    const datosAdicionales = {
      solicitudId: guardada._id
    };

    await enviarNotificacionesPorRol('admin', 'nueva-solicitud-publicacion', mensaje, datosAdicionales);
    await enviarNotificacionesPorRol('adminFundacion', 'nueva-solicitud-publicacion', mensaje, datosAdicionales);

    res.status(201).json({
      success: true,
      message: 'Solicitud creada',
      solicitud: guardada
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear solicitud',
      error: error.message
    });
  }
};

// Obtener todas las solicitudes (solo para admin)
exports.getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await SolicitudPublicacion.find().populate('adoptante', 'username email');
    res.status(200).json({ success: true, solicitudes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener solicitudes', error: error.message });
  }
};

// Obtener una solicitud por ID
exports.getSolicitudById = async (req, res) => {
  try {
    const solicitud = await SolicitudPublicacion.findById(req.params.id)
      .populate('adoptante', 'username email');

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // Validación: solo el adoptante puede ver su propia solicitud
    if (req.userRole === 'adoptante' && solicitud.adoptante._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    res.status(200).json({ success: true, solicitud });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al consultar solicitud',
      error: error.message
    });
  }
};


exports.getMisSolicitudes = async (req, res) => {
  try {
    const userId = req.userId;

    const solicitudes = await SolicitudPublicacion.find({ adoptante: userId })
      .sort({ createdAt: -1 })
      .populate('adoptante', 'username email');

    res.status(200).json({
      success: true,
      solicitudes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus solicitudes',
      error: error.message
    });
  }
};



// Aprobar y publicar (solo admin)
exports.aprobarYPublicar = async (req, res) => {
  try {
    const solicitud = await SolicitudPublicacion.findById(req.params.id).populate('adoptante');
    if (!solicitud || solicitud.estado !== 'pendiente') {
      return res.status(400).json({ success: false, message: 'Solicitud no válida o ya procesada.' });
    }

    // Crear mascota en colección Mascota
    const nuevaMascota = new Mascota({
      nombre: solicitud.mascota.nombre,
      especie: solicitud.mascota.especie,
      raza: solicitud.mascota.raza,
      fechaNacimiento: solicitud.mascota.fechaNacimiento,
      tamaño: solicitud.mascota.tamaño,
      estadoSalud: solicitud.mascota.estadoSalud,
      sexo: solicitud.mascota.sexo,
      descripcion: solicitud.mascota.personalidad + '\n\nHistoria: ' + solicitud.mascota.historia,
      imagenes: solicitud.imagenes,
      origen: 'externo',
      publicadaPor: solicitud.adoptante?._id || req.userId,
      publicada: true,
      disponible: true,
      contactoExterno: {
        nombre: solicitud.contacto.nombre,
        telefono: solicitud.contacto.telefono,
        correo: solicitud.contacto.correo,
        ubicacion: `${solicitud.contacto.ciudad} - ${solicitud.contacto.barrio}`,
        observaciones: solicitud.observacionesAdmin || ''
      }
    });

    await nuevaMascota.save();

    // Actualizar estado de solicitud
    solicitud.estado = 'aprobada';
    await solicitud.save();

    //  Notificar al adoptante
    const mensaje = '¡Tu mascota ha sido publicada exitosamente en la plataforma!';
    const datosAdicionales = {
      mascotaId: nuevaMascota._id
    };

    await enviarNotificacionPersonalizada(
      [solicitud.adoptante._id],
      'solicitud-publicacion-aprobada',
      mensaje,
      datosAdicionales
    );

    res.status(200).json({
      success: true,
      message: 'Solicitud aprobada y mascota publicada',
      mascota: nuevaMascota
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al aprobar y publicar',
      error: error.message
    });
  }
};

exports.rechazarSolicitud = async (req, res) => {
  try {
    const solicitud = await SolicitudPublicacion.findById(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    solicitud.estado = 'rechazada';
    solicitud.observacionesAdmin = req.body.observaciones || '';
    await solicitud.save();

    // ✅ Manejo seguro de notificación
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

    res.status(200).json({
      success: true,
      message: 'Solicitud rechazada',
      solicitud
    });

  } catch (error) {
    console.error('⛔ Error completo al rechazar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar solicitud',
      error: error.message
    });
  }
};


// Obtener las mascotas publicadas por el usuario autenticado (a partir de solicitudes de publicación)
exports.getMisPublicaciones = async (req, res) => {
  try {
    const userId = req.userId;

    const mascotas = await Mascota.find({
      origen: 'externo',
      publicadaPor: userId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      mascotas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus publicaciones',
      error: error.message
    });
  }
};
