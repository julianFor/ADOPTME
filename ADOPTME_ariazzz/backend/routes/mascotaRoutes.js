const express = require('express');
const router = express.Router();
const mascotaController = require('../controllers/mascotaController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');
const upload = require('../middlewares/uploadFiles');

// Crear mascota (admin y adminFundacion)
router.post(
  '/',
  [verifyToken, checkRole('admin', 'adminFundacion'), upload.array('imagenes', 5)],
  mascotaController.createMascota
);

// Editar  mascota 
router.put('/:id', [verifyToken, checkRole('admin','adminFundacion')], upload.array('imagenes', 5), mascotaController.updateMascota);
// Eliminar  mascota (Solo Admin)
router.delete('/:id', [verifyToken, checkRole('admin')], mascotaController.deleteMascota);

// obtener mascotas por origen
router.get('/origen/:origen', mascotaController.getMascotasPorOrigen);

// Rutas públicas
router.get('/', mascotaController.getMascotas);
router.get('/:id', mascotaController.getMascotaById);

module.exports = router;
