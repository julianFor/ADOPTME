const mongoose = require('mongoose'); // ✅ agregado para validar ObjectId
const ProcesoAdopcion = require('../models/ProcesoAdopcion');
const SolicitudAdopcion = require('../models/SolicitudAdopcion');
const { enviarNotificacionPersonalizada } = require('../utils/notificaciones'); 

// Crear un nuevo proceso (solo si la solicitud está aprobada)
exports.crearProceso = async (req, res) => {
  try {
    const { solicitudId } = req.body;

    const solicitud = await SolicitudAdopcion.findById(solicitudId);

    // ✅ SonarQube S6582 - uso de encadenamiento opcional
    if (solicitud?.estado !== 'pendiente') {
      return res.status(400).json({ success: false, message: 'La solicitud no es válida o ya está en proceso.' });
    }

    solicitud.estado = 'en proceso';
    await solicitud.save();

    const proceso = new ProcesoAdopcion({ solicitud: solicitudId });
    const guardado = await proceso.save();

    //  Notificar al adoptante
    const mensaje = 'Tu solicitud de adopción fue aprobada. Hemos iniciado el proceso de adopción.';
    const datosAdicionales = {
      solicitudId: solicitud._id,
      procesoId: guardado._id
    };

    await enviarNotificacionPersonalizada(
      [solicitud.adoptante],
      'solicitud-adopcion-aprobada',
      mensaje,
      datosAdicionales
    );

    res.status(201).json({
      success: true,
      message: 'Proceso de adopción creado',
      proceso: guardado
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear proceso',
      error: error.message
    });
  }
};

// Agendar entrevista virtual
exports.agendarEntrevista = async (req, res) => {
  try {
    const { fechaEntrevista, enlaceMeet, observacionesEntrevista, aprobada } = req.body;
    const proceso = await ProcesoAdopcion.findByIdAndUpdate(
      req.params.id,
      {
        entrevista: {
          fechaEntrevista,
          enlaceMeet,
          observacionesEntrevista,
          aprobada: Boolean(aprobada)
        }
      },
      { new: true }
    );
    res.status(200).json({ success: true, message: 'Entrevista agendada', proceso });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agendar entrevista', error: error.message });
  }
};

// Registrar visita presencial
exports.registrarVisita = async (req, res) => {
  try {
    const { fechaVisita, horaVisita, responsable, observacionesVisita, asistio, aprobada } = req.body;
    const proceso = await ProcesoAdopcion.findByIdAndUpdate(
      req.params.id,
      {
        visita: {
          fechaVisita,
          horaVisita,
          responsable,
          observacionesVisita,
          asistio: Boolean(asistio),
          aprobada: Boolean(aprobada)
        }
      },
      { new: true }
    );
    res.status(200).json({ success: true, message: 'Visita registrada', proceso });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar visita', error: error.message });
  }
};

// Subir imagen del compromiso firmado (adoptante)
exports.subirCompromiso = async (req, res) => {
  try {
    const procesoId = req.params.id;

    if (!req.cloudinaryCompromiso) {
      return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo.' });
    }

    const proceso = await ProcesoAdopcion.findById(procesoId);
    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso de adopción no encontrado.' });
    }

    const solicitud = await SolicitudAdopcion.findById(proceso.solicitud);
    if (!solicitud || solicitud.adoptante.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para subir el compromiso.' });
    }

    proceso.compromiso = {
      archivo: req.cloudinaryCompromiso, 
      firmado: true,                     
      aprobada: false                    
    };

    await proceso.save();

    res.status(200).json({
      success: true,
      message: 'Compromiso firmado subido con éxito.',
      proceso
    });
  } catch (error) {
    console.error('Error al subir compromiso:', error);
    res.status(500).json({ success: false, message: 'Error al subir compromiso firmado.', error: error.message });
  }
};

// Registrar entrega de la mascota
exports.registrarEntrega = async (req, res) => {
  try {
    const { fechaEntrega, personaEntrega, observacionesEntrega, aprobada } = req.body;

    const proceso = await ProcesoAdopcion.findById(req.params.id);
    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso de adopción no encontrado.' });
    }

    const solicitud = await SolicitudAdopcion.findById(proceso.solicitud);
    if (!solicitud) {
      return res.status(400).json({ success: false, message: 'Solicitud asociada no encontrada.' });
    }

    proceso.entrega = {
      fechaEntrega,
      personaEntrega,
      observacionesEntrega,
      aprobada: Boolean(aprobada)
    };

    await proceso.save();

    const mensaje = '¡Entrega confirmada! Gracias por brindarle un hogar a tu nuevo compañero peludo 🐾';
    const datosAdicionales = {
      procesoId: proceso._id,
      fechaEntrega
    };

    await enviarNotificacionPersonalizada(
      [solicitud.adoptante],
      'proceso-entrega-confirmada',
      mensaje,
      datosAdicionales
    );

    res.status(200).json({
      success: true,
      message: 'Entrega registrada exitosamente.',
      entrega: proceso.entrega
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar entrega.',
      error: error.message
    });
  }
};

// Obtener todos los procesos (admin/adminFundacion)
exports.getAllProcesos = async (req, res) => {
  try {
    const procesos = await ProcesoAdopcion.find().populate({
      path: 'solicitud',
      populate: { path: 'adoptante mascota' }
    });

    res.status(200).json({ success: true, procesos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener procesos', error: error.message });
  }
};

// Obtener proceso por ID de solicitud
exports.getProcesoPorSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;

    // ✅ SonarQube S5147 - evitar NoSQL injection
    if (!mongoose.Types.ObjectId.isValid(solicitudId)) {
      return res.status(400).json({ success: false, message: 'ID de solicitud no válido.' });
    }

    const proceso = await ProcesoAdopcion.findOne({ solicitud: solicitudId }).populate({
      path: 'solicitud',
      populate: { path: 'adoptante mascota' }
    });

    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso no encontrado para esta solicitud' });
    }

    res.status(200).json({ success: true, proceso });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al consultar proceso por solicitud', error: error.message });
  }
};

// Aprobar etapa del proceso
exports.aprobarEtapa = async (req, res) => {
  const { id, etapa } = req.params;

  const etapasValidas = ['entrevista', 'visita', 'compromiso', 'entrega'];
  if (!etapasValidas.includes(etapa)) {
    return res.status(400).json({ success: false, message: 'Etapa no válida.' });
  }

  try {
    const proceso = await ProcesoAdopcion.findById(id);
    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });
    }

    if (!proceso[etapa]) {
      proceso[etapa] = {}; 
    }
    proceso[etapa].aprobada = true;

    const todasAprobadas = etapasValidas.every(et => proceso[et]?.aprobada === true);

    if (todasAprobadas) {
      proceso.finalizado = true;
      const solicitud = await SolicitudAdopcion.findById(proceso.solicitud);
      if (solicitud) {
        solicitud.estado = 'finalizada';
        await solicitud.save();
      }
    }

    await proceso.save();

    res.status(200).json({
      success: true,
      message: `Etapa '${etapa}' aprobada.${todasAprobadas ? ' Proceso finalizado.' : ''}`,
      proceso
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al aprobar etapa.',
      error: error.message
    });
  }
};

// Rechazar etapa
exports.rechazarEtapa = async (req, res) => {
  const { id, etapa } = req.params;
  const { motivo } = req.body;

  const etapasValidas = ['entrevista', 'visita', 'compromiso', 'entrega'];
  if (!etapasValidas.includes(etapa)) {
    return res.status(400).json({ success: false, message: 'Etapa no válida.' });
  }

  try {
    const proceso = await ProcesoAdopcion.findById(id);
    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });
    }

    const solicitud = await SolicitudAdopcion.findById(proceso.solicitud);
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud asociada no encontrada.' });
    }

    proceso[etapa].aprobada = false;
    proceso.finalizado = true;
    proceso.etapaRechazada = etapa;
    proceso.motivoRechazo = motivo;
    solicitud.estado = 'rechazada';

    await proceso.save();
    await solicitud.save();

    res.status(200).json({
      success: true,
      message: `Proceso finalizado. Etapa '${etapa}' rechazada.`,
      proceso
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al rechazar etapa.', error: error.message });
  }
};

exports.getProcesoPorId = async (req, res) => {
  try {
    const proceso = await ProcesoAdopcion.findById(req.params.id)
      .populate({
        path: 'solicitud',
        populate: [
          { path: 'mascota' },
          { path: 'adoptante', select: 'username email' }
        ]
      });

    if (!proceso) {
      return res.status(404).json({ message: 'Proceso no encontrado' });
    }

    if (
      req.userRole === 'adoptante' &&
      proceso.solicitud.adoptante._id.toString() !== req.userId
    ) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.json({ success: true, proceso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el proceso' });
  }
};

// Obtener procesos del usuario autenticado 
exports.getMisProcesos = async (req, res) => {
  try {
    const procesos = await ProcesoAdopcion.find()
      .populate({
        path: 'solicitud',
        match: { adoptante: req.userId },
        populate: { path: 'mascota' }
      });

    const procesosFiltrados = procesos.filter(p => p.solicitud !== null);
    res.status(200).json({ success: true, procesos: procesosFiltrados });
  } catch (error) {
    console.error('Error al obtener procesos del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener procesos del usuario.', error: error.message });
  }
};
