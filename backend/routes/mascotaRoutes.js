const express = require('express');
const router = express.Router();
const mascotaController = require('../controllers/mascotaController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

// 🔁 Reemplazamos el middleware antiguo por el de Cloudinary
const upload = require('../middlewares/multerCloudinary');

// Crear mascota (admin y adminFundacion)
// 🐾 Log para verificar que se pasa por aquí
router.post(
  '/',
  [
    (req, res, next) => {
      console.log('🚦 Paso por el middleware personalizado');
      next();
    },
    verifyToken,
    checkRole('admin', 'adminFundacion'),
    upload.array('imagenes', 5)
  ],
  mascotaController.createMascota
);

// Editar mascota (admin y adminFundacion)
router.put(
  '/:id',
  [
    verifyToken,
    checkRole('admin', 'adminFundacion'),
    upload.array('imagenes', 5) // Cloudinary también en actualización
  ],
  mascotaController.updateMascota
);

// Eliminar mascota (solo Admin)
router.delete('/:id', [verifyToken, checkRole('admin')], mascotaController.deleteMascota);

// Obtener mascotas por origen
router.get('/origen/:origen', mascotaController.getMascotasPorOrigen);

// Rutas públicas
router.get('/', mascotaController.getMascotas);
router.get('/:id', mascotaController.getMascotaById);

router.use((err, req, res, next) => {
  console.error('❌ Multer/Cloudinary error:', err);
  res.status(400).json({ success: false, message: err?.message || 'Error de subida' });
});

module.exports = router;
