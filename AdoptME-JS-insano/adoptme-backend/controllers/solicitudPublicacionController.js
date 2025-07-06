const SolicitudPublicacion = require('../models/SolicitudPublicacion');
const Mascota = require('../models/Pet');

// Crear nueva solicitud (la llena el adoptante)
exports.crearSolicitud = async (req, res) => {
  try {
    console.log('Body recibido:', req.body);
    console.log('Archivos recibidos:', req.files);

    const {
      contacto,
      mascota,
      condiciones,
      confirmaciones
    } = req.body;

    // Parsear los datos que vienen como strings JSON
    const parsedContacto = typeof contacto === 'string' ? JSON.parse(contacto) : contacto;
    const parsedMascota = typeof mascota === 'string' ? JSON.parse(mascota) : mascota;
    const parsedCondiciones = typeof condiciones === 'string' ? JSON.parse(condiciones) : condiciones;
    const parsedConfirmaciones = typeof confirmaciones === 'string' ? JSON.parse(confirmaciones) : confirmaciones;

    console.log('Datos parseados:', {
      parsedContacto,
      parsedMascota,
      parsedCondiciones,
      parsedConfirmaciones
    });

    const adoptante = req.userId;
    console.log('ID del adoptante:', adoptante);

    const documentoIdentidad = req.files?.documento?.[0]?.filename || null;
    const imagenes = req.files?.imagenes?.map(file => file.filename) || [];

    console.log('Documento de identidad:', documentoIdentidad);
    console.log('Imágenes subidas:', imagenes);

    // Validar que haya al menos 3 imágenes
    if (imagenes.length < 3) {
      console.log('Error: Menos de 3 imágenes subidas');
      return res.status(400).json({
        success: false,
        message: 'Debes subir al menos 3 imágenes de la mascota'
      });
    }

    const nuevaSolicitud = new SolicitudPublicacion({
      adoptante,
      documentoIdentidad,
      contacto: parsedContacto,
      mascota: parsedMascota,
      condiciones: parsedCondiciones,
      confirmaciones: parsedConfirmaciones,
      imagenes,
      estado: 'pendiente'
    });

    console.log('Nueva solicitud a guardar:', nuevaSolicitud);

    const guardada = await nuevaSolicitud.save();
    console.log('Solicitud guardada en BD:', guardada);
    
    res.status(201).json({ 
      success: true, 
      message: 'Solicitud creada con éxito', 
      solicitud: guardada 
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
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
    console.log('Obteniendo todas las solicitudes');
    const solicitudes = await SolicitudPublicacion.find()
      .populate('adoptante', 'username email')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ 
      success: true, 
      count: solicitudes.length,
      solicitudes 
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener solicitudes', 
      error: error.message 
    });
  }
};

// Obtener una solicitud por ID
exports.getSolicitudById = async (req, res) => {
  try {
    console.log(`Obteniendo solicitud con ID: ${req.params.id}`);
    const solicitud = await SolicitudPublicacion.findById(req.params.id)
      .populate('adoptante', 'username email');
      
    if (!solicitud) {
      console.log('Solicitud no encontrada');
      return res.status(404).json({ 
        success: false, 
        message: 'Solicitud no encontrada' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      solicitud 
    });
  } catch (error) {
    console.error('Error al consultar solicitud:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al consultar solicitud', 
      error: error.message 
    });
  }
};

// Obtener solicitudes del usuario actual
exports.getMisSolicitudes = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`Obteniendo solicitudes del usuario: ${userId}`);

    const solicitudes = await SolicitudPublicacion.find({ adoptante: userId })
      .sort({ createdAt: -1 })
      .populate('adoptante', 'username email');

    res.status(200).json({
      success: true,
      count: solicitudes.length,
      solicitudes
    });
  } catch (error) {
    console.error('Error al obtener tus solicitudes:', error);
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
    console.log(`Aprobando solicitud con ID: ${req.params.id}`);
    const solicitud = await SolicitudPublicacion.findById(req.params.id)
      .populate('adoptante');
      
    if (!solicitud || solicitud.estado !== 'pendiente') {
      console.log('Solicitud no válida o ya procesada');
      return res.status(400).json({ 
        success: false, 
        message: 'Solicitud no válida o ya procesada.' 
      });
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
      descripcion: `${solicitud.mascota.personalidad}\n\nHistoria: ${solicitud.mascota.historia}`,
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
    console.log('Mascota creada:', nuevaMascota);

    // Actualizar estado de solicitud
    solicitud.estado = 'aprobada';
    solicitud.observacionesAdmin = req.body.observaciones || '';
    await solicitud.save();
    console.log('Solicitud actualizada:', solicitud);

    res.status(200).json({ 
      success: true, 
      message: 'Solicitud aprobada y mascota publicada', 
      mascota: nuevaMascota 
    });
  } catch (error) {
    console.error('Error al aprobar y publicar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al aprobar y publicar', 
      error: error.message 
    });
  }
};

// Rechazar solicitud (solo admin)
exports.rechazarSolicitud = async (req, res) => {
  try {
    console.log(`Rechazando solicitud con ID: ${req.params.id}`);
    const solicitud = await SolicitudPublicacion.findById(req.params.id);
    if (!solicitud) {
      console.log('Solicitud no encontrada');
      return res.status(404).json({ 
        success: false, 
        message: 'Solicitud no encontrada' 
      });
    }

    solicitud.estado = 'rechazada';
    solicitud.observacionesAdmin = req.body.observaciones || '';
    await solicitud.save();
    console.log('Solicitud rechazada:', solicitud);

    res.status(200).json({ 
      success: true, 
      message: 'Solicitud rechazada', 
      solicitud 
    });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al rechazar solicitud', 
      error: error.message 
    });
  }
};