const Mascota = require('../models/Mascota');
const mongoose = require('mongoose');
// Crear una nueva mascota (solo adminFundacion)
  exports.createMascota = async (req, res) => {
    try {
  const {
    nombre,
    especie,
    raza,
    descripcion,
    fechaNacimiento,
    estadoSalud,
    origen,
    sexo,
    tamaño,
    publicadaPor
  } = req.body;
    const imagenes = req.files?.map(file => file.filename) || [];

    const nuevaMascota = new Mascota({
      nombre,
      especie,
      raza,
      descripcion,
      fechaNacimiento,
      estadoSalud,
      origen,
      sexo,
      tamaño,
      publicadaPor,
      imagenes,
  });


    const mascotaGuardada = await nuevaMascota.save();
    res.status(201).json({
      success: true,
      message: 'Mascota registrada con éxito',
      mascota: mascotaGuardada
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar mascota', error: error.message });
  }
};

// Obtener todas las mascotas publicadas
exports.getMascotas = async (req, res) => {
  try {
    const mascotas = await Mascota.find({ publicada: true });
    res.status(200).json(mascotas);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener mascotas' });
  }
};

// Obtener una mascota por ID
exports.getMascotaById = async (req, res) => {
  try {
    const id = req.params.id;

    // Validación básica del ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const mascota = await Mascota.findById(id);
    if (!mascota) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    res.status(200).json(mascota);

  } catch (error) {
    console.error('[getMascotaById] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la mascota',
      error: error.message
    });
  }
};

// Actualizar mascota
exports.updateMascota = async (req, res) => {
  try {
    const updates = req.body;
    if (req.files) {
      updates.imagenes = req.files.map(file => file.filename);
    }

    const mascotaActualizada = await Mascota.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!mascotaActualizada) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }

    res.status(200).json({
      success: true,
      message: 'Mascota actualizada correctamente',
      mascota: mascotaActualizada
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar la mascota' });
  }
};

// Eliminar mascota
exports.deleteMascota = async (req, res) => {
  try {
    const mascota = await Mascota.findByIdAndDelete(req.params.id);
    if (!mascota) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }

    res.status(200).json({ success: true, message: 'Mascota eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la mascota' });
  }
};

// Obtener mascotas filtradas por origen (fundacion o externo)
exports.getMascotasPorOrigen = async (req, res) => {
  try {
    const origen = req.params.origen;

    if (!['fundacion', 'externo'].includes(origen)) {
      return res.status(400).json({ success: false, message: 'Origen no válido' });
    }

    const mascotas = await Mascota.find({ origen, publicada: true });
    res.status(200).json(mascotas);
  } catch (error) {
    console.error('[getMascotasPorOrigen] Error:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener mascotas por origen' });
  }
};
