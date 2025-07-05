const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registro de usuario
router.post('/register', 
  express.json(),
  authController.register
);

// Login de usuario
router.post('/login', 
  express.json(),
  authController.login
);

module.exports = router;