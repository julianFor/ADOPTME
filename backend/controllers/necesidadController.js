// controllers/necesidadController.js
const Need = require("../models/Need");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");

// Proyección tipo “tarjeta”
const cardProjection =
  "titulo categoria urgencia objetivo recibido fechaLimite estado fechaPublicacion imagenPrincipal visible";

/* ───────── helpers de casteo y sanitización ───────── */
const toNumber = (v, def = undefined) => (v === undefined ? def : Number(v));

const toBool = (v, def = undefined) => {
  if (v === undefined) return def;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase().trim();
  return s === "true" || s === "1" || s === "on";
};

const toNullable = (v) => (v === "" || v === undefined ? null : v);

const safeString = (v) => {
  if (v === undefined || v === null) return "";
  return typeof v === "string" ? v.trim() : String(v).trim();
};

// Rechaza strings con caracteres que suelen usarse para inyección
const isPlain = (s) => {
  if (typeof s !== "string") return false;
  return !s.includes("$") && !s.includes("{") && !s.includes("}") && !s.includes("[") && !s.includes("]");
};

// Sanitiza texto y limita longitud
const sanitizeText = (v, maxLen = 200) => {
  const s = safeString(v);
  if (!s || !isPlain(s)) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
};

// Convierte a Date válida o null
const toDate = (v) => {
  const s = safeString(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Valida ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const allowedEstados = new Set(["activa", "pausada", "cumplida", "vencida"]);
const allowedSortFields = new Set(["fechaPublicacion", "urgencia", "objetivo", "recibido", "titulo"]);

const parseSort = (rawSort = "-fechaPublicacion") => {
  const s = safeString(rawSort);
  const desc = s.startsWith("-");
  const field = desc ? s.slice(1) : s;
  if (!allowedSortFields.has(field)) return "-fechaPublicacion";
  return (desc ? "-" : "") + field;
};

/* ─────────────────────────────────────────────────── */

exports.crearNecesidad = async (req, res) => {
  try {
    const { titulo, categoria, urgencia, descripcionBreve, objetivo, recibido, fechaLimite, estado, visible } = req.body;

    // ✅ Evitamos condición negada con else y simplificamos lectura
    if (!(req.file?.path && req.file?.filename)) {
      return res.status(400).json({ ok: false, message: "Imagen principal requerida" });
    }

    // Sanitización segura
    const sTitulo = sanitizeText(titulo, 140);
    const sCategoria = sanitizeText(categoria, 60);
    const sUrgencia = sanitizeText(urgencia, 30);
    const sDesc = sanitizeText(descripcionBreve, 600);

    if (!sTitulo) return res.status(400).json({ ok: false, message: "Título inválido" });
    if (!sCategoria) return res.status(400).json({ ok: false, message: "Categoría inválida" });
    if (!sUrgencia) return res.status(400).json({ ok: false, message: "Urgencia inválida" });

    const sEstado = safeString(estado);
    const estadoFinal = allowedEstados.has(sEstado) ? sEstado : "activa";

    const doc = {
      titulo: sTitulo,
      categoria: sCategoria,
      urgencia: sUrgencia,
      descripcionBreve: sDesc != null ? sDesc : undefined,
      objetivo: Number(toNumber(objetivo, 1)),
      recibido: Number(toNumber(recibido, 0)),
      fechaLimite: toDate(fechaLimite),
      estado: estadoFinal,
      visible: Boolean(toBool(visible, true)),
      imagenPrincipal: {
        url: req.file.path,
        publicId: req.file.filename,
      },
      creadaPor: String(req.userId),
      fechaPublicacion: new Date(),
    };

    const need = await Need.create(doc);
    return res.status(201).json({ ok: true, data: need });

  } catch (err) {
    console.error("💥 crearNecesidad:", err);
    return res.status(500).json({ ok: false, message: "Error al crear necesidad" });
  }
};

exports.listarPublicas = async (req, res) => {
  try {
    const qRaw = safeString(req.query.q?.toString());
    const categoriaRaw = safeString(req.query.categoria?.toString());
    const urgenciaRaw = safeString(req.query.urgencia?.toString());
    const estadoRaw = safeString(req.query.estado?.toString());
    const sort = parseSort(req.query.sort?.toString());

    const lim = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;
    const pag = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const skip = (pag - 1) * lim;

    const filter = { visible: true, estado: allowedEstados.has(estadoRaw) ? estadoRaw : "activa" };

    if (categoriaRaw) {
      const safeCat = sanitizeText(categoriaRaw, 60);
      if (safeCat) filter.categoria = safeCat;
    }

    if (urgenciaRaw) {
      const safeUrg = sanitizeText(urgenciaRaw, 30);
      if (safeUrg) filter.urgencia = safeUrg;
    }

    if (qRaw) {
      const safeQ = sanitizeText(qRaw, 100);
      if (safeQ) filter.titulo = { $regex: safeQ, $options: "i" };
    }

    const [data, total] = await Promise.all([
      Need.find(filter).select(cardProjection).sort(sort).skip(skip).limit(lim),
      Need.countDocuments(filter),
    ]);

    return res.json({ ok: true, data, total, page: pag, pages: Math.ceil(total / lim) });
  } catch (err) {
    console.error("💥 listarPublicas:", err);
    return res.status(500).json({ ok: false, message: "Error al listar necesidades" });
  }
};

// Refactor de complejidad cognitiva (S3776)
async function actualizarImagenSiExiste(need, req) {
  if (req.file?.path && req.file?.filename) {
    const oldPublicId = need?.imagenPrincipal?.publicId;
    need.imagenPrincipal = { url: req.file.path, publicId: req.file.filename };
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" });
      } catch (e) {
        console.warn("No se pudo eliminar imagen anterior:", e?.message);
      }
    }
  }
}

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ ok: false, message: "ID inválido" });

    const need = await Need.findById(id);
    if (!need) return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });

    const body = req.body || {};
    const patch = buildPatch(body, need);
    await actualizarImagenSiExiste(need, req);

    Object.assign(need, patch);
    if (typeof need.syncEstado === "function") need.syncEstado();

    await need.save();
    return res.json({ ok: true, data: need });

  } catch (err) {
    console.error("💥 actualizar:", err);
    return res.status(500).json({ ok: false, message: "Error al actualizar necesidad" });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ ok: false, message: "ID inválido" });

    const need = await Need.findById(id);
    if (!need) return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });

    if (typeof need.syncEstado === "function") {
      need.syncEstado();
      await need.save();
    }
    return res.json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 obtenerPorId:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener necesidad" });
  }
};

exports.cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const estado = safeString(req.body.estado);
    if (!isValidObjectId(id) || !allowedEstados.has(estado)) {
      return res.status(400).json({ ok: false, message: "Parámetros inválidos" });
    }

    const need = await Need.findByIdAndUpdate(id, { estado }, { new: true });
    if (!need) return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });

    return res.json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 cambiarEstado:", err);
    return res.status(500).json({ ok: false, message: "Error al cambiar estado" });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ ok: false, message: "ID inválido" });

    const need = await Need.findById(id);
    if (!need) return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });

    const publicId = need?.imagenPrincipal?.publicId;
    if (publicId) {
      try { await cloudinary.uploader.destroy(publicId, { resource_type: "image" }); }
      catch (e) { console.warn("No se pudo eliminar imagen:", e?.message); }
    }

    await Need.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("💥 eliminar:", err);
    return res.status(500).json({ ok: false, message: "Error al eliminar necesidad" });
  }
};

// auxiliar para patch
function buildPatch(body, current) {
  const patch = {};
  if (body.titulo) patch.titulo = sanitizeText(body.titulo, 140) || current.titulo;
  if (body.categoria) patch.categoria = sanitizeText(body.categoria, 60) || current.categoria;
  if (body.urgencia) patch.urgencia = sanitizeText(body.urgencia, 30) || current.urgencia;
  if (body.descripcionBreve !== undefined) {
    const s = sanitizeText(body.descripcionBreve, 600);
    patch.descripcionBreve = s != null ? s : undefined;
  }
  if (body.objetivo !== undefined) patch.objetivo = Number(toNumber(body.objetivo, current.objetivo));
  if (body.recibido !== undefined) patch.recibido = Number(toNumber(body.recibido, current.recibido));
  if (body.fechaLimite !== undefined) patch.fechaLimite = toDate(body.fechaLimite);
  if (body.estado !== undefined) {
    const e = safeString(body.estado);
    if (allowedEstados.has(e)) patch.estado = e;
  }
  if (body.visible !== undefined) patch.visible = Boolean(toBool(body.visible, current.visible));
  return patch;
}