const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');
const { getMiPerfil, actualizarMiPerfil } = require('../controllers/userController');
const { registrarse } = require('../controllers/userController');

// Middleware diagnóstico
router.use((req, res, next) => {
    console.log('\n=== RUTA USUARIOS ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

//Registro de Usuarios Nuevos (solo Adoptantes)
router.post('/register', registrarse); // Público

// Obtener todos los usuarios (admin y adminFundacion)
router.get('/',
    verifyToken,
    checkRole('admin'),
    userController.getAllUsers
);

// Crear usuario (solo admin)
router.post('/',
    verifyToken,
    checkRole('admin'),
    userController.createUser
);

//Consultar Perfil
router.get('/me', verifyToken, getMiPerfil);

//Editar Perfil
router.put('/me', verifyToken, actualizarMiPerfil);

// Ver usuario por ID 
router.get('/:id',
    verifyToken,
    checkRole('admin'),
    userController.getUserById
);

// Actualizar usuario (admin puede editar)
router.put('/:id',
    verifyToken,
    checkRole('admin'),
    userController.updateUser
);

// Eliminar usuario (solo admin)
router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    userController.deleteUser
);
// Consultar Usuarios por Rol
router.get('/por-rol/:rol', verifyToken, userController.getUsersByRole);

module.exports = router;
