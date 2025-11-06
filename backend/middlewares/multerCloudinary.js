// backend/src/middlewares/multerCloudinary.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('node:path'); // corregido: usa node: para módulo integrado

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const base = path.basename(file.originalname, path.extname(file.originalname)); // sin extensión
    return {
      folder: 'adoptme',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: 'auto',  // 👈 clave para que PDF/DOC vayan como raw automáticamente
      type: 'upload',         // 👈 público (evita 401 de assets autenticados)
      public_id: `${Date.now()}-${base}`, // 👈 sin extensión para no terminar en .pdf.pdf
      // format: ext  // (opcional) si lo pones, Cloudinary servirá con esa extensión
    };
  }
});

const uploadCloudinary = multer({ storage });
module.exports = uploadCloudinary;
