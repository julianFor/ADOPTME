const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const authMiddleware = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Rutas para mascotas
router.get('/', petController.getAllPets);
router.get('/:id', petController.getPet);

// Ruta para crear mascota con subida de fotos
router.post(
  '/',
  authMiddleware,
  uploadMiddleware.array('photos', 5), // Permite hasta 5 fotos
  petController.createPet
);

router.put(
  '/:id', 
  authMiddleware,
  uploadMiddleware.array('photos', 5), // Permite agregar hasta 5 fotos nuevas
  petController.updatePet
);

router.delete('/:id', authMiddleware, petController.deletePet);

module.exports = router;