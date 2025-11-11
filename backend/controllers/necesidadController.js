// controllers/necesidadController.js

const Need = require("../models/Need");
const cloudinary = require("../config/cloudinary");
const mongoose = require('mongoose');

// ----------------- Proyección -----------------
const cardProjection =
  "titulo categoria urgencia objetivo recibido fechaLimite estado fechaPublicacion imagenPrincipal visible";

// ----------------- Whitelists / Constantes -----------------
const VALID_ESTADOS = new Set(["activa", "pausada", "cumplida", "vencida"]);
const VALID_URGENCIAS = new Set(["baja", "media", "alta"]);
const VALID_CATEGORIAS = new Set(["alimentos", "medicina", "educacion", "infraestructura", "otro"]);
const VALID_SORTS = new Set(["titulo", "-titulo", "fechaPublicacion", "-fechaPublicacion", "urgencia", "-urgencia"]);

// ----------------- Helpers de casteo / sanitización -----------------
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

// Validadores que devuelven valores por defecto si la entrada no es válida
const validateEstado = (v) => {
  if (!v) return "activa";
  const val = String(v).toLowerCase().trim();
  return VALID_ESTADOS.has(val) ? val : "activa";
};

const validateUrgencia = (v) => {
  if (!v) return "baja";
  const val = String(v).toLowerCase().trim();
  return VALID_URGENCIAS.has(val) ? val : "baja";
};

const validateCategoria = (v) => {
  if (!v) return "otro";
  const val = String(v).toLowerCase().trim();
  return VALID_CATEGORIAS.has(val) ? val : "otro";
};

const validateVisible = (v) => {
  if (v === undefined || v === null) return true;
  return toBool(v, true);
};

const validateSort = (v) => {
  if (!v) return "-fechaPublicacion";
  return VALID_SORTS.has(v) ? v : "-fechaPublicacion";
};

const validateId = (id) => {
  if (!id) return null;
  const idStr = String(id).trim();
  return /^[0-9a-fA-F]{24}$/.test(idStr) ? idStr : null;
};

// Escapa caracteres especiales para usar en RegExp (evita inyección via regex)
const sanitizeRegex = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\\$&`);
};

// ----------------- Validación de campos obligatorios -----------------
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

// ----------------- Imagen: subir / reemplazar -----------------
const handleImageUpload = async (req, need) => {
  if (!req.file?.path || !req.file?.filename) {
    return null;
  }

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

// ----------------- Sincronizar estado derivado -----------------
const syncNeedEstado = (need) => {
  if (!need) return;
  if (typeof need.syncEstado === "function") {
    try {
      need.syncEstado();
    } catch (e) {
      console.warn("syncEstado falló:", e?.message);
    }
  }
};

// ----------------- Construir objeto seguro para crear (evita S5147) -----------------
const buildSafeNeedData = (body, creadaPorId, imageData) => {
  // destructuramos pero no usamos directamente en la query
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
  } = body || {};

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

// ----------------- Aplicar patch seguro (para actualizar) -----------------
const applyPatch = (body, need) => {
  const patch = {};

  if (body.titulo !== undefined) {
    patch.titulo = String(body.titulo).trim();
  }

  if (body.categoria !== undefined) {
    patch.categoria = validateCategoria(body.categoria);
  }

  if (body.urgencia !== undefined) {
    patch.urgencia = validateUrgencia(body.urgencia);
  }

  if (body.descripcionBreve !== undefined) {
    patch.descripcionBreve = String(body.descripcionBreve).trim();
  }

  if (body.objetivo !== undefined) {
    patch.objetivo = toNumber(body.objetivo, need?.objetivo ?? 1);
  }

  if (body.recibido !== undefined) {
    patch.recibido = toNumber(body.recibido, need?.recibido ?? 0);
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

// ----------------- Controladores -----------------

// Crear necesidad (SAFE)
exports.crearNecesidad = async (req, res) => {
  try {
    // Imagen obligatoria
    if (!req.file?.path || !req.file?.filename) {
      return res.status(400).json({ ok: false, message: "Imagen principal requerida" });
    }

    // Validar campos requeridos
    const { titulo, descripcionBreve } = req.body || {};
    const requiredErrors = validateRequiredFields(titulo, descripcionBreve);
    if (requiredErrors.length > 0) {
      return res.status(400).json({ ok: false, message: requiredErrors.join(", ") });
    }

    // Validar userId (no usar directamente en query sin validar)
    if (!mongoose.isValidObjectId(req.userId)) {
      return res.status(400).json({ ok: false, message: "Usuario inválido" });
    }
  const creadaPorId = new mongoose.Types.ObjectId(String(req.userId));

    // Procesar imagen
    const imageData = await handleImageUpload(req, null);
    if (!imageData) {
      return res.status(400).json({ ok: false, message: "Imagen principal requerida" });
    }

    // Construir objeto seguro para evitar S5147 (no usar req.body directamente)
    const safeNeedData = buildSafeNeedData(req.body, creadaPorId, imageData);

    // Crear documento
    const need = await Need.create(safeNeedData);

    return res.status(201).json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 crearNecesidad:", err);
    return res.status(500).json({ ok: false, message: "Error al crear necesidad" });
  }
};

// Listar públicas con filtros seguros (SAFE)
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
    } = req.query || {};

    // Construir filtro de forma segura usando validadores/whitelist
    const filter = { visible: true };

    if (estado !== undefined && estado !== null) {
      filter.estado = validateEstado(estado);
    }

    if (categoria !== undefined && categoria !== null) {
      filter.categoria = validateCategoria(categoria);
    }

    if (urgencia !== undefined && urgencia !== null) {
      filter.urgencia = validateUrgencia(urgencia);
    }

    if (q && typeof q === "string" && q.trim().length > 0) {
      filter.titulo = { $regex: sanitizeRegex(q), $options: "i" };
    }

    // Paginado y orden seguro
    const lim = Math.min(Math.max(Number(limit) || 12, 1), 100);
    const pag = Math.max(Number(page) || 1, 1);
    const skip = (pag - 1) * lim;
    const validSort = validateSort(sort);

    const [data, total] = await Promise.all([
      Need.find(filter).select(cardProjection).sort(validSort).skip(skip).limit(lim).lean(),
      Need.countDocuments(filter),
    ]);

    return res.json({ ok: true, data, total, page: pag, pages: Math.ceil(total / lim) });
  } catch (err) {
    console.error("💥 listarPublicas:", err);
    return res.status(500).json({ ok: false, message: "Error al listar necesidades" });
  }
};

// Obtener por id (SAFE)
exports.obtenerPorId = async (req, res) => {
  try {
    const validId = validateId(req.params.id);
    if (!validId) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }

    const need = await Need.findById(validId);
    if (!need) {
      return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });
    }

    // Sincronizar estado derivado y persistir si cambió
    syncNeedEstado(need);
    try {
      await need.save();
    } catch (e) {
      // no bloquear por fallo en sincronización
      console.warn("No se pudo guardar syncEstado:", e?.message);
    }

    return res.json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 obtenerPorId:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener necesidad" });
  }
};

// Actualizar necesidad (SAFE)
exports.actualizar = async (req, res) => {
  try {
    const validId = validateId(req.params.id);
    if (!validId) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }

    const need = await Need.findById(validId);
    if (!need) {
      return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });
    }

    const body = req.body || {};
    // Construir patch usando applyPatch (validado)
    const patch = applyPatch(body, need);

    // Manejar imagen: si viene nueva, la subimos y añadimos al patch
    const imageData = await handleImageUpload(req, need);
    if (imageData) {
      patch.imagenPrincipal = imageData;
    }

    // Aplicar cambios de forma explícita
    Object.assign(need, patch);

    // Sincronizar estado derivado
    syncNeedEstado(need);

    await need.save();

    return res.json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 actualizar:", err);
    return res.status(500).json({ ok: false, message: "Error al actualizar necesidad" });
  }
};

// Cambiar estado (SAFE)
exports.cambiarEstado = async (req, res) => {
  try {
    const validId = validateId(req.params.id);
    if (!validId) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }

    const { estado } = req.body || {};
    const validEstado = validateEstado(estado);

    const need = await Need.findById(validId);
    if (!need) {
      return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });
    }

    need.estado = validEstado;
    await need.save();

    return res.json({ ok: true, data: need });
  } catch (err) {
    console.error("💥 cambiarEstado:", err);
    return res.status(500).json({ ok: false, message: "Error al cambiar estado" });
  }
};

// Eliminar necesidad (SAFE)
exports.eliminar = async (req, res) => {
  try {
    const validId = validateId(req.params.id);
    if (!validId) {
      return res.status(400).json({ ok: false, message: "ID inválido" });
    }

    const need = await Need.findById(validId);
    if (!need) {
      return res.status(404).json({ ok: false, message: "Necesidad no encontrada" });
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
    return res.status(500).json({ ok: false, message: "Error al eliminar necesidad" });
  }
};
