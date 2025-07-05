const ProcesoAdopcion = require('../models/ProcesoAdopcion');
const SolicitudAdopcion = require('../models/SolicitudAdopcion');

// Crear un nuevo proceso (solo si la solicitud está aprobada)
exports.crearProceso = async (req, res) => {
  try {
    const { solicitudId } = req.body;
    const solicitud = await SolicitudAdopcion.findById(solicitudId);

    if (!solicitud || solicitud.estado !== 'pendiente') {
      return res.status(400).json({ success: false, message: 'La solicitud no es válida o ya está en proceso.' });
    }

    solicitud.estado = 'en proceso';
    await solicitud.save();

    const proceso = new ProcesoAdopcion({ solicitud: solicitudId });
    const guardado = await proceso.save();

    res.status(201).json({ success: true, message: 'Proceso de adopción creado', proceso: guardado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear proceso', error: error.message });
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
          // direccionVisita,
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

// Subir PDF del compromiso firmado (adoptante)
exports.subirCompromiso = async (req, res) => {
  try {
    const procesoId = req.params.id;

    if (!req.file) {
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
      archivo: req.file.filename,
      firmado: false,
      aprobada: false
    };

    await proceso.save();

    res.status(200).json({
      success: true,
      message: 'Compromiso firmado subido con éxito.',
      archivo: req.file.filename
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

    res.status(200).json({ success: true, message: 'Entrega registrada exitosamente.', entrega: proceso.entrega });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar entrega.', error: error.message });
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
    const proceso = await ProcesoAdopcion.findOne({ solicitud: req.params.solicitudId }).populate({
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


// Aprobar etapa del proceso: entrevista, visita, compromiso o entrega
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

    // Aprobar la etapa correspondiente
    if (!proceso[etapa]) {
      proceso[etapa] = {}; // inicializar si no existe
    }
    proceso[etapa].aprobada = true;

    // Verificar si todas las etapas están aprobadas
    const todasAprobadas = etapasValidas.every(et => proceso[et]?.aprobada === true);

    if (todasAprobadas) {
      proceso.finalizado = true;

      // Cambiar estado de la solicitud asociada
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


// Rechazar etapa del proceso: entrevista, visita, compromiso o entrega
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

    // Marcar como rechazada la etapa
    proceso[etapa].aprobada = false;

    // Marcar como finalizado el proceso
    proceso.finalizado = true;
    proceso.etapaRechazada = etapa;
    proceso.motivoRechazo = motivo;

    // Cambiar estado de la solicitud a rechazada
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
        populate: { path: 'mascota' }
      });

    if (!proceso) {
      return res.status(404).json({ message: 'Proceso no encontrado' });
    }

    res.json({ success: true, proceso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el proceso' });
  }
};



// Obtener procesos de adopción del usuario autenticado 
exports.getMisProcesos = async (req, res) => {
  try {
    const procesos = await ProcesoAdopcion.find()
      .populate({
        path: 'solicitud',
        match: { adoptante: req.userId },
        populate: { path: 'mascota' }
      });

    // Filtrar los procesos donde la solicitud fue excluida (por no coincidir con el userId)
    const procesosFiltrados = procesos.filter(p => p.solicitud !== null);

    res.status(200).json({ success: true, procesos: procesosFiltrados });
  } catch (error) {
    console.error('Error al obtener procesos del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener procesos del usuario.', error: error.message });
  }
};
