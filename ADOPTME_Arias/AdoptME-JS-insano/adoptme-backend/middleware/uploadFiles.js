// backend/middlewares/uploadFiles.js

const multer = require('multer');
const path = require('path');

// Configurar el almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guarda
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// Filtrar solo imágenes
const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (.jpg, .jpeg, .png, .webp)'), false);
  }
};

// Instancia de multer
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Máximo 5MB por archivo
});

module.exports = upload;
