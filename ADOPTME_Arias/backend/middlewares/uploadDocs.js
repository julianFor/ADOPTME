const multer = require('multer');
const path = require('path');

// Almacenamiento para documentos (PDF, JPG, PNG)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // carpeta raíz común
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const uniqueName = `${timestamp}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Filtro que acepta solo imágenes Y PDFs
const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o imágenes (JPG, PNG)'));
  }
};

module.exports = multer({ storage, fileFilter });
