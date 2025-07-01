const SolicitudAdopcion = require('../models/SolicitudAdopcion');

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


    const documentoIdentidad = req.files?.documentoIdentidad?.[0]?.filename || null;
    const pruebaResidencia = req.files?.pruebaResidencia?.[0]?.filename || null;


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
      .populate('mascota', 'nombre especie raza');
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus solicitudes',
      error: error.message
    });
  }
};

// Obtener solicitud por ID
exports.getSolicitudById = async (req, res) => {
  try {
    const solicitud = await SolicitudAdopcion.findById(req.params.id)
      .populate('mascota')
      .populate('adoptante', 'username email');

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // Validación de acceso (adoptante solo puede ver su propia solicitud)
    if (req.userRole === 'adoptante' && solicitud.adoptante._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
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
    const { idMascota } = req.params;

    const solicitudes = await SolicitudAdopcion.find({ mascota: idMascota })
      .populate('adoptante', 'username email role') // ✅ trae datos del adoptante
      .populate('mascota', 'nombre especie raza imagenes') // ✅ trae datos básicos de la mascota
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
      {
        $unwind: "$mascota"
      },
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
