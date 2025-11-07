// backend/src/middlewares/multerCloudinaryNecesidad.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('node:path'); // ✅ corregido: prefijo "node:"

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const base = path.basename(file.originalname, path.extname(file.originalname));
    return {
      folder: 'adoptme/necesidades',         // ⬅️ carpeta dedicada
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'image',                 // solo imágenes
      type: 'upload',
      public_id: `${Date.now()}-${base}`      // sin extensión duplicada
    };
  },
});

module.exports = multer({ storage });
