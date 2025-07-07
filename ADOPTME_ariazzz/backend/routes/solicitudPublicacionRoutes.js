const express = require('express');
const router = express.Router();
const controller = require('../controllers/solicitudPublicacionController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');
const upload = require('../middlewares/uploadDocs');
const { getMisSolicitudes } = require('../controllers/solicitudPublicacionController');

// Crear nueva solicitud (adoptante)
router.post(
  '/',
  verifyToken,
  checkRole('admin','adminFundacion','adoptante'),
  upload.fields([
    { name: 'documentoIdentidad', maxCount: 1 },
    { name: 'imagenes', maxCount: 5 }
  ]),
  controller.crearSolicitud
);

// Obtener todas las solicitudes (admin)
router.get(
  '/',
  verifyToken,
  checkRole('admin','adminFundacion'),
  controller.getSolicitudes
);


router.get('/mis-publicaciones', verifyToken, controller.getMisPublicaciones);

//Obtener todas las solicitudes por Usuario
router.get('/mias', verifyToken, getMisSolicitudes);

// Obtener solicitud por ID (admin)
router.get(
  '/:id',
  verifyToken,
  checkRole('admin','adminFundacion'),
  controller.getSolicitudById
);



// Aprobar y publicar (admin)
router.patch(
  '/:id/aprobar',
  verifyToken,
  checkRole('admin','adminFundacion'),
  controller.aprobarYPublicar
);

// Rechazar solicitud (admin)
router.patch(
  '/:id/rechazar',
  verifyToken,
  checkRole('admin','adminFundacion'),
  controller.rechazarSolicitud
);



module.exports = router;
