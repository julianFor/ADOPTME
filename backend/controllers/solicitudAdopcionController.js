const SolicitudAdopcion = require('../models/SolicitudAdopcion');
const { enviarNotificacionesPorRol } = require('../utils/notificaciones'); //  Importar utilidades
const { enviarNotificacionPersonalizada } = require('../utils/notificaciones');
const mongoose = require('mongoose'); // ✅ para validar/castear ObjectId

// Crear nueva solicitud de adopción
exports.crearSolicitud = async (req, res) => {
  try {
    const {
      mascota,
      nombreCompleto,
      cedula,
      fechaNacimiento,
      direccion,
      barrio,
      ciudad,
      telefono,
      correo,
      tipoVivienda,
      tenenciaVivienda,
      acuerdoFamiliar,
      hayNinos,
      otrasMascotas,
      alergias,
      motivoAdopcion,
      lugarMascota,
      reaccionProblemas,
      tiempoSola,
      responsable,
      queHariasMudanza,
      aceptaVisitaVirtual,
      compromisoCuidados,
      aceptaContrato
    } = req.body;

    // ✅ Cloudinary: guardar URL pública (file.path) en lugar de filename local
    const documentoIdentidad = req.files?.documentoIdentidad?.[0]?.path || null;
    const pruebaResidencia = req.files?.pruebaResidencia?.[0]?.path || null;

    const solicitud = new SolicitudAdopcion({
      mascota,
      nombreCompleto,
      cedula,
      fechaNacimiento,
      direccion,
      barrio,
      ciudad,
      telefono,
      correo,
      tipoVivienda,
      tenenciaVivienda,
      acuerdoFamiliar,
      hayNinos,
      otrasMascotas,
      alergias,
      motivoAdopcion,
      lugarMascota,
      reaccionProblemas,
      tiempoSola,
      responsable,
      queHariasMudanza,
      aceptaVisitaVirtual,
      compromisoCuidados,
      aceptaContrato,
      documentoIdentidad,
      pruebaResidencia,
      adoptante: req.userId
    });

    const guardada = await solicitud.save();

    //  Enviar notificaciones
    const mensaje = 'Nueva solicitud de adopción registrada';
    const datosAdicionales = {
      solicitudId: guardada._id,
      mascotaId: guardada.mascota
    };

    await enviarNotificacionesPorRol('admin', 'solicitud-adopcion-creada', mensaje, datosAdicionales);
    await enviarNotificacionesPorRol('adminFundacion', 'solicitud-adopcion-creada', mensaje, datosAdicionales);

    res.status(201).json({
      success: true,
      message: 'Solicitud registrada con éxito',
      solicitud: guardada
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar solicitud',
      error: error.message
    });
  }
};

// Obtener todas las solicitudes (solo admin y adminFundacion)
exports.getAllSolicitudes = async (req, res) => {
  try {
    const solicitudes = await SolicitudAdopcion.find()
      .populate('adoptante', 'username email')
      .populate('mascota', 'nombre especie raza');
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: error.message
    });
  }
};

// Obtener solicitudes del usuario actual (adoptante)
exports.getMisSolicitudes = async (req, res) => {
  try {
    const solicitudes = await SolicitudAdopcion.find({ adoptante: req.userId })
      .populate('mascota', 'nombre especie raza imagenes');
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus solicitudes',
      error: error.message
    });
  }
};

exports.getSolicitudById = async (req, res) => {
  try {
    const solicitud = await SolicitudAdopcion.findById(req.params.id)
      .populate('mascota')
      .populate('adoptante', 'username email');

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // ✅ Validación de acceso por rol
    if (req.userRole === 'adoptante') {
      if (solicitud.adoptante?._id.toString() !== req.userId) {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
      }
    }

    res.status(200).json(solicitud);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la solicitud',
      error: error.message
    });
  }
};

// Obtener todas las solicitudes agrupadas por mascota
exports.obtenerSolicitudesPorMascota = async (req, res) => {
  try {
    const idMascotaRaw = String(req.params.idMascota || '');

    // ✅ S5147: validar y castear a ObjectId ANTES de usar en la consulta
    if (!mongoose.Types.ObjectId.isValid(idMascotaRaw)) {
      return res.status(400).json({
        success: false,
        message: 'ID de mascota inválido'
      });
    }
  const idMascota = new mongoose.Types.ObjectId(idMascotaRaw);

    const solicitudes = await SolicitudAdopcion.find({ mascota: idMascota })
      .populate('adoptante', 'username email role') //  trae datos del adoptante
      .populate('mascota', 'nombre especie raza imagenes') //  trae datos básicos de la mascota
      .sort({ createdAt: -1 });

    if (!solicitudes || solicitudes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay solicitudes para esta mascota'
      });
    }

    res.status(200).json({
      success: true,
      total: solicitudes.length,
      mascota: solicitudes[0].mascota,
      solicitudes
    });

  } catch (error) {
    console.error('[obtenerSolicitudesPorMascota] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: error.message
    });
  }
};

// Obtener resumen de solicitudes agrupadas por mascota
exports.getMascotasConSolicitudes = async (req, res) => {
  try {
    const agregados = await SolicitudAdopcion.aggregate([
      {
        $group: {
          _id: "$mascota",
          total: { $sum: 1 },
          pendientes: {
            $sum: { $cond: [{ $eq: ["$estado", "pendiente"] }, 1, 0] }
          },
          enProceso: {
            $sum: { $cond: [{ $eq: ["$estado", "en proceso"] }, 1, 0] }
          },
          rechazadas: {
            $sum: { $cond: [{ $eq: ["$estado", "rechazada"] }, 1, 0] }
          },
          finalizadas: {
            $sum: { $cond: [{ $eq: ["$estado", "finalizada"] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "mascotas",
          localField: "_id",
          foreignField: "_id",
          as: "mascota"
        }
      },
      { $unwind: "$mascota" },
      {
        $project: {
          _id: 0,
          mascotaId: "$mascota._id",
          nombre: "$mascota.nombre",
          imagen: { $arrayElemAt: ["$mascota.imagenes", 0] },
          total: 1,
          pendientes: 1,
          enProceso: 1,
          rechazadas: 1,
          finalizadas: 1
        }
      }
    ]);

    res.status(200).json(agregados);
  } catch (error) {
    console.error('Error en getMascotasConSolicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen por mascota',
      error: error.message
    });
  }
};

// Rechazar solicitud de adopción
exports.rechazarSolicitud = async (req, res) => {
  try {
    const solicitud = await SolicitudAdopcion.findById(req.params.id);

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // Solo admins y adminFundación pueden rechazar
    if (req.userRole !== 'admin' && req.userRole !== 'adminFundacion') {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    solicitud.estado = 'rechazada';
    await solicitud.save();

    // ✅ Enviar notificación al adoptante
    const mensaje = 'Tu solicitud de adopción fue rechazada. Puedes intentarlo nuevamente con otra mascota.';
    const datosAdicionales = { solicitudId: solicitud._id };

    await enviarNotificacionPersonalizada(
      [solicitud.adoptante],
      'solicitud-adopcion-rechazada',
      mensaje,
      datosAdicionales
    );

    res.status(200).json({
      success: true,
      message: 'Solicitud rechazada exitosamente',
      solicitud
    });

  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al rechazar solicitud',
      error: error.message
    });
  }
};
