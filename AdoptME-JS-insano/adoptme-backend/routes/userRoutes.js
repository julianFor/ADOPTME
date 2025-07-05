const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// Obtener todos los usuarios (solo admin)
router.get('/', 
  authMiddleware,
  authorizeRoles('admin'),
  userController.getAllUsers
);

// Obtener un usuario
router.get('/:id', 
  authMiddleware,
  userController.getUser
);

// Actualizar usuario
router.put('/:id', 
  authMiddleware,
  userController.updateUser
);

module.exports = router;