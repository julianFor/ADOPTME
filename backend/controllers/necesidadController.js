// controllers/necesidadController.js
const Need = require("../models/Need");
const cloudinary = require("../config/cloudinary");

// Proyección tipo "tarjeta"
const cardProjection =
  "titulo categoria urgencia objetivo recibido fechaLimite estado fechaPublicacion imagenPrincipal visible";

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

// ───────── helpers de validación ─────────
const VALID_ESTADOS = new Set(["activa", "pausada", "cumplida", "vencida"]);
const VALID_URGENCIAS = new Set(["baja", "media", "alta"]);
const VALID_CATEGORIAS = new Set(["alimentos", "medicina", "educacion", "infraestructura", "otro"]);

const validateEstado = (estado) => {
  return VALID_ESTADOS.has(String(estado).toLowerCase()) ? String(estado).toLowerCase() : "activa";
};

const validateUrgencia = (urgencia) => {
  return VALID_URGENCIAS.has(String(urgencia).toLowerCase()) ? String(urgencia).toLowerCase() : undefined;
};

const validateCategoria = (categoria) => {
  return VALID_CATEGORIAS.has(String(categoria).toLowerCase()) ? String(categoria).toLowerCase() : undefined;
};

const validateSort = (sort) => {
  const allowed = new Set(["titulo", "-titulo", "fechaPublicacion", "-fechaPublicacion", "urgencia", "-urgencia"]);
  return allowed.has(sort) ? sort : "-fechaPublicacion";
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
      titulo: titulo?.trim(),
      categoria: validCategoria,
      urgencia: validUrgencia,
      descripcionBreve: descripcionBreve?.trim(),
      objetivo: toNumber(objetivo, 1),
      recibido: toNumber(recibido, 0),
      fechaLimite: toNullable(fechaLimite),
      estado: validEstado,
      visible: toBool(visible, true),
      imagenPrincipal: {
        url: req.file.path,
        publicId: req.file.filename,
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
    
    // Validar y usar solo valores permitidos
    const validEstado = validateEstado(estado);
    if (validEstado) filter.estado = validEstado;
    
    const validCategoria = validateCategoria(categoria);
    if (validCategoria) filter.categoria = validCategoria;
    
    const validUrgencia = validateUrgencia(urgencia);
    if (validUrgencia) filter.urgencia = validUrgencia;
    
    // Sanitizar búsqueda de texto
    if (q && typeof q === "string" && q.trim().length > 0) {
      const escapedQ = q.trim().replaceAll(/[\\^$.|?*+()[\]{}]/g, String.raw`\$&`);
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
        .limit(lim),
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
    const need = await Need.findById(req.params.id);
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

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;

    const need = await Need.findById(id);
    if (!need)
      return res
        .status(404)
        .json({ ok: false, message: "Necesidad no encontrada" });

    const body = req.body || {};
    const patch = {};

    if (body.titulo && typeof body.titulo === "string") {
      patch.titulo = body.titulo.trim();
    }
    if (validateCategoria(body.categoria)) {
      patch.categoria = validateCategoria(body.categoria);
    }
    if (validateUrgencia(body.urgencia)) {
      patch.urgencia = validateUrgencia(body.urgencia);
    }
    if (body.descripcionBreve && typeof body.descripcionBreve === "string") {
      patch.descripcionBreve = body.descripcionBreve.trim();
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

    if (req.file?.path && req.file?.filename) {
      const oldPublicId = need?.imagenPrincipal?.publicId;
      patch.imagenPrincipal = {
        url: req.file.path,
        publicId: req.file.filename,
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
    }

    Object.assign(need, patch);

    if (typeof need.syncEstado === "function") {
      need.syncEstado();
    }

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
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado permitido
    const validEstado = validateEstado(estado);

    const need = await Need.findByIdAndUpdate(
      id,
      { estado: validEstado },
      { new: true }
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
    const { id } = req.params;

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