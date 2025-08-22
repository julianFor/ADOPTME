// controllers/mascotaController.js
const Mascota = require('../models/Mascota');
const mongoose = require('mongoose');

/* ===== Helpers de parseo (aceptan form-data con corchetes y JSON string) ==== */
const asJSON = (v) => {
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
};

const fromBracketed = (body, prefix) => {
  const obj = {};
  const re = new RegExp(`^${prefix}\\[(.+?)\\]$`);
  for (const k of Object.keys(body || {})) {
    const m = k.match(re);
    if (m) obj[m[1]] = body[k];
  }
  return Object.keys(obj).length ? obj : null;
};

// Normaliza el body a las llaves del modelo (tamano, contactoExterno.correo, etc.)
function normalizeMascotaPayload(body = {}) {
  // tamaño/tamano
  const tamano =
    body.tamano ??
    body['tamaño'] ??
    asJSON(body.mascota)?.tamano ??
    asJSON(body.mascota)?.['tamaño'] ??
    undefined;

  // contacto
  const contactoExterno =
    asJSON(body.contactoExterno) ||
    fromBracketed(body, 'contactoExterno') ||
    {};

  // mapear email -> correo
  if (contactoExterno.email && !contactoExterno.correo) {
    contactoExterno.correo = contactoExterno.email;
    delete contactoExterno.email;
  }

  // origen por defecto (para este CRUD es externo)
  const origen = body.origen || 'externo';

  const payload = {
    nombre: body.nombre,
    especie: body.especie,
    raza: body.raza,
    descripcion: body.descripcion,
    fechaNacimiento: body.fechaNacimiento,
    estadoSalud: body.estadoSalud,
    sexo: body.sexo,
    tamano, // <-- clave correcta en el modelo
    origen,
    publicadaPor: body.publicadaPor,
    contactoExterno,
  };

  // Si el frontend envía "estado" string, lo traducimos a boolean disponible
  if (typeof body.estado === 'string') {
    payload.disponible =
      body.estado.toLowerCase() === 'disponible'
        ? true
        : body.estado.toLowerCase() === 'adoptado'
        ? false
        : undefined;
  }
  // Si envían disponible boolean, respetarlo
  if (typeof body.disponible === 'boolean') {
    payload.disponible = body.disponible;
  }

  return payload;
}

/* ===================== CREAR ===================== */
exports.createMascota = async (req, res) => {
  try {
    console.log("🐾 Datos recibidos:", { body: req.body, files: req.files });

    const payload = normalizeMascotaPayload(req.body);

    // Soportar 1 o varias imágenes (Cloudinary .path)
    const files = Array.isArray(req.files) ? req.files : (req.files?.imagenes || []);
    const imagenes =
      files.length > 0
        ? files.map(f => f.path || f.secure_url).filter(Boolean)
        : (Array.isArray(req.body.imagenes) ? req.body.imagenes : [])
            .filter(u => typeof u === 'string' && u.startsWith('http'));

    const nuevaMascota = new Mascota({
      ...payload,
      imagenes,
      // publicada se calcula en el modelo con default según origen,
      // pero si viene explícito desde admin también se respeta:
      ...(typeof req.body.publicada === 'boolean' ? { publicada: req.body.publicada } : {})
    });

    const mascotaGuardada = await nuevaMascota.save();

    res.status(201).json({
      success: true,
      message: 'Mascota registrada con éxito',
      mascota: mascotaGuardada
    });
  } catch (error) {
    console.error('💥 Error en createMascota:', error);
    res.status(500).json({ success: false, message: 'Error al registrar mascota', error: error.message });
  }
};

/* ===================== LISTAR PUBLICADAS ===================== */
exports.getMascotas = async (_req, res) => {
  try {
    const mascotas = await Mascota.find({ publicada: true });
    res.status(200).json(mascotas);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener mascotas', error: error.message });
  }
};

/* ===================== OBTENER POR ID ===================== */
exports.getMascotaById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }
    const mascota = await Mascota.findById(id);
    if (!mascota) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }
    res.status(200).json(mascota);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la mascota', error: error.message });
  }
};

/* ===================== ACTUALIZAR ===================== */
exports.updateMascota = async (req, res) => {
  try {
    const updates = normalizeMascotaPayload(req.body);

    // Imágenes nuevas (si las hay)
    const files = Array.isArray(req.files) ? req.files : (req.files?.imagenes || []);
    if (files.length > 0) {
      updates.imagenes = files.map(f => f.path || f.secure_url).filter(Boolean);
    }

    const mascotaActualizada = await Mascota.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!mascotaActualizada) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }

    res.status(200).json({
      success: true,
      message: 'Mascota actualizada correctamente',
      mascota: mascotaActualizada
    });
  } catch (error) {
    console.error('💥 Error en updateMascota:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la mascota', error: error.message });
  }
};

/* ===================== ELIMINAR ===================== */
exports.deleteMascota = async (req, res) => {
  try {
    const mascota = await Mascota.findByIdAndDelete(req.params.id);
    if (!mascota) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }
    res.status(200).json({ success: true, message: 'Mascota eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la mascota', error: error.message });
  }
};

/* ===================== FILTRO POR ORIGEN ===================== */
exports.getMascotasPorOrigen = async (req, res) => {
  try {
    const origen = req.params.origen;
    if (!['fundacion', 'externo'].includes(origen)) {
      return res.status(400).json({ success: false, message: 'Origen no válido' });
    }
    const mascotas = await Mascota.find({ origen, publicada: true });
    res.status(200).json(mascotas);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener mascotas por origen', error: error.message });
  }
};
