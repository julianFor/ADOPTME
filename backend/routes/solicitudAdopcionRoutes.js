const express = require('express');
const router = express.Router();
const controller = require('../controllers/solicitudAdopcionController');
const upload = require('../middlewares/uploadDocs');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

// Ruta: Crear solicitud (adoptante)
router.post('/', verifyToken, upload.fields([
  { name: 'documentoIdentidad', maxCount: 1 },
  { name: 'pruebaResidencia', maxCount: 1 }
]), controller.crearSolicitud);

router.get('/resumen-por-mascota', [verifyToken, checkRole('adminFundacion', 'admin')], controller.getMascotasConSolicitudes);
// Ruta: Obtener todas las solicitudes (admin y adminFundacion)
router.get('/', [verifyToken, checkRole('adminFundacion', 'admin')], controller.getAllSolicitudes);

// Ruta: Agrupar solicitudes por mascota (solo admin o adminFundacion)
router.get('/porMascota/:idMascota', [verifyToken, checkRole('adminFundacion', 'admin')], controller.obtenerSolicitudesPorMascota);

// Ruta: Ver mis solicitudes (adoptante)
router.get('/mias', verifyToken, controller.getMisSolicitudes);

// Ruta: Obtener solicitud por ID (según permisos)
router.get('/:id', [verifyToken, checkRole('adminFundacion', 'admin')], controller.getSolicitudById);

router.put('/:id/rechazar',  [verifyToken, checkRole('adminFundacion', 'admin')], controller.rechazarSolicitud);


module.exports = router;
