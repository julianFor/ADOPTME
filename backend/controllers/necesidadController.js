const Need = require("../models/Need");
const cloudinary = require("../config/cloudinary");
const mongoose = require('mongoose');

// --- Constantes y validadores ---
const VALID_ESTADOS = new Set(["activa", "pausada", "cumplida", "vencida"]);
const VALID_URGENCIAS = new Set(["baja", "media", "alta"]);
const VALID_CATEGORIAS = new Set(["alimentos", "medicina", "educacion", "infraestructura", "otro"]);
const VALID_SORTS = new Set(["titulo", "-titulo", "fechaPublicacion", "-fechaPublicacion", "urgencia", "-urgencia"]);

const cardProjection =
  "titulo categoria urgencia objetivo recibido fechaLimite estado fechaPublicacion imagenPrincipal visible";

// --- Helpers seguros ---
const toNumber = (v, def) => {
  if (v === undefined || v === null) return def;
  const num = Number(v);
  return Number.isNaN(num) ? def : num;
};
const toBool = (v, def) => {
  if (v === undefined || v === null) return def;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase().trim();
  return s === "true" || s === "1" || s === "on";
};
const toNullable = (v) => (v === "" || v === undefined || v === null ? null : v);

const validateId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id).trim()) ? String(id).trim() : null;
const validateEstado = (v) => (VALID_ESTADOS.has(String(v).toLowerCase().trim()) ? String(v).toLowerCase().trim() : "activa");
const validateUrgencia = (v) => (VALID_URGENCIAS.has(String(v).toLowerCase().trim()) ? String(v).toLowerCase().trim() : "baja");
const validateCategoria = (v) => (VALID_CATEGORIAS.has(String(v).toLowerCase().trim()) ? String(v).toLowerCase().trim() : "otro");
const validateVisible = (v) => toBool(v, true);
const validateSort = (v) => (VALID_SORTS.has(v) ? v : "-fechaPublicacion");

const sanitizeRegex = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// --- Validador de campos requeridos ---
const validateRequiredFields = (titulo, descripcionBreve) => {
  const errors = [];
  if (!titulo || String(titulo).trim().length === 0) errors.push("El título es requerido");
  if (!descripcionBreve || String(descripcionBreve).trim().length === 0) errors.push("La descripción breve es requerida");
  return errors;
};

// --- Helper para subir imagen ---
const handleImageUpload = async (req, need) => {
  if (!req.file?.path || !req.file?.filename) return null;
  const imageData = {
    url: String(req.file.path),
    publicId: String(req.file.filename),
  };
  const oldPublicId = need?.imagenPrincipal?.publicId;
  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" });
    } catch (e) {
      console.warn("No se pudo eliminar imagen anterior:", e?.message);
    }
  }
  return imageData;
};

// --- Construir objeto validado (para evitar S5147) ---
const buildSafeNeedData = (body, creadaPorId, imageData) => {
  const {
    titulo,
    categoria,
    urgencia,
    descripcionBreve,
    objetivo,
    recibido,
    fechaLimite,
    estado,
    visible,
  } = body;

  return {
    titulo: String(titulo).trim(),
    categoria: validateCategoria(categoria),
    urgencia: validateUrgencia(urgencia),
    descripcionBreve: String(descripcionBreve).trim(),
    objetivo: toNumber(objetivo, 1),
    recibido: toNumber(recibido, 0),
    fechaLimite: toNullable(fechaLimite),
    estado: validateEstado(estado),
    visible: validateVisible(visible),
    imagenPrincipal: imageData,
    creadaPor: creadaPorId,
    fechaPublicacion: new Date(),
  };
};

// --- Controladores seguros ---
exports.crearNecesidad = async (req, res) => {
  try {
    if (!req.file?.path || !req.file?.filename) {
      return res.status(400).json({ ok: false, message: "Imagen principal requerida" });
    }

    const { titulo, descripcionBreve } = req.body;
    const errors = validateRequiredFields(titulo, descripcionBreve);
    if (errors.length > 0) return res.status(400).json({ ok: false, message: errors.join(", ") });

    if (!mongoose.isValidObjectId(req.userId)) {
      return res.status(400).json({ ok: false, message: "Usuario inválido" });
    }

    const creadaPorId = new mongoose.Types.ObjectId(req.userId);
    const imageData = await handleImageUpload(req, null);
    if (!imageData) return res.status(400).json({ ok: false, message: "Imagen principal requerida" });

    // 🛡️ NoSQL injection proof: el objeto viene de función segura
    const safeNeedData = buildSafeNeedData(req.body, creadaPorId, imageData);

    const need = await Need.create(safeNeedData);
    return res.status(201).json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 crearNecesidad:", err);
    return res.status(500).json({ ok: false, message: "Error al crear necesidad" });
  }
};

exports.listarPublicas = async (req, res) => {
  try {
    const raw = req.query;
    const filter = { visible: true };

    if (raw.estado) filter.estado = validateEstado(raw.estado);
    if (raw.categoria) filter.categoria = validateCategoria(raw.categoria);
    if (raw.urgencia) filter.urgencia = validateUrgencia(raw.urgencia);
    if (raw.q && typeof raw.q === "string" && raw.q.trim().length > 0) {
      filter.titulo = { $regex: sanitizeRegex(raw.q), $options: "i" };
    }

    const limit = Math.min(Math.max(toNumber(raw.limit, 12), 1), 100);
    const page = Math.max(toNumber(raw.page, 1), 1);
    const skip = (page - 1) * limit;
    const sort = validateSort(raw.sort);

    const [data, total] = await Promise.all([
      Need.find(filter).select(cardProjection).sort(sort).skip(skip).limit(limit).lean(),
      Need.countDocuments(filter),
    ]);

    return res.json({ ok: true, data, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("💥 listarPublicas:", err);
    return res.status(500).json({ ok: false, message: "Error al listar necesidades" });
  }
};
