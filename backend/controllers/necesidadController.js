const Need = require("../models/Need");
const cloudinary = require("../config/cloudinary");

// Proyección tipo "tarjeta"
const cardProjection =
  "titulo categoria urgencia objetivo recibido fechaLimite estado fechaPublicacion imagenPrincipal visible";

// ───────── Validadores de seguridad ─────────
const VALID_ESTADOS = new Set(["activa", "pausada", "cumplida", "vencida"]);
const VALID_URGENCIAS = new Set(["baja", "media", "alta"]);
const VALID_CATEGORIAS = new Set(["alimentos", "medicina", "educacion", "infraestructura", "otro"]);
const VALID_SORTS = new Set(["titulo", "-titulo", "fechaPublicacion", "-fechaPublicacion", "urgencia", "-urgencia"]);

// ───────── helpers de casteo (multipart/form-data llega como string) ─────────
const toNumber = (v, def) =>
  v === undefined ? def : Number(v);

const toBool = (v, def) => {
  if (v === undefined) return def;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase().trim();
  return s === "true" || s === "1" || s === "on";
};

const toNullable = (v) => (v === "" || v === undefined ? null : v);

const validateEstado = (estado) => {
  const val = String(estado).toLowerCase().trim();
  return VALID_ESTADOS.has(val) ? val : "activa";
};

const validateUrgencia = (urgencia) => {
  if (!urgencia) return undefined;
  const val = String(urgencia).toLowerCase().trim();
  return VALID_URGENCIAS.has(val) ? val : undefined;
};

const validateCategoria = (categoria) => {
  if (!categoria) return undefined;
  const val = String(categoria).toLowerCase().trim();
  return VALID_CATEGORIAS.has(val) ? val : undefined;
};

const validateSort = (sort) => {
  return VALID_SORTS.has(sort) ? sort : "-fechaPublicacion";
};

const validateId = (id) => {
  const idStr = String(id).trim();
  return /^[0-9a-fA-F]{24}$/.test(idStr) ? idStr : null;
};

const sanitizeRegex = (str) => {
  if (!str || typeof str !== "string") return "";
  const trimmed = String(str).trim();
  // Escapar caracteres especiales de regex de forma segura
  const escapedChars = trimmed.split("").map((char) => {
    if (/[.*+?^${}()|[\]\\]/.test(char)) {
      return `\\${char}`;
    }
    return char;
  }).join("");
  return escapedChars;
};

// ───────── Helper para aplicar patch de entrada ─────────
const applyPatch = (body, need) => {
  const patch = {};

  if (body.titulo) {
    patch.titulo = String(body.titulo).trim();
  }

  const validCategoria = validateCategoria(body.categoria);
  if (validCategoria) {
    patch.categoria = validCategoria;
  }

  const validUrgencia = validateUrgencia(body.urgencia);
  if (validUrgencia) {
    patch.urgencia = validUrgencia;
  }

  if (body.descripcionBreve) {
    patch.descripcionBreve = String(body.descripcionBreve).trim();
  }

  if (body.objetivo !== undefined) {
    patch.objetivo = toNumber(body.objetivo, need.objetivo);
  }

  if (body.recibido !== undefined) {
    patch.recibido = toNumber(body.recibido, need.recibido);
  }

  if (body.fechaLimite !== undefined) {
    patch.fechaLimite = toNullable(body.fechaLimite);
  }

  if (body.estado !== undefined) {
    patch.estado = validateEstado(body.estado);
  }

  if (body.visible !== undefined) {
    patch.visible = toBool(body.visible, need.visible);
  }

  return patch;
};

// ───────── Helper para manejar imagen ─────────
const handleImageUpload = async (req, need) => {
  if (!req.file?.path || !req.file?.filename) {
    return null;
  }

  const oldPublicId = need?.imagenPrincipal?.publicId;
  const imageData = {
    url: String(req.file.path),
    publicId: String(req.file.filename),
  };

  // Elimina imagen anterior en Cloudinary si existe
  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId, {
        resource_type: "image",
      });
    } catch (e) {
      console.warn("No se pudo eliminar imagen anterior:", e?.message);
    }
  }

  return imageData;
};

// ───────── Helper para sincronizar estado ─────────
const syncNeedEstado = (need) => {
  if (typeof need.syncEstado === "function") {
    need.syncEstado();
  }
};

// ─────────────────────────────────────────────────────────────────────────────

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
    if (!req.file?.path || !req.file?.filename) {
      return res
        .status(400)
        .json({ ok: false, message: "Imagen principal requerida" });
    }

    // Validar y sanitizar entrada
    const validEstado = validateEstado(estado);
    const validCategoria = validateCategoria(categoria);
    const validUrgencia = validateUrgencia(urgencia);

    const need = await Need.create({
      titulo: String(titulo || "").trim(),
      categoria: validCategoria,
      urgencia: validUrgencia,
      descripcionBreve: String(descripcionBreve || "").trim(),
      objetivo: toNumber(objetivo, 1),
      recibido: toNumber(recibido, 0),
      fechaLimite: toNullable(fechaLimite),
      estado: validEstado,
      visible: toBool(visible, true),
      imagenPrincipal: {
        url: String(req.file.path),
        publicId: String(req.file.filename),
      },
      creadaPor: req.userId,
      fechaPublicacion: new Date(),
    });

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
    const {
      q,
      categoria,
      urgencia,
      estado = "activa",
      sort = "-fechaPublicacion",
      limit = 12,
      page = 1,
    } = req.query;

    const filter = { visible: true };
    
    // Validar estado
    const validEstado = validateEstado(estado);
    filter.estado = validEstado;
    
    // Validar categoría
    const validCategoria = validateCategoria(categoria);
    if (validCategoria) {
      filter.categoria = validCategoria;
    }
    
    // Validar urgencia
    const validUrgencia = validateUrgencia(urgencia);
    if (validUrgencia) {
      filter.urgencia = validUrgencia;
    }
    
    // Sanitizar búsqueda de texto - prevenir NoSQL injection
    if (q && typeof q === "string" && q.trim().length > 0) {
      const escapedQ = sanitizeRegex(q);
      filter.titulo = { $regex: escapedQ, $options: "i" };
    }

    const lim = Math.min(Math.max(Number(limit) || 12, 1), 100);
    const pag = Math.max(Number(page) || 1, 1);
    const skip = (pag - 1) * lim;

    const validSort = validateSort(sort);

    const [data, total] = await Promise.all([
      Need.find(filter)
        .select(cardProjection)
        .sort(validSort)
        .skip(skip)
        .limit(lim)
        .lean(),
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
    return res
      .status(500)
      .json({ ok: false, message: "Error al listar necesidades" });
  }
};

exports.obtenerPorId = async (req, res) => {
  try {
    // Validar ID antes de consulta
    const validId = validateId(req.params.id);
    if (!validId) {
      return res
        .status(400)
        .json({ ok: false, message: "ID inválido" });
    }

    const need = await Need.findById(validId);
    if (!need) {
      return res
        .status(404)
        .json({ ok: false, message: "Necesidad no encontrada" });
    }

    // si tienes este método en el modelo
    syncNeedEstado(need);
    await need.save();

    return res.json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 obtenerPorId:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al obtener necesidad" });
  }
};

exports.actualizar = async (req, res) => {
  try {
    // Validar ID antes de consulta - prevenir NoSQL injection
    const validId = validateId(req.params.id);
    if (!validId) {
      return res
        .status(400)
        .json({ ok: false, message: "ID inválido" });
    }

    const need = await Need.findById(validId);
    if (!need) {
      return res
        .status(404)
        .json({ ok: false, message: "Necesidad no encontrada" });
    }

    // Campos permitidos (se castea lo que venga)
    const body = req.body || {};
    const patch = applyPatch(body, need);

    const imageData = await handleImageUpload(req, need);
    if (imageData) {
      patch.imagenPrincipal = imageData;
    }

    const updated = await Need.findByIdAndUpdate(validId, patch, {
      new: true,
      runValidators: true,
    });

    syncNeedEstado(updated);
    await updated.save();

    return res.json({ ok: true, data: updated });
  } catch (err) {
    console.error("💥 actualizar:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al actualizar necesidad" });
  }
};