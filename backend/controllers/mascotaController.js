// controllers/mascotaController.js
const Mascota = require('../models/Mascota');
const mongoose = require('mongoose');

/* ===== Helpers locales para bajar duplicación (mismo archivo) ===== */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const ok = (res, data) => res.status(200).json(data);
const created = (res, data) => res.status(201).json(data);
const badRequest = (res, message) =>
  res.status(400).json({ success: false, message });
const notFound = (res, message) =>
  res.status(404).json({ success: false, message });
const serverError = (res, err, message) =>
  res.status(500).json({ success: false, message, error: err?.message });

/** Unifica la extracción de imágenes desde req.files (Cloudinary) o req.body
 *  - Cloudinary: usa f.path o f.secure_url
 *  - Body: acepta arreglo de URLs (http/https)
 */
const extractImages = (req) => {
  const files = Array.isArray(req.files) ? req.files : (req.files?.imagenes || []);
  if (files.length > 0) {
    return files.map((f) => f.path || f.secure_url).filter(Boolean);
  }
  if (Array.isArray(req.body?.imagenes)) {
    return req.body.imagenes.filter((u) => typeof u === 'string' && u.startsWith('http'));
  }
  return [];
};

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
    // ✅ S6594: usar RegExp.exec() en lugar de match()
    const m = re.exec(k);
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

  // origen por defecto
  const origen = body.origen || 'externo';

  const payload = {
    nombre: body.nombre,
    especie: body.especie,
    raza: body.raza,
    descripcion: body.descripcion,
    fechaNacimiento: body.fechaNacimiento,
    estadoSalud: body.estadoSalud,
    sexo: body.sexo,
    tamano,
    origen,
    publicadaPor: body.publicadaPor,
    contactoExterno,
  };

  // ✅ S3358: evitar ternario anidado
  if (typeof body.estado === 'string') {
    const estado = body.estado.toLowerCase();
    if (estado === 'disponible') {
      payload.disponible = true;
    } else if (estado === 'adoptado') {
      payload.disponible = false;
    } else {
      payload.disponible = undefined;
    }
  }

  if (typeof body.disponible === 'boolean') {
    payload.disponible = body.disponible;
  }

  return payload;
}

/* ===================== CREAR ===================== */
exports.createMascota = async (req, res) => {
  try {
    console.log('🐾 Datos recibidos:', { body: req.body, files: req.files });

    const payload = normalizeMascotaPayload(req.body);
    const imagenes = extractImages(req);

    const nuevaMascota = new Mascota({
      ...payload,
      imagenes,
      ...(typeof req.body.publicada === 'boolean' ? { publicada: req.body.publicada } : {}),
    });

    const mascotaGuardada = await nuevaMascota.save();

    return created(res, {
      success: true,
      message: 'Mascota registrada con éxito',
      mascota: mascotaGuardada,
    });
  } catch (error) {
    console.error('💥 Error en createMascota:', error);
    return serverError(res, error, 'Error al registrar mascota');
  }
};

/* ===================== LISTAR PUBLICADAS ===================== */
exports.getMascotas = async (_req, res) => {
  try {
    const mascotas = await Mascota.find({ publicada: true });
    return ok(res, mascotas);
  } catch (error) {
    return serverError(res, error, 'Error al obtener mascotas');
  }
};

/* ===================== OBTENER POR ID ===================== */
exports.getMascotaById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) {
      return badRequest(res, 'ID inválido');
    }
    const mascota = await Mascota.findById(id);
    if (!mascota) {
      return notFound(res, 'Mascota no encontrada');
    }
    return ok(res, mascota);
  } catch (error) {
    return serverError(res, error, 'Error al obtener la mascota');
  }
};

/* ===================== ACTUALIZAR ===================== */
exports.updateMascota = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) {
      return badRequest(res, 'ID inválido');
    }

    const updates = normalizeMascotaPayload(req.body);
    const imgs = extractImages(req);
    if (imgs.length > 0) updates.imagenes = imgs;

    const mascotaActualizada = await Mascota.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!mascotaActualizada) {
      return notFound(res, 'Mascota no encontrada');
    }

    return ok(res, {
      success: true,
      message: 'Mascota actualizada correctamente',
      mascota: mascotaActualizada,
    });
  } catch (error) {
    console.error('💥 Error en updateMascota:', error);
    return serverError(res, error, 'Error al actualizar la mascota');
  }
};

/* ===================== ELIMINAR ===================== */
exports.deleteMascota = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) {
      return badRequest(res, 'ID inválido');
    }

    const mascota = await Mascota.findByIdAndDelete(id);
    if (!mascota) {
      return notFound(res, 'Mascota no encontrada');
    }
    return ok(res, { success: true, message: 'Mascota eliminada correctamente' });
  } catch (error) {
    return serverError(res, error, 'Error al eliminar la mascota');
  }
};

/* ===================== FILTRO POR ORIGEN ===================== */
exports.getMascotasPorOrigen = async (req, res) => {
  try {
    let origen = req.params.origen;

    // ✅ S5147: sanitizar entrada controlada por usuario
    if (typeof origen !== 'string') {
      return badRequest(res, 'Formato de origen inválido');
    }

    origen = origen.toLowerCase().trim();
    if (!['fundacion', 'externo'].includes(origen)) {
      return badRequest(res, 'Origen no válido');
    }

    const mascotas = await Mascota.find({ origen, publicada: true });
    return ok(res, mascotas);
  } catch (error) {
    return serverError(res, error, 'Error al obtener mascotas por origen');
  }
};
