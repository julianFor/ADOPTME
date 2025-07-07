const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifySignUp = require('../middlewares/verifySignUp');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

// Diagnóstico
router.use((req, res, next) => {
    console.log('\n[AuthRoutes] Petición:', {
        method: req.method,
        path: req.path
    });
    next();
});

// Iniciar sesión
router.post('/signin', authController.signin);

// Crear usuario (admin y adminFundacion pueden registrar usuarios)
router.post('/signup',
    verifyToken,
    checkRole('admin', 'adminFundacion'),
    verifySignUp.checkduplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
    authController.signup
);
// Ruta pública temporal para crear el primer admin
router.post('/setup-admin', async (req, res) => {
  try {
    const User = require('../models/User');

    // Validar si ya hay admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un administrador registrado.'
      });
    }

    // Crear admin
    const newUser = new User({
      username: 'admin',
      email: 'admin@adoptme.com',
      password: 'Admin1234',
      role: 'admin'
    });

    await newUser.save();
    return res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente'
    });

  } catch (err) {
    console.error('[SetupAdmin] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al crear el administrador'
    });
  }
});

module.exports = router;
