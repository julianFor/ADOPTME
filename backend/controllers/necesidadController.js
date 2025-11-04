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

// Rechaza strings con caracteres que suelen usarse para inyección de operadores
const isPlain = (s) => {
  if (typeof s !== "string") return false;
  return !s.includes("$") && !s.includes("{") && !s.includes("}") && !s.includes("[") && !s.includes("]");
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Conjuntos (mejor rendimiento que includes) – S7776
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
    } = req.body;

    // Imagen principal obligatoria (el middleware pone req.file)
    if (!(req.file?.path && req.file?.filename)) {
      return res.status(400).json({ ok: false, message: "Imagen principal requerida" });
    }

    const need = await Need.create({
      titulo,
      categoria,
      urgencia,
      descripcionBreve,
      objetivo: toNumber(objetivo, 1),
      recibido: toNumber(recibido, 0),
      fechaLimite: toNullable(fechaLimite),
      estado: allowedEstados.has( safeString(estado) ) ? safeString(estado) : "activa",
      visible: toBool(visible, true),
      imagenPrincipal: {
        url: req.file.path,          // secure_url
        publicId: req.file.filename, // public_id
      },
      creadaPor: req.userId,
      fechaPublicacion: new Date(),
    });

    return res.status(201).json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 crearNecesidad:", err);
    return res.status(500).json({ ok: false, message: "Error al crear necesidad" });
  }
};

exports.listarPublicas = async (req, res) => {
  try {
    // Saneamos query params para evitar NoSQL injection (S5147)
    const qRaw = safeString(req.query.q);
    const categoriaRaw = safeString(req.query.categoria);
    const urgenciaRaw = safeString(req.query.urgencia);
    const estadoRaw = safeString(req.query.estado);
    const sort = parseSort(req.query.sort);

    const lim = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;
    const pag = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const skip = (pag - 1) * lim;

    // Solo agregamos filtros simples (strings planos)
    const filter = { visible: true, estado: allowedEstados.has(estadoRaw) ? estadoRaw : "activa" };
    if (categoriaRaw && isPlain(categoriaRaw)) filter.categoria = categoriaRaw;
    if (urgenciaRaw && isPlain(urgenciaRaw)) filter.urgencia = urgenciaRaw;
    if (qRaw) filter.titulo = { $regex: qRaw, $options: "i" };

    const [data, total] = await Promise.all([
      Need.find(filter).select(cardProjection).sort(sort).skip(skip).limit(lim),
      Need.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      data,
      total,
      page: pag,
      pages: Math.ceil(total / lim),
    });
  } catch (err) {
    console.error("💥 listarPublicas:", err);
    return res.status(500).json({ ok: false, message: "Error al listar necesidades" });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }

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

// Extraemos construcción del patch para reducir complejidad (S3776)
function buildPatch(body, current) {
  const patch = {};
  if (body.titulo) patch.titulo = body.titulo;
  if (body.categoria) patch.categoria = body.categoria;
  if (body.urgencia) patch.urgencia = body.urgencia;
  if (body.descripcionBreve) patch.descripcionBreve = body.descripcionBreve;

  if (body.objetivo !== undefined) patch.objetivo = toNumber(body.objetivo, current.objetivo);
  if (body.recibido !== undefined) patch.recibido = toNumber(body.recibido, current.recibido);
  if (body.fechaLimite !== undefined) patch.fechaLimite = toNullable(body.fechaLimite);

  if (body.estado !== undefined) {
    const e = safeString(body.estado);
    if (allowedEstados.has(e)) patch.estado = e; // Set.has() – S7776
  }

  if (body.visible !== undefined) patch.visible = toBool(body.visible, current.visible);

  return patch;
}

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }

    const need = await Need.findById(id);
    if (!need) return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });

    const body = req.body || {};
    const patch = buildPatch(body, need);

    // ¿Llega nueva imagen? (req.file vía multer)
    if (req.file?.path && req.file?.filename) {
      const oldPublicId = need?.imagenPrincipal?.publicId;
      patch.imagenPrincipal = { url: req.file.path, publicId: req.file.filename };

      // eliminar asset anterior en Cloudinary (best effort)
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId, { resource_type: "image" });
        } catch (e) {
          console.warn("No se pudo eliminar imagen anterior:", e?.message);
        }
      }
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
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }

    const estado = safeString(req.body.estado);
    if (!allowedEstados.has(estado)) {
      return res.status(400).json({ ok: false, message: "Estado no válido" });
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
    if (!isValidObjectId(id)) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }

    const need = await Need.findById(id);
    if (!need) return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });

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
    return res.status(500).json({ ok: false, message: "Error al eliminar necesidad" });
  }
};
