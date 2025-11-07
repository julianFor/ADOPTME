// src/controllers/procesoAdopcionController.js
const mongoose = require('mongoose');
const ProcesoAdopcion = require('../models/ProcesoAdopcion');
const SolicitudAdopcion = require('../models/SolicitudAdopcion');
const { enviarNotificacionPersonalizada } = require('../utils/notificaciones'); 

// --- Helpers ---
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeString = (s) => {
  // Si el valor es nulo o no es string, retornamos cadena vacía
  if (s === null || typeof s !== 'string') return '';
  
  // Array de caracteres a reemplazar
  const caracteresProhibidos = ['$', '.', '{', '}', '[', ']'];
  
  // Reemplazamos cada carácter prohibido con cadena vacía
  let resultado = s;
  for (const caracter of caracteresProhibidos) {
    resultado = resultado.replaceAll(caracter, '');
  }
  
  return resultado.trim();
};

// --- Crear un nuevo proceso ---
exports.crearProceso = async (req, res) => {
  try {
    const { solicitudId } = req.body;

    if (!isValidObjectId(solicitudId)) {
      return res.status(400).json({ success: false, message: 'ID de solicitud inválido.' });
    }

    const solicitud = await SolicitudAdopcion.findById(solicitudId);

    if (solicitud?.estado !== 'pendiente') {
      return res.status(400).json({ success: false, message: 'La solicitud no es válida o ya está en proceso.' });
    }

    solicitud.estado = 'en proceso';
    await solicitud.save();

    const proceso = new ProcesoAdopcion({ solicitud: solicitud._id });
    const guardado = await proceso.save();

    const mensaje = 'Tu solicitud de adopción fue aprobada. Hemos iniciado el proceso de adopción.';
    const datosAdicionales = { solicitudId: solicitud._id, procesoId: guardado._id };

    await enviarNotificacionPersonalizada(
      [solicitud.adoptante],
      'solicitud-adopcion-aprobada',
      mensaje,
      datosAdicionales
    );

    res.status(201).json({ success: true, message: 'Proceso de adopción creado', proceso: guardado });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear proceso', error: error.message });
  }
};

// --- Agendar entrevista ---
exports.agendarEntrevista = async (req, res) => {
  try {
    const { fechaEntrevista, enlaceMeet, observacionesEntrevista, aprobada } = req.body;
    const procesoId = req.params.id;

    if (!isValidObjectId(procesoId)) {
      return res.status(400).json({ success: false, message: 'ID de proceso inválido.' });
    }

    const proceso = await ProcesoAdopcion.findById(procesoId);
    if (!proceso) return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });

    proceso.entrevista = {
      fechaEntrevista: sanitizeString(fechaEntrevista),
      enlaceMeet: sanitizeString(enlaceMeet),
      observacionesEntrevista: sanitizeString(observacionesEntrevista),
      aprobada: Boolean(aprobada)
    };

    await proceso.save();

    res.status(200).json({ success: true, message: 'Entrevista agendada', proceso });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agendar entrevista', error: error.message });
  }
};

// --- Registrar visita presencial ---
exports.registrarVisita = async (req, res) => {
  try {
    const { fechaVisita, horaVisita, responsable, observacionesVisita, asistio, aprobada } = req.body;
    const procesoId = req.params.id;

    if (!isValidObjectId(procesoId)) {
      return res.status(400).json({ success: false, message: 'ID de proceso inválido.' });
    }

    const proceso = await ProcesoAdopcion.findById(procesoId);
    if (!proceso) return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });

    proceso.visita = {
      fechaVisita: sanitizeString(fechaVisita),
      horaVisita: sanitizeString(horaVisita),
      responsable: sanitizeString(responsable),
      observacionesVisita: sanitizeString(observacionesVisita),
      asistio: Boolean(asistio),
      aprobada: Boolean(aprobada)
    };

    await proceso.save();

    res.status(200).json({ success: true, message: 'Visita registrada', proceso });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar visita', error: error.message });
  }
};

// --- Subir compromiso ---
exports.subirCompromiso = async (req, res) => {
  try {
    const procesoId = req.params.id;
    if (!isValidObjectId(procesoId)) {
      return res.status(400).json({ success: false, message: 'ID de proceso inválido.' });
    }

    if (!req.cloudinaryCompromiso) {
      return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo.' });
    }

    const proceso = await ProcesoAdopcion.findById(procesoId);
    if (!proceso) return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });

    const solicitud = await SolicitudAdopcion.findById(proceso.solicitud);
    if (!solicitud || solicitud.adoptante.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para subir el compromiso.' });
    }

    proceso.compromiso = { archivo: req.cloudinaryCompromiso, firmado: true, aprobada: false };
    await proceso.save();

    res.status(200).json({ success: true, message: 'Compromiso firmado subido con éxito.', proceso });
  } catch (error) {
    console.error('Error al subir compromiso:', error);
    res.status(500).json({ success: false, message: 'Error al subir compromiso firmado.', error: error.message });
  }
};

// --- Registrar entrega ---
exports.registrarEntrega = async (req, res) => {
  try {
    const { fechaEntrega, personaEntrega, observacionesEntrega, aprobada } = req.body;
    const procesoId = req.params.id;

    if (!isValidObjectId(procesoId)) {
      return res.status(400).json({ success: false, message: 'ID de proceso inválido.' });
    }

    const proceso = await ProcesoAdopcion.findById(procesoId);
    if (!proceso) return res.status(404).json({ success: false, message: 'Proceso no encontrado.' });

    const solicitud = await SolicitudAdopcion.findById(proceso.solicitud);
    if (!solicitud) return res.status(404).json({ success: false, message: 'Solicitud asociada no encontrada.' });

    proceso.entrega = {
      fechaEntrega: sanitizeString(fechaEntrega),
      personaEntrega: sanitizeString(personaEntrega),
      observacionesEntrega: sanitizeString(observacionesEntrega),
      aprobada: Boolean(aprobada)
    };

    await proceso.save();

    const mensaje = '¡Entrega confirmada! Gracias por brindarle un hogar a tu nuevo compañero peludo 🐾';
    const datosAdicionales = { procesoId: proceso._id, fechaEntrega };
    await enviarNotificacionPersonalizada([solicitud.adoptante], 'proceso-entrega-confirmada', mensaje, datosAdicionales);

    res.status(200).json({ success: true, message: 'Entrega registrada exitosamente.', entrega: proceso.entrega });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar entrega.', error: error.message });
  }
};

// --- Obtener procesos con seguridad ---
exports.getProcesoPorId = async (req, res) => {
  try {
    const procesoId = req.params.id;
    if (!isValidObjectId(procesoId)) {
      return res.status(400).json({ message: 'ID de proceso inválido.' });
    }

    const proceso = await ProcesoAdopcion.findById(procesoId)
      .populate({ path: 'solicitud', populate: [{ path: 'mascota' }, { path: 'adoptante', select: 'username email' }] });

    if (!proceso) return res.status(404).json({ message: 'Proceso no encontrado' });

    if (req.userRole === 'adoptante' && proceso.solicitud.adoptante._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.json({ success: true, proceso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el proceso' });
  }
};

// --- Obtener procesos del usuario ---
exports.getMisProcesos = async (req, res) => {
  try {
    const procesos = await ProcesoAdopcion.find()
      .populate({ path: 'solicitud', match: { adoptante: req.userId }, populate: { path: 'mascota' } });

    const procesosFiltrados = procesos.filter(p => p.solicitud !== null);

    res.status(200).json({ success: true, procesos: procesosFiltrados });
  } catch (error) {
    console.error('Error al obtener procesos del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener procesos del usuario.', error: error.message });
  }
};

// Obtener todos los procesos (admin/adminFundacion)
exports.getAllProcesos = async (req, res) => {
  try {
    const procesos = await ProcesoAdopcion.find()
      .populate({
        path: 'solicitud',
        populate: [
          { path: 'mascota' },
          { path: 'adoptante', select: 'username email' }
        ]
      });

    res.status(200).json({ success: true, procesos });
  } catch (error) {
    console.error('Error al obtener todos los procesos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los procesos',
      error: error.message 
    });
  }
};

// Obtener proceso por solicitud ID
exports.getProcesoPorSolicitud = async (req, res) => {
  try {
    const { solicitudId } = req.params;

    if (!isValidObjectId(solicitudId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de solicitud inválido' 
      });
    }

    const proceso = await ProcesoAdopcion.findOne({ solicitud: solicitudId })
      .populate({
        path: 'solicitud',
        populate: [
          { path: 'mascota' },
          { path: 'adoptante', select: 'username email' }
        ]
      });

    if (!proceso) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontró proceso para esta solicitud' 
      });
    }

    // Verificar permisos para adoptante
    if (req.userRole === 'adoptante' && 
        proceso.solicitud.adoptante._id.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para ver este proceso' 
      });
    }

    res.json({ success: true, proceso });
  } catch (error) {
    console.error('Error al obtener proceso por solicitud:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener el proceso',
      error: error.message 
    });
  }
};

// Aprobar una etapa específica del proceso
exports.aprobarEtapa = async (req, res) => {
  try {
    const { id, etapa } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de proceso inválido' 
      });
    }

    const etapasValidas = ['entrevista', 'visita', 'compromiso', 'entrega'];
    if (!etapasValidas.includes(etapa)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Etapa no válida' 
      });
    }

    const proceso = await ProcesoAdopcion.findById(id)
      .populate('solicitud');

    if (!proceso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proceso no encontrado' 
      });
    }

    // Marcar la etapa como aprobada
    if (proceso[etapa]) {
      proceso[etapa].aprobada = true;
      await proceso.save();

      // Enviar notificación al adoptante
      const mensaje = `La etapa de ${etapa} ha sido aprobada en tu proceso de adopción.`;
      await enviarNotificacionPersonalizada(
        [proceso.solicitud.adoptante],
        'etapa-proceso-aprobada',
        mensaje,
        { procesoId: proceso._id, etapa }
      );

      res.json({ 
        success: true, 
        message: `Etapa ${etapa} aprobada exitosamente`,
        proceso 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: `No hay información registrada para la etapa ${etapa}` 
      });
    }
  } catch (error) {
    console.error(`Error al aprobar etapa ${req.params.etapa}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al aprobar la etapa',
      error: error.message 
    });
  }
};

// Rechazar una etapa (finaliza proceso)
exports.rechazarEtapa = async (req, res) => {
  try {
    const { id, etapa } = req.params;
    const { motivo } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de proceso inválido' 
      });
    }

    const etapasValidas = ['entrevista', 'visita', 'compromiso', 'entrega'];
    if (!etapasValidas.includes(etapa)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Etapa no válida' 
      });
    }

    const proceso = await ProcesoAdopcion.findById(id)
      .populate('solicitud');

    if (!proceso) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proceso no encontrado' 
      });
    }

    // Marcar la etapa como no aprobada y agregar motivo
    if (proceso[etapa]) {
      proceso[etapa].aprobada = false;
      proceso[etapa].motivo = sanitizeString(motivo);
      
      // Actualizar estado de la solicitud
      const solicitud = await SolicitudAdopcion.findById(proceso.solicitud);
      if (solicitud) {
        solicitud.estado = 'rechazada';
        await solicitud.save();
      }

      await proceso.save();

      // Enviar notificación al adoptante
      const mensaje = `Lo sentimos, tu proceso de adopción ha sido rechazado en la etapa de ${etapa}.`;
      await enviarNotificacionPersonalizada(
        [proceso.solicitud.adoptante],
        'etapa-proceso-rechazada',
        mensaje,
        { 
          procesoId: proceso._id, 
          etapa,
          motivo: proceso[etapa].motivo 
        }
      );

      res.json({ 
        success: true, 
        message: `Etapa ${etapa} rechazada y proceso finalizado`,
        proceso 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: `No hay información registrada para la etapa ${etapa}` 
      });
    }
  } catch (error) {
    console.error(`Error al rechazar etapa ${req.params.etapa}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al rechazar la etapa',
      error: error.message 
    });
  }
};
