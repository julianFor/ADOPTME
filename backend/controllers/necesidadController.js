// controllers/necesidadController.js
const Need = require("../models/Need");
const cloudinary = require("../config/cloudinary");
const { sanitizeMongoId, sanitizeQueryParams, sanitizeUpdateData } = require("../utils/sanitize");

// Proyección tipo “tarjeta”
const cardProjection =
  "titulo categoria urgencia objetivo recibido fechaLimite estado fechaPublicacion imagenPrincipal visible";

// ───────── helpers de casteo (multipart/form-data llega como string) ─────────
const hasValue = (v) => v != null && v !== '';

const toNumber = (v, def) => {
  if (!hasValue(v)) return def;
  const num = Number(v);
  return Number.isNaN(num) ? def : num;
};

const toBool = (v, def) => {
  if (!hasValue(v)) return def;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return Boolean(v);
  const s = String(v).toLowerCase().trim();
  return s === "true" || s === "1" || s === "on";
};

const toNullable = (v) => (hasValue(v) ? v : null);

// ─────────────────────────────────────────────────────────────────────────────

exports.crearNecesidad = async (req, res) => {
  try {
    const sanitizedData = sanitizeUpdateData(req.body);

    // Imagen principal obligatoria (el middleware pone req.file)
    if (!req.file?.path || !req.file?.filename) {
      return res
        .status(400)
        .json({ ok: false, message: "Imagen principal requerida" });
    }

    // Validar y sanitizar datos antes de crear
    const needData = {
      titulo: sanitizedData.titulo,
      categoria: sanitizedData.categoria,
      urgencia: sanitizedData.urgencia,
      descripcionBreve: sanitizedData.descripcionBreve,
      objetivo: toNumber(sanitizedData.objetivo, 1),
      recibido: toNumber(sanitizedData.recibido, 0),
      fechaLimite: toNullable(sanitizedData.fechaLimite),
      estado: sanitizedData.estado || "activa",
      visible: toBool(sanitizedData.visible, true),
      imagenPrincipal: {
        url: String(req.file.path), // secure_url
        publicId: String(req.file.filename), // public_id
      },
      creadaPor: String(req.userId),
      fechaPublicacion: new Date(),
    };

    // Validar campos requeridos
    const camposRequeridos = ['titulo', 'categoria', 'urgencia'];
    const camposFaltantes = camposRequeridos.filter(campo => !needData[campo]);
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        ok: false,
        message: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
      });
    }

    const need = await Need.create(needData);

    return res.status(201).json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 crearNecesidad:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al crear necesidad" });
  }
};

exports.listarPublicas = async (req, res) => {
  try {
    const sanitizedParams = sanitizeQueryParams(req.query);
    
    // Construir filtro de manera segura con validación de tipos y valores permitidos
    const filter = { visible: true };
    
    // Lista de estados válidos
    const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida'];
    if (sanitizedParams.estado && estadosValidos.includes(sanitizedParams.estado)) {
      filter.estado = sanitizedParams.estado;
    }
    
    // Lista de categorías válidas (ajusta según tus categorías)
    const categoriasValidas = ['alimentos', 'medicinas', 'insumos', 'otros'];
    if (sanitizedParams.categoria && categoriasValidas.includes(sanitizedParams.categoria)) {
      filter.categoria = sanitizedParams.categoria;
    }
    
    // Lista de niveles de urgencia válidos
    const urgenciasValidas = ['alta', 'media', 'baja'];
    if (sanitizedParams.urgencia && urgenciasValidas.includes(sanitizedParams.urgencia)) {
      filter.urgencia = sanitizedParams.urgencia;
    }
    
    // Sanitización segura para búsqueda por título
    if (sanitizedParams.q && typeof sanitizedParams.q === 'string') {
      const searchTerm = sanitizedParams.q.replaceAll(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, '').trim();
      if (searchTerm) {
        filter.titulo = { $regex: new RegExp(searchTerm, 'i') };
      }
    }

    const page = Math.max(1, Number.parseInt(sanitizedParams.page) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(sanitizedParams.limit) || 10));
    const skip = (page - 1) * limit;
    const sortField = sanitizedParams.sort || '-fechaPublicacion';

    const [data, total] = await Promise.all([
      Need.find(filter)
        .select(cardProjection)
        .sort(sortField)
        .skip(skip)
        .limit(limit),
      Need.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      data,
      total,
      page: page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("💥 listarPublicas:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al listar necesidades" });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const id = sanitizeMongoId(req.params.id);
    if (!id) {
      return res.status(400).json({ ok: false, message: "ID no válido" });
    }

    const need = await Need.findById(id);
    if (!need)
      return res
        .status(404)
        .json({ ok: false, message: "Necesidad no encontrada" });

    // si tienes este método en el modelo
    if (typeof need.syncEstado === "function") {
      need.syncEstado();
      await need.save();
    }

    return res.json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 obtenerPorId:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al obtener necesidad" });
  }
};

