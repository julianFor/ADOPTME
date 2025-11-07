// controllers/necesidadController.js
const Need = require("../models/Need");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");

// Proyección tipo “tarjeta”
const cardProjection =
  "titulo categoria urgencia objetivo recibido fechaLimite estado fechaPublicacion imagenPrincipal visible";

// ───────── helpers de casteo y sanitización ─────────
const toNumber = (v, def = undefined) => (v === undefined ? def : Number(v));

const toBool = (v, def = undefined) => {
  if (v === undefined) return def;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase().trim();
  return s === "true" || s === "1" || s === "on";
};

const safeString = (v) => {
  if (v === undefined || v === null) return "";
  return typeof v === "string" ? v.trim() : String(v).trim();
};

// Sanitización estricta para prevenir inyección NoSQL
const sanitizeTextStrict = (v, maxLen = 200) => {
  const s = safeString(v);
  // Solo permite letras, números, espacios y puntuación básica
  if (!/^[\w\s.,;:áéíóúÁÉÍÓÚñÑ()\-]*$/.test(s)) return null;
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

const allowedEstados = Object.freeze(new Set(["activa", "pausada", "cumplida", "vencida"]));
const allowedSortFields = Object.freeze(new Set(["fechaPublicacion", "urgencia", "objetivo", "recibido", "titulo"]));
const allowedCategories = Object.freeze(new Set([
  "alimentos", "medicamentos", "insumos", "equipamiento", "otros"
]));
const allowedUrgencias = Object.freeze(new Set([
  "alta", "media", "baja"
]));

const parseSort = (rawSort = "-fechaPublicacion") => {
  const s = safeString(rawSort);
  const desc = s.startsWith("-");
  const field = desc ? s.slice(1) : s;
  // Si el campo no está permitido, usar el valor por defecto
  if (!allowedSortFields.has(field)) return "-fechaPublicacion";
  // Construir el string de ordenamiento de manera segura
  return `${desc ? "-" : ""}${field}`;
};

// Escapa regex de manera segura (opcional)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ───────── Controladores ─────────

exports.crearNecesidad = async (req, res) => {
  try {
    const { titulo, categoria, urgencia, descripcionBreve, objetivo, recibido, fechaLimite, estado, visible } = req.body;

    if (!req.file?.path || !req.file?.filename) {
      return res.status(400).json({ ok: false, message: "Imagen principal requerida" });
    }

    const sTitulo = sanitizeTextStrict(titulo, 140);
    const sCategoria = sanitizeTextStrict(categoria, 60);
    const sUrgencia = sanitizeTextStrict(urgencia, 30);
    const sDesc = sanitizeTextStrict(descripcionBreve, 600);

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
      imagenPrincipal: { url: req.file.path, publicId: req.file.filename },
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
    // Sanitización y validación estricta de parámetros
    const qRaw = sanitizeTextStrict(req.query.q?.toString(), 100);
    const categoriaRaw = sanitizeTextStrict(req.query.categoria?.toString(), 50);
    const urgenciaRaw = sanitizeTextStrict(req.query.urgencia?.toString(), 30);
    const estadoRaw = safeString(req.query.estado?.toString());
    
    // Validación adicional de parámetros usando conjuntos predefinidos
    const categoria = allowedCategories.has(categoriaRaw) ? categoriaRaw : undefined;
    const urgencia = allowedUrgencias.has(urgenciaRaw) ? urgenciaRaw : undefined;
    const estado = allowedEstados.has(estadoRaw) ? estadoRaw : "activa";
    
    // Validación segura del parámetro de ordenamiento
    const sort = parseSort(req.query.sort?.toString());

    const lim = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;
    const pag = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const skip = (pag - 1) * lim;

        // Construcción segura del filtro usando solo valores validados
    const filter = { 
      visible: true, 
      estado
    };
    
    // Solo agregar filtros si los valores son válidos
    if (categoria) filter.categoria = categoria;
    if (urgencia) filter.urgencia = urgencia;
    if (qRaw) {
      // Escapar caracteres especiales de regex y usar un patrón seguro
      const safeQuery = escapeRegex(qRaw);
      // Usar un objeto de búsqueda más seguro con un patrón escapado
      filter.titulo = { $regex: `^${safeQuery}`, $options: "i" };
    }

    // Validar y aplicar límites seguros
    const safeLimit = Math.min(Math.max(1, lim), 50); // Limitar a máximo 50 resultados
    const safePage = Math.max(1, pag);
    const safeSkip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      Need.find(filter).select(cardProjection).sort(sort).skip(safeSkip).limit(safeLimit).lean(),
      Need.countDocuments(filter),
    ]);

    return res.json({ ok: true, data, total, page: pag, pages: Math.ceil(total / lim) });
  } catch (err) {
    console.error("💥 listarPublicas:", err);
    return res.status(500).json({ ok: false, message: "Error al listar necesidades" });
  }
};

// ───────── Helpers ─────────
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

// ───────── Resto de controladores ─────────
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ ok: false, message: "ID inválido" });

    const need = await Need.findById(id);
    if (!need) return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });

    const patch = buildPatch(req.body, need);
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

// ───────── Auxiliar para patch ─────────
function buildPatch(body, current) {
  const patch = {};
  if (body.titulo) patch.titulo = sanitizeTextStrict(body.titulo, 140) || current.titulo;
  if (body.categoria) patch.categoria = sanitizeTextStrict(body.categoria, 60) || current.categoria;
  if (body.urgencia) patch.urgencia = sanitizeTextStrict(body.urgencia, 30) || current.urgencia;
  if (body.descripcionBreve !== undefined) {
    const s = sanitizeTextStrict(body.descripcionBreve, 600);
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
