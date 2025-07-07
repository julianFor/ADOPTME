const express = require('express');
const router = express.Router();
const controller = require('../controllers/solicitudAdopcionController');
const upload = require('../middleware/uploadDocs');
const { verifyToken } = require('../middleware/authJwt');
const { checkRole } = require('../middleware/role');

// Ruta: Crear solicitud (adoptante)
router.post('/', 
  verifyToken, 
  upload.fields([
    { name: 'documentoIdentidad', maxCount: 1 },
    { name: 'pruebaResidencia', maxCount: 1 }
  ]), 
  controller.crearSolicitud
);

// Resto de las rutas permanecen igual...
router.get('/', verifyToken, controller.getAllSolicitudes);
router.get('/porMascota/:idMascota', [verifyToken, checkRole('adminFundacion', 'admin')], controller.obtenerSolicitudesPorMascota);
router.get('/mias', verifyToken, controller.getMisSolicitudes);
router.get('/:id', verifyToken, controller.getSolicitudById);

module.exports = router;