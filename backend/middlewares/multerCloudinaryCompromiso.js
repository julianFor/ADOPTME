// middlewares/multerCloudinaryCompromiso.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_EXT  = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME = /^(image\/jpeg|image\/png|image\/webp)$/i;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Asegurar que tenemos un ID de proceso válido
    const procesoId = req.params?.id || req.body?.procesoId;
    if (!procesoId) {
      // Opcional: puedes lanzar un error explícito si lo prefieres
      // throw new Error('Falta el id del proceso para guardar el compromiso');
      console.warn('[multerCloudinaryCompromiso] Falta req.params.id: usando _sin_id');
    }

    // ID único por archivo para evitar sobrescrituras
    const uniqueId = `${Date.now()}-${uuidv4()}`;

    return {
      folder: `adoptme/compromisos/${procesoId || '_sin_id'}`, // 1 carpeta por proceso
      resource_type: 'image',
      type: 'upload',
      access_mode: 'public',
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],

      // Claves para NO sobrescribir
      overwrite: false,
      use_filename: false,
      unique_filename: true,

      // ya no usar un nombre fijo
      public_id: uniqueId,
      format: 'png',
    };
  }
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !ALLOWED_MIME.test(file.mimetype || '')) {
    return cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }
});

// Normaliza lo que guardaremos en BD
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

const mapCompromiso = (req, _res, next) => {
  req.cloudinaryCompromiso = collect(req.file);
  next();
};

const uploadCompromiso = [ upload.single('compromiso'), mapCompromiso ];
module.exports = { uploadCompromiso };