// Función auxiliar para construir el patch
const buildPatchObject = (body, need) => {
  const patch = {};
  const fields = {
    titulo: (v) => v,
    categoria: (v) => v,
    urgencia: (v) => v,
    descripcionBreve: (v) => v,
    objetivo: (v) => toNumber(v, need.objetivo),
    recibido: (v) => toNumber(v, need.recibido),
    fechaLimite: (v) => toNullable(v),
    estado: (v) => v,
    visible: (v) => toBool(v, need.visible)
  };

  for (const [field, transform] of Object.entries(fields)) {
    if (hasValue(body[field])) {
      patch[field] = transform(body[field]);
    }
  }

  return patch;
};

// Función auxiliar para manejar la actualización de imagen
const updateImage = async (need, file) => {
  if (!file?.path || !file?.filename) return null;

  const oldPublicId = need?.imagenPrincipal?.publicId;
  const newImage = {
    url: file.path,
    publicId: file.filename,
  };

  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" });
    } catch (e) {
      console.warn("No se pudo eliminar imagen anterior:", e?.message);
    }
  }

  return newImage;
};

exports.actualizar = async (req, res) => {
  try {
    const id = sanitizeMongoId(req.params.id);
    if (!id) {
      return res.status(400).json({ ok: false, message: "ID no válido" });
    }
    
    const need = await Need.findById(id);
    
    if (!need) {
      return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });
    }

    const patch = buildPatchObject(req.body || {}, need);
    const newImage = await updateImage(need, req.file);
    
    if (newImage) {
      patch.imagenPrincipal = newImage;
    }

    Object.assign(need, patch);
    
    if (typeof need.syncEstado === "function") {
      need.syncEstado();
    }

    await need.save();
    return res.json({ ok: true, data: need });
    
  } catch (err) {
    console.error("💥 actualizar:", err);
    return res.status(500).json({ ok: false, message: "Error al actualizar necesidad" });
  }
};

exports.cambiarEstado = async (req, res) => {
  try {
    const id = sanitizeMongoId(req.params.id);
    if (!id) {
      return res.status(400).json({ ok: false, message: "ID no válido" });
    }

    const estadosValidos = ["activa", "pausada", "cumplida", "vencida"];
    const estado = sanitizeUpdateData(req.body).estado;
    
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, message: "Estado no válido" });
    }

    const need = await Need.findByIdAndUpdate(
      id,
      { estado },
      { new: true, runValidators: true }
    );

    if (!need)
      return res
        .status(404)
        .json({ ok: false, message: "Necesidad no encontrada" });

    return res.json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 cambiarEstado:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al cambiar estado" });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const id = sanitizeMongoId(req.params.id);
    if (!id) {
      return res.status(400).json({ ok: false, message: "ID no válido" });
    }

    const need = await Need.findById(id);
    if (!need)
      return res
        .status(404)
        .json({ ok: false, message: "Necesidad no encontrada" });

    // borra imagen en Cloudinary si existe
    const publicId = need?.imagenPrincipal?.publicId;
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (e) {
        console.warn("No se pudo eliminar imagen de Cloudinary:", e?.message);
      }
    }

    await Need.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("💥 eliminar:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al eliminar necesidad" });
  }
};