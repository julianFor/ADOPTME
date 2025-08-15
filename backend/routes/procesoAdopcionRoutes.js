const express = require('express');
const router = express.Router();
const controller = require('../controllers/procesoAdopcionController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');
const { uploadCompromiso } = require('../middlewares/multerCloudinaryCompromiso');
// Crear un proceso de adopción (solo admin o adminFundación)
router.post(
  '/',
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.crearProceso
);

// Consultar Procesos de Adopcion del Adoptante
router.get('/mis-procesos', verifyToken, controller.getMisProcesos);

// Agendar entrevista virtual
router.patch(
  '/:id/entrevista',
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.agendarEntrevista
);

// Registrar visita presencial
router.patch(
  '/:id/visita',
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.registrarVisita
);

// Subir compromiso firmado (IMAGEN)
router.post(
  '/:id/compromiso',
  verifyToken,
  checkRole('admin','adminFundacion','adoptante'),
  uploadCompromiso,                     // 👈 nuevo middleware
  controller.subirCompromiso
);


// Registrar entrega de la mascota
router.patch(
  '/:id/entrega',
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.registrarEntrega
);

// Obtener todos los procesos (admin/adminFundacion)
router.get(
  '/',
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.getAllProcesos
);

// Obtener proceso por solicitud ID (visible para todos los roles con token)
router.get(
  '/solicitud/:solicitudId',
  verifyToken,
  controller.getProcesoPorSolicitud
);

// Aprobar etapa específica del proceso (admin/adminFundacion)
router.patch(
  '/:id/aprobar/:etapa', // ejemplo: /api/procesos/123/aprobar/visita
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.aprobarEtapa
);

// Rechazar etapa (finaliza proceso y rechaza solicitud)
router.patch(
  '/:id/rechazar/:etapa',
  verifyToken,
  checkRole('admin', 'adminFundacion'),
  controller.rechazarEtapa
);

router.get('/:id', verifyToken, checkRole('admin', 'adminFundacion', 'adoptante'), controller.getProcesoPorId);


module.exports = router;
