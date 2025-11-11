// controllers/procesoAdopcionController.js

const mongoose = require('mongoose');
const ProcesoAdopcion = require('../models/ProcesoAdopcion');
const SolicitudAdopcion = require('../models/SolicitudAdopcion');
const { enviarNotificacionPersonalizada } = require('../utils/notificaciones');

// 🔒 Middleware reutilizable: validar y limpiar IDs
function validarObjectId(id) {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return id.toString();
}

// Normaliza el campo de correo en documentos poblados (si existe 'correo' lo copia a 'email')
function normalizarEmailEnObjeto(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (!obj.email && obj.correo) {
    // copia correo a email para consistencia
    obj.email = obj.correo;
  }
  return obj;
}

// Crear un nuevo proceso (solo si la solicitud está pendiente)
exports.crearProceso = async (req, res) => {
  try {
    const rawId = req.body.solicitudId || req.body.solicitud; // aceptar ambos nombres si vienen
    const solicitudId = validarObjectId(rawId);
    if (!solicitudId) {
      return res.status(400).json({ success: false, message: 'ID de solicitud no válido.' });
    }

    const solicitud = await SolicitudAdopcion.findById(solicitudId);
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }

    // Sólo crear proceso si la solicitud está pendiente (evita crear duplicados)
    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ success: false, message: 'La solicitud no es válida o ya está en proceso.' });
    }

    solicitud.estado = 'en proceso';
    await solicitud.save();

    const proceso = new ProcesoAdopcion({ solicitud: solicitudId });
    const guardado = await proceso.save();

    const mensaje = 'Tu solicitud de adopción fue aprobada. Hemos iniciado el proceso de adopción.';
    const datosAdicionales = {
      solicitudId: solicitud._id,
      procesoId: guardado._id
    };

    // Adoptante puede ser ObjectId; enviarNotificacionPersonalizada debe aceptar array de ids
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
    console.error('crearProceso error:', error);
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
    const procesoId = validarObjectId(req.params.id);
    if (!procesoId) {
      return res.status(400).json({ success: false, message: 'ID de proceso no válido.' });
    }

    const { fechaEntrevista, enlaceMeet, observacionesEntrevista, aprobada } = req.body;

    const proceso = await ProcesoAdopcion.findByIdAndUpdate(
      procesoId,
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

    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });
    }

    res.status(200).json({ success: true, message: 'Entrevista agendada', proceso });
  } catch (error) {
    console.error('agendarEntrevista error:', error);
    res.status(500).json({ success: false, message: 'Error al agendar entrevista', error: error.message });
  }
};

// Registrar visita presencial
exports.registrarVisita = async (req, res) => {
  try {
    const procesoId = validarObjectId(req.params.id);
    if (!procesoId) {
      return res.status(400).json({ success: false, message: 'ID de proceso no válido.' });
    }

    const { fechaVisita, horaVisita, responsable, observacionesVisita, asistio, aprobada } = req.body;

    const proceso = await ProcesoAdopcion.findByIdAndUpdate(
      procesoId,
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

    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });
    }

    res.status(200).json({ success: true, message: 'Visita registrada', proceso });
  } catch (error) {
    console.error('registrarVisita error:', error);
    res.status(500).json({ success: false, message: 'Error al registrar visita', error: error.message });
  }
};

// Subir imagen del compromiso firmado (adoptante)
exports.subirCompromiso = async (req, res) => {
  try {
    const procesoId = validarObjectId(req.params.id);
    if (!procesoId) {
      return res.status(400).json({ success: false, message: 'ID de proceso no válido.' });
    }

    if (!req.cloudinaryCompromiso) {
      return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo.' });
    }

    const proceso = await ProcesoAdopcion.findById(procesoId);
    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso de adopción no encontrado.' });
    }

    const solicitud = await SolicitudAdopcion.findById(proceso.solicitud);
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud asociada no encontrada.' });
    }

    // Verificar que el usuario actual sea el adoptante
    if (!req.userId || solicitud.adoptante.toString() !== req.userId) {
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
    console.error('subirCompromiso error:', error);
    res.status(500).json({ success: false, message: 'Error al subir compromiso firmado.', error: error.message });
  }
};

// Registrar entrega de la mascota
exports.registrarEntrega = async (req, res) => {
  try {
    const procesoId = validarObjectId(req.params.id);
    if (!procesoId) {
      return res.status(400).json({ success: false, message: 'ID de proceso no válido.' });
    }

    const { fechaEntrega, personaEntrega, observacionesEntrega, aprobada } = req.body;

    const proceso = await ProcesoAdopcion.findById(procesoId);
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
    console.error('registrarEntrega error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar entrega.',
      error: error.message
    });
  }
};

// Obtener todos los procesos
exports.getAllProcesos = async (req, res) => {
  try {
    const procesos = await ProcesoAdopcion.find().populate({
      path: 'solicitud',
      populate: { path: 'adoptante mascota' }
    });

    // Normalizar email en adoptante si es necesario
    for (const p of procesos) {
      if (p?.solicitud?.adoptante) {
        normalizarEmailEnObjeto(p.solicitud.adoptante);
      }
    }

    res.status(200).json({ success: true, procesos });
  } catch (error) {
    console.error('getAllProcesos error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener procesos', error: error.message });
  }
};

// Obtener proceso por ID de solicitud
exports.getProcesoPorSolicitud = async (req, res) => {
  try {
    const solicitudId = validarObjectId(req.params.solicitudId);
    if (!solicitudId) {
      return res.status(400).json({ success: false, message: 'ID de solicitud no válido.' });
    }

  // Usar la ID validada directamente en la consulta (evita construir un ObjectId con la firma deprecada)
  const proceso = await ProcesoAdopcion.findOne({ solicitud: solicitudId }).populate({
      path: 'solicitud',
      populate: { path: 'adoptante mascota' }
    });

    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso no encontrado para esta solicitud' });
    }

    // Normalizar adoptante.email si viene como correo
    if (proceso.solicitud?.adoptante) {
      normalizarEmailEnObjeto(proceso.solicitud.adoptante);
    }

    res.status(200).json({ success: true, proceso });
  } catch (error) {
    console.error('getProcesoPorSolicitud error:', error);
    res.status(500).json({ success: false, message: 'Error al consultar proceso por solicitud', error: error.message });
  }
};

// Aprobar etapa del proceso
exports.aprobarEtapa = async (req, res) => {
  const procesoId = validarObjectId(req.params.id);
  const { etapa } = req.params;

  const etapasValidas = ['entrevista', 'visita', 'compromiso', 'entrega'];
  if (!procesoId || !etapasValidas.includes(etapa)) {
    return res.status(400).json({ success: false, message: 'Etapa o ID no válidos.' });
  }

  try {
    const proceso = await ProcesoAdopcion.findById(procesoId);
    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });
    }

    // Asegurarse de que la etapa exista como objeto antes de asignar
    if (!proceso[etapa] || typeof proceso[etapa] !== 'object') proceso[etapa] = {};
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
    console.error('aprobarEtapa error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar etapa.',
      error: error.message
    });
  }
};

// Rechazar etapa
exports.rechazarEtapa = async (req, res) => {
  const procesoId = validarObjectId(req.params.id);
  const { etapa } = req.params;
  const { motivo } = req.body;

  const etapasValidas = ['entrevista', 'visita', 'compromiso', 'entrega'];
  if (!procesoId || !etapasValidas.includes(etapa)) {
    return res.status(400).json({ success: false, message: 'Etapa o ID no válidos.' });
  }

  try {
    const proceso = await ProcesoAdopcion.findById(procesoId);
    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });
    }

    const solicitud = await SolicitudAdopcion.findById(proceso.solicitud);
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud asociada no encontrada.' });
    }

    // Asegurarse de que la etapa exista
    if (!proceso[etapa] || typeof proceso[etapa] !== 'object') proceso[etapa] = {};
    proceso[etapa].aprobada = false;

    proceso.finalizado = true;
    proceso.etapaRechazada = etapa;
    proceso.motivoRechazo = motivo || 'No especificado';
    solicitud.estado = 'rechazada';

    await proceso.save();
    await solicitud.save();

    res.status(200).json({
      success: true,
      message: `Proceso finalizado. Etapa '${etapa}' rechazada.`,
      proceso
    });
  } catch (error) {
    console.error('rechazarEtapa error:', error);
    res.status(500).json({ success: false, message: 'Error al rechazar etapa.', error: error.message });
  }
};

// Obtener proceso por ID
exports.getProcesoPorId = async (req, res) => {
  try {
    const procesoId = validarObjectId(req.params.id);
    if (!procesoId) {
      return res.status(400).json({ success: false, message: 'ID de proceso no válido.' });
    }

    const proceso = await ProcesoAdopcion.findById(procesoId).populate({
      path: 'solicitud',
      populate: [
        { path: 'mascota' },
        { path: 'adoptante', select: 'username email correo' } // traer ambos posibles campos
      ]
    });

    if (!proceso) {
      return res.status(404).json({ success: false, message: 'Proceso no encontrado' });
    }

    // Normalizar correo/email en adoptante poblado
    if (proceso.solicitud?.adoptante) {
      normalizarEmailEnObjeto(proceso.solicitud.adoptante);
    }

    // Si el rol adoptante intenta acceder, verificar ownership
    if (req.userRole === 'adoptante') {
      const adoptanteId = proceso.solicitud?.adoptante?._id?.toString() ?? null;
      if (!adoptanteId || adoptanteId !== req.userId) {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
      }
    }

    res.json({ success: true, proceso });
  } catch (error) {
    console.error('getProcesoPorId error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el proceso', error: error.message });
  }
};

// Obtener procesos del usuario autenticado
exports.getMisProcesos = async (req, res) => {
  try {
    const userIdValid = validarObjectId(req.userId);
    if (!userIdValid) {
      return res.status(400).json({ success: false, message: 'Usuario no autenticado o ID inválido.' });
    }

    // Buscar procesos y popular solicitud.mascota y adoptante; filtrar por adoptante en la población
    const procesos = await ProcesoAdopcion.find()
      .populate({
        path: 'solicitud',
        populate: [
          { path: 'mascota' },
          // Usar la ID validada como string; Mongoose la castea automáticamente a ObjectId
          { path: 'adoptante', match: { _id: userIdValid } }
        ]
      });

    // Filtrar los que tenían adoptante poblado (match)
    const procesosFiltrados = procesos.filter(p => p.solicitud?.adoptante);

    // Normalizar emails
    for (const p of procesosFiltrados) {
      if (p?.solicitud?.adoptante) {
        normalizarEmailEnObjeto(p.solicitud.adoptante);
      }
    }

    res.status(200).json({ success: true, procesos: procesosFiltrados });
  } catch (error) {
    console.error('getMisProcesos error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener procesos del usuario.', error: error.message });
  }
};
