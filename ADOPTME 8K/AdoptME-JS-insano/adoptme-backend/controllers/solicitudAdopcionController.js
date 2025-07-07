const SolicitudAdopcion = require('../models/SolicitudAdopcion');
const mongoose = require('mongoose');
const Pet = require('../models/Pet'); // Importación correcta del modelo Pet
const User = require('../models/User');

// Crear nueva solicitud de adopción
exports.crearSolicitud = async (req, res) => {
  console.log('[crearSolicitud] Iniciando... Usuario:', req.userId);
  console.log('[crearSolicitud] Body:', req.body);
  console.log('[crearSolicitud] Files:', req.files);

  try {
    const { mascota, ...datos } = req.body;

    // Validación del ID de mascota
    if (!mongoose.Types.ObjectId.isValid(mascota)) {
      console.error('[crearSolicitud] Error: ID de mascota inválido');
      return res.status(400).json({
        success: false,
        message: 'ID de mascota no válido'
      });
    }

    // Verificar existencia de la mascota
    const existeMascota = await Pet.findById(mascota);
    if (!existeMascota) {
      console.error('[crearSolicitud] Error: Mascota no encontrada');
      return res.status(404).json({
        success: false,
        message: 'La mascota especificada no existe'
      });
    }

    // Validar archivos adjuntos
    const documentoIdentidad = req.files?.documentoIdentidad?.[0]?.filename;
    const pruebaResidencia = req.files?.pruebaResidencia?.[0]?.filename;

    if (!documentoIdentidad || !pruebaResidencia) {
      console.error('[crearSolicitud] Error: Documentos incompletos');
      return res.status(400).json({
        success: false,
        message: 'Debes subir ambos documentos requeridos'
      });
    }

    // Crear la solicitud
    const nuevaSolicitud = new SolicitudAdopcion({
      ...datos,
      mascota,
      documentoIdentidad,
      pruebaResidencia,
      adoptante: req.userId,
      estado: 'pendiente'
    });

    const solicitudGuardada = await nuevaSolicitud.save();
    console.log('[crearSolicitud] Solicitud creada:', solicitudGuardada._id);

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: solicitudGuardada
    });

  } catch (error) {
    console.error('[crearSolicitud] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener todas las solicitudes (admin)
exports.getAllSolicitudes = async (req, res) => {
  console.log('[getAllSolicitudes] Iniciando... Rol:', req.userRole);
  
  try {
    const solicitudes = await SolicitudAdopcion.find()
      .populate({
        path: 'adoptante',
        select: 'username email',
        model: 'User'
      })
      .populate({
        path: 'mascota',
        select: 'name species breed photos',
        model: 'Pet'
      });

    console.log('[getAllSolicitudes] Solicitudes encontradas:', solicitudes.length);
    res.status(200).json(solicitudes);
  } catch (error) {
    console.error('[getAllSolicitudes] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener mis solicitudes (adoptante)
exports.getMisSolicitudes = async (req, res) => {
  console.log('[getMisSolicitudes] Iniciando... Usuario:', req.userId);
  
  try {
    // Verificar registro del modelo Pet
    if (!mongoose.models.Pet) {
      console.log('[getMisSolicitudes] Registrando modelo Pet...');
      require('../models/Pet');
    }

    const solicitudes = await SolicitudAdopcion.find({ adoptante: req.userId })
      .populate({
        path: 'mascota',
        select: 'name species breed photos status',
        model: 'Pet'
      })
      .sort({ createdAt: -1 });

    console.log('[getMisSolicitudes] Solicitudes encontradas:', solicitudes.length);

    // Formatear respuesta
    const resultado = solicitudes.map(sol => ({
      ...sol.toObject(),
      mascota: {
        ...sol.mascota?.toObject(),
        fotoPrincipal: sol.mascota?.photos?.[0]?.url || null
      }
    }));

    res.status(200).json(resultado);
  } catch (error) {
    console.error('[getMisSolicitudes] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener solicitud por ID
exports.getSolicitudById = async (req, res) => {
  console.log('[getSolicitudById] Iniciando... ID:', req.params.id);
  
  try {
    const solicitud = await SolicitudAdopcion.findById(req.params.id)
      .populate({
        path: 'mascota',
        select: 'name species breed photos',
        model: 'Pet'
      })
      .populate({
        path: 'adoptante',
        select: 'username email',
        model: 'User'
      });

    if (!solicitud) {
      console.log('[getSolicitudById] Solicitud no encontrada');
      return res.status(404).json({ 
        success: false, 
        message: 'Solicitud no encontrada' 
      });
    }

    // Validar permisos
    if (req.userRole === 'adoptante' && solicitud.adoptante._id.toString() !== req.userId) {
      console.log('[getSolicitudById] Acceso no autorizado');
      return res.status(403).json({ 
        success: false, 
        message: 'No autorizado' 
      });
    }

    console.log('[getSolicitudById] Solicitud encontrada');
    res.status(200).json({
      ...solicitud.toObject(),
      mascota: {
        ...solicitud.mascota?.toObject(),
        fotoPrincipal: solicitud.mascota?.photos?.[0]?.url || null
      }
    });
  } catch (error) {
    console.error('[getSolicitudById] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener solicitudes por mascota (admin)
exports.obtenerSolicitudesPorMascota = async (req, res) => {
  const { idMascota } = req.params;
  console.log('[obtenerSolicitudesPorMascota] Iniciando... Mascota ID:', idMascota);
  
  try {
    // Verificar existencia de mascota
    const mascota = await Pet.findById(idMascota)
      .select('name species breed photos status');
    
    if (!mascota) {
      console.log('[obtenerSolicitudesPorMascota] Mascota no encontrada');
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    const solicitudes = await SolicitudAdopcion.find({ mascota: idMascota })
      .populate({
        path: 'adoptante',
        select: 'username email role',
        model: 'User'
      })
      .sort({ createdAt: -1 });

    console.log('[obtenerSolicitudesPorMascota] Solicitudes encontradas:', solicitudes.length);

    res.status(200).json({
      success: true,
      mascota: {
        _id: mascota._id,
        nombre: mascota.name,
        especie: mascota.species,
        raza: mascota.breed,
        estado: mascota.status,
        fotoPrincipal: mascota.photos?.[0]?.url || null
      },
      total: solicitudes.length,
      solicitudes
    });
  } catch (error) {
    console.error('[obtenerSolicitudesPorMascota] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};