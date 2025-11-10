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

    const need = await Need.create({
      titulo,
      categoria,
      urgencia,
      descripcionBreve,
      objetivo: toNumber(objetivo, 1),
      recibido: toNumber(recibido, 0),
      fechaLimite: toNullable(fechaLimite),
      estado: estado || "activa",
      visible: toBool(visible, true),
      imagenPrincipal: {
        url: req.file.path, // secure_url
        publicId: req.file.filename, // public_id
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
    if (estado) filter.estado = estado;
    if (categoria) filter.categoria = categoria;
    if (urgencia) filter.urgencia = urgencia;
    if (q) filter.titulo = { $regex: q, $options: "i" };

    const lim = Number(limit) || 12;
    const pag = Number(page) || 1;
    const skip = (pag - 1) * lim;

    const [data, total] = await Promise.all([
      Need.find(filter)
        .select(cardProjection)
        .sort(sort)
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

    // Campos permitidos (se castea lo que venga)
    const body = req.body || {};
    const patch = {
      ...(body.titulo && { titulo: body.titulo }),
      ...(body.categoria && { categoria: body.categoria }),
      ...(body.urgencia && { urgencia: body.urgencia }),
      ...(body.descripcionBreve && { descripcionBreve: body.descripcionBreve }),
      ...(body.objetivo !== undefined && {
        objetivo: toNumber(body.objetivo, need.objetivo),
      }),
      ...(body.recibido !== undefined && {
        recibido: toNumber(body.recibido, need.recibido),
      }),
      ...(body.fechaLimite !== undefined && {
        fechaLimite: toNullable(body.fechaLimite),
      }),
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.visible !== undefined && {
        visible: toBool(body.visible, need.visible),
      }),
    };

    // ¿Llega nueva imagen? (req.file vía multer)
    if (req.file?.path && req.file?.filename) {
      const oldPublicId = need?.imagenPrincipal?.publicId;
      patch.imagenPrincipal = {
        url: req.file.path,
        publicId: req.file.filename,
      };

      // elimina asset anterior en Cloudinary (opcional pero recomendado)
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
    const { estado } = req.body; // "activa" | "pausada" | "cumplida" | "vencida"

    const need = await Need.findByIdAndUpdate(
      id,
      { estado },
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