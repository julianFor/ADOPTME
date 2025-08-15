const express = require('express');
const router = express.Router();

const controller = require('../controllers/solicitudAdopcionController');
const uploadCloudinary = require('../middlewares/multerCloudinary'); 
const { uploadAdopcionDocs } = require('../middlewares/multerCloudinaryDocs'); 

const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

// Crear solicitud (adoptante)
router.post(
  '/',
  verifyToken,
  uploadAdopcionDocs,              
  controller.crearSolicitud
);

router.get(
  '/resumen-por-mascota',
  [verifyToken, checkRole('adminFundacion', 'admin')],
  controller.getMascotasConSolicitudes
);

router.get(
  '/',
  [verifyToken, checkRole('adminFundacion', 'admin')],
  controller.getAllSolicitudes
);

router.get(
  '/porMascota/:idMascota',
  [verifyToken, checkRole('adminFundacion', 'admin')],
  controller.obtenerSolicitudesPorMascota
);

router.get('/mias', verifyToken, controller.getMisSolicitudes);

router.get(
  '/:id',
  [verifyToken, checkRole('adminFundacion', 'admin', 'adoptante')],
  controller.getSolicitudById
);

router.put(
  '/:id/rechazar',
  [verifyToken, checkRole('adminFundacion', 'admin')],
  controller.rechazarSolicitud
);

module.exports = router;
