// middlewares/multerCloudinaryDocs.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

const sanitizeBaseName = (name) =>
  (name || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_. ]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 120);

// Solo IMÁGENES permitidas para estos campos
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME = /^(image\/jpeg|image\/png|image\/webp)$/i;

const docsStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const ext  = path.extname(file.originalname || '').toLowerCase();
    const base = sanitizeBaseName(path.basename(file.originalname, ext));

    return {
      folder: 'adoptme',                 // guarda en la carpeta correcta
      resource_type: 'image',            // SIEMPRE imagen
      type: 'upload',
      access_mode: 'public',             // acceso público
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${Date.now()}-${base}` // sin extensión
    };
  }
});

// Filtro duro (bloquea PDFs y otros tipos)
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !ALLOWED_MIME.test(file.mimetype || '')) {
    return cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP en estos campos.'));
  }
  cb(null, true);
};

// Límite de 5 MB por imagen (ajústalo si quieres)
const uploadDocs = multer({
  storage: docsStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const mapDocs = (req, _res, next) => {
  const collect = (f) => {
    if (!f) return null;
    return {
      secure_url: f.secure_url || f.path,
      public_id: f.public_id || f.filename,
      resource_type: f.resource_type,
      format: f.format,
      bytes: f.bytes,
      original_filename: f.original_filename || f.originalname,
      type: f.type,
      version: f.version,
    };
  };

  const out = {};
  if (req.files?.documentoIdentidad?.[0]) {
    out.documentoIdentidad = collect(req.files.documentoIdentidad[0]);
  }
  if (req.files?.pruebaResidencia?.[0]) {
    out.pruebaResidencia = collect(req.files.pruebaResidencia[0]);
  }
  req.cloudinaryDocs = out;
  next();
};

const uploadAdopcionDocs = [
  uploadDocs.fields([
    { name: 'documentoIdentidad', maxCount: 1 },
    { name: 'pruebaResidencia',   maxCount: 1 },
  ]),
  mapDocs,
];

module.exports = { uploadAdopcionDocs };
