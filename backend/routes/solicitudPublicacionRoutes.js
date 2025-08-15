const express = require('express');
const router = express.Router();

const controller = require('../controllers/solicitudPublicacionController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');
const { uploadPublicacionDocs } = require('../middlewares/multerCloudinaryPublicacion');

// ⚠️ Elimina el viejo import local:
// const upload = require('../middlewares/uploadDocs');

// Crear nueva solicitud (la realiza el adoptante)
router.post(
  '/',
  verifyToken,
  checkRole('adoptante', 'admin', 'adminFundacion'), // si quieres solo adoptante, déjalo en 'adoptante'
  ...uploadPublicacionDocs,                           // <<— IMPORTANTE: spread del array de middlewares
  controller.crearSolicitud
);

// Obtener todas las solicitudes (admin / adminFundacion)
router.get(
  '/',
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.getSolicitudes
);

// Mis publicaciones (mascotas creadas a partir de mis solicitudes aprobadas)
router.get('/mis-publicaciones', verifyToken, controller.getMisPublicaciones);

// Mis solicitudes de publicación
router.get('/mias', verifyToken, controller.getMisSolicitudes);

// Obtener una solicitud por ID
router.get(
  '/:id',
  verifyToken,
  checkRole('admin', 'adminFundacion', 'adoptante'),
  controller.getSolicitudById
);

// Aprobar y publicar (admin / adminFundacion)
router.patch(
  '/:id/aprobar',
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.aprobarYPublicar
);

// Rechazar solicitud (admin / adminFundacion)
router.patch(
  '/:id/rechazar',
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.rechazarSolicitud
);

module.exports = router;
