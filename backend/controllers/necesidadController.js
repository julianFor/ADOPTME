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

const toNullable = (v) => {
  if (v === "" || v === undefined || v === null) return null;
  return v;
};

const validateEstado = (estado) => {
  if (!estado) return "activa";
  const val = String(estado).toLowerCase().trim();
  return VALID_ESTADOS.has(val) ? val : "activa";
};

const validateUrgencia = (urgencia) => {
  if (!urgencia) return "baja";
  const val = String(urgencia).toLowerCase().trim();
  return VALID_URGENCIAS.has(val) ? val : "baja";
};

const validateCategoria = (categoria) => {
  if (!categoria) return "otro";
  const val = String(categoria).toLowerCase().trim();
  return VALID_CATEGORIAS.has(val) ? val : "otro";
};

const validateVisible = (visible) => {
  if (visible === undefined || visible === null) return true;
  return toBool(visible, true);
};

const validateSort = (sort) => {
  if (!sort) return "-fechaPublicacion";
  return VALID_SORTS.has(sort) ? sort : "-fechaPublicacion";
};

const validateId = (id) => {
  if (!id) return null;
  const idStr = String(id).trim();
  return /^[0-9a-fA-F]{24}$/.test(idStr) ? idStr : null;
};

const sanitizeRegex = (str) => {
  if (!str || typeof str !== "string") return "";
  const trimmed = String(str).trim();
  const escapedChars = trimmed.split("").map((char) => {
    if (/[.*+?^${}()|[\]\\]/.test(char)) {
      return `\\${char}`;
    }
    return char;
  }).join("");
  return escapedChars;
};

// ───────── Helper para validar entrada requerida ─────────
const validateRequiredFields = (titulo, descripcionBreve) => {
  const errors = [];
  
  if (!titulo || String(titulo).trim().length === 0) {
    errors.push("El título es requerido");
  }
  
  if (!descripcionBreve || String(descripcionBreve).trim().length === 0) {
    errors.push("La descripción breve es requerida");
  }

  return errors;
};

// ───────── Helper para aplicar patch de entrada ─────────
const applyPatch = (body, need) => {
  const patch = {};

  if (body.titulo) {
    patch.titulo = String(body.titulo).trim();
  }

  const validCategoria = validateCategoria(body.categoria);
  patch.categoria = validCategoria;

  const validUrgencia = validateUrgencia(body.urgencia);
  patch.urgencia = validUrgencia;

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
    patch.visible = validateVisible(body.visible);
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

    if (!req.file?.path || !req.file?.filename) {
      return res
        .status(400)
        .json({ ok: false, message: "Imagen principal requerida" });
    }

    // Validar campos requeridos
    const requiredErrors = validateRequiredFields(titulo, descripcionBreve);
    if (requiredErrors.length > 0) {
      return res
        .status(400)
        .json({ ok: false, message: requiredErrors.join(", ") });
    }

    // Validar y sanitizar TODA la entrada - NO usar datos del usuario directamente
    const validEstado = validateEstado(estado);
    const validCategoria = validateCategoria(categoria);
    const validUrgencia = validateUrgencia(urgencia);
    const validVisible = validateVisible(visible);
    const validFechaLimite = toNullable(fechaLimite);
    const validTitulo = String(titulo).trim();
    const validDescripcionBreve = String(descripcionBreve).trim();
    const validObjetivo = toNumber(objetivo, 1);
    const validRecibido = toNumber(recibido, 0);

    const need = await Need.create({
      titulo: validTitulo,
      categoria: validCategoria,
      urgencia: validUrgencia,
      descripcionBreve: validDescripcionBreve,
      objetivo: validObjetivo,
      recibido: validRecibido,
      fechaLimite: validFechaLimite,
      estado: validEstado,
      visible: validVisible,
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
    
    // Solo agregar filtro de estado si se especifica explícitamente
    if (estado) {
      const validEstado = validateEstado(estado);
      filter.estado = validEstado;
    }
    
    // Solo agregar filtro de categoría si se especifica explícitamente
    if (categoria) {
      const validCategoria = validateCategoria(categoria);
      filter.categoria = validCategoria;
    }
    
    // Solo agregar filtro de urgencia si se especifica explícitamente
    if (urgencia) {
      const validUrgencia = validateUrgencia(urgencia);
      filter.urgencia = validUrgencia;
    }
    
    // Sanitizar búsqueda de texto si se proporciona
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

    const body = req.body || {};
    const patch = applyPatch(body, need);

    const imageData = await handleImageUpload(req, need);
    if (imageData) {
      patch.imagenPrincipal = imageData;
    }

    Object.assign(need, patch);
    syncNeedEstado(need);
    await need.save();

    return res.json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 actualizar:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al actualizar necesidad" });
  }
};

exports.cambiarEstado = async (req, res) => {
  try {
    const validId = validateId(req.params.id);
    if (!validId) {
      return res
        .status(400)
        .json({ ok: false, message: "ID inválido" });
    }

    const { estado } = req.body;
    const validEstado = validateEstado(estado);

    const need = await Need.findById(validId);
    if (!need) {
      return res
        .status(404)
        .json({ ok: false, message: "Necesidad no encontrada" });
    }

    need.estado = validEstado;
    await need.save();

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

    const publicId = need?.imagenPrincipal?.publicId;
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (e) {
        console.warn("No se pudo eliminar imagen de Cloudinary:", e?.message);
      }
    }

    await Need.findByIdAndDelete(validId);
    return res.json({ ok: true });
  } catch (err) {
    console.error("💥 eliminar:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error al eliminar necesidad" });
  }
};