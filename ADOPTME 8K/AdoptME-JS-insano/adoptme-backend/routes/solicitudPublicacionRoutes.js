const express = require('express');
const router = express.Router();
const controller = require('../controllers/solicitudPublicacionController');
const { verifyToken } = require('../middleware/authJwt');
const { checkRole } = require('../middleware/role');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'documento') {
      cb(null, 'uploads/documents/');
    } else if (file.fieldname === 'imagenes') {
      cb(null, 'uploads/pets/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes y PDFs
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Solo se permiten JPEG, PNG, JPG o PDF'), false);
  }
};

const uploadMiddleware = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: fileFilter
});

// Crear nueva solicitud (adoptante)
router.post(
  '/',
  verifyToken,
  checkRole('adoptante'),
  uploadMiddleware.fields([
    { name: 'documento', maxCount: 1 },
    { name: 'imagenes', maxCount: 5 }
  ]),
  controller.crearSolicitud
);

// Obtener todas las solicitudes (admin)
router.get(
  '/',
  verifyToken,
  checkRole('admin'),
  controller.getSolicitudes
);

// Obtener solicitudes del usuario actual
router.get(
  '/mias', 
  verifyToken, 
  controller.getMisSolicitudes
);

// Obtener solicitud por ID (admin)
router.get(
  '/:id',
  verifyToken,
  checkRole('admin'),
  controller.getSolicitudById
);

// Aprobar y publicar (admin)
router.patch(
  '/:id/aprobar',
  verifyToken,
  checkRole('admin'),
  controller.aprobarYPublicar
);

// Rechazar solicitud (admin)
router.patch(
  '/:id/rechazar',
  verifyToken,
  checkRole('admin'),
  controller.rechazarSolicitud
);

module.exports = router;