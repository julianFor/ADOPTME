const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/necesidadController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');
const uploadNecesidad = require('../middlewares/multerCloudinaryNecesidad'); 

// Público
router.get('/', ctrl.listarPublicas);
router.get('/:id', ctrl.obtenerPorId);

// Privado
router.post(
  '/',
  [verifyToken, checkRole('adminFundacion', 'admin'), uploadNecesidad.single('imagenPrincipal')],
  ctrl.crearNecesidad
);

router.patch(
  '/:id',
  [verifyToken, checkRole('adminFundacion', 'admin'), uploadNecesidad.single('imagenPrincipal')],
  ctrl.actualizar
);

router.patch(
  '/:id/estado',
  [verifyToken, checkRole('adminFundacion', 'admin')],
  ctrl.cambiarEstado
);

router.delete(
  '/:id',
  [verifyToken, checkRole('admin')],
  ctrl.eliminar
);

// Manejo de errores de multer/cloudinary
router.use((err, _req, res, _next) => {
  console.error('❌ Multer/Cloudinary error (necesidades):', err);
  res.status(400).json({ success: false, message: err?.message || 'Error de subida' });
});

module.exports = router;
