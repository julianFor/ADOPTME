const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('node:path'); // ✅ regla S7772

const sanitizeBaseName = (name) =>
  (name || '')
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')   // ✅ regla S7781
    .replaceAll(/[^a-zA-Z0-9-_. ]/g, '')  // ✅ regla S7781
    .replaceAll(/\s+/g, '_')               // ✅ regla S7781
    .slice(0, 120);

// ✅ ALLOWED_EXT convertido en Set
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME = /^(image\/jpeg|image\/png|image\/webp)$/i;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const ext  = path.extname(file.originalname || '').toLowerCase();
    const base = sanitizeBaseName(path.basename(file.originalname, ext));
    return {
      folder: 'adoptme/publicaciones',
      resource_type: 'image',
      type: 'upload',
      access_mode: 'public',
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${Date.now()}-${base}`
    };
  }
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  // ✅ uso de .has() en lugar de .includes()
  if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.test(file.mimetype || '')) {
    return cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const collect = (f) => f && ({
  secure_url: f.secure_url || f.path,
  public_id: f.public_id || f.filename,
  resource_type: f.resource_type,
  format: f.format,
  bytes: f.bytes,
  original_filename: f.original_filename || f.originalname,
  type: f.type,
  version: f.version,
});

const mapPublicacionDocs = (req, _res, next) => {
  const out = { documentoIdentidad: null, imagenes: [] };

  if (req.files?.documentoIdentidad?.[0]) {
    out.documentoIdentidad = collect(req.files.documentoIdentidad[0]);
  }

  const imgsA = Array.isArray(req.files?.imagenes) ? req.files.imagenes : [];
  const imgsB = Array.isArray(req.files?.['imagenes[]']) ? req.files['imagenes[]'] : [];
  out.imagenes = [...imgsA, ...imgsB].map(collect).filter(Boolean);

  req.cloudinaryPublicacion = out;
  next();
};

const uploadPublicacionDocs = [
  upload.fields([
    { name: 'documentoIdentidad', maxCount: 1 },
    { name: 'imagenes',           maxCount: 6 },
    { name: 'imagenes[]',         maxCount: 6 },
  ]),
  mapPublicacionDocs,
];

module.exports = { uploadPublicacionDocs };
