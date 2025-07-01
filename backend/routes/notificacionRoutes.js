const express = require('express');
const router = express.Router();

const {
  crearNotificacion,
  getMisNotificaciones,
  marcarComoLeida,
  contarNoLeidas
} = require('../controllers/notificacionController');

const { verifyToken } = require('../middlewares/authJwt');

// Todas las rutas requieren token
router.post('/', verifyToken, crearNotificacion);                         // Crear una o varias notificaciones
router.get('/mias', verifyToken, getMisNotificaciones);                  // Consultar notificaciones del usuario autenticado
router.patch('/:id/leida', verifyToken, marcarComoLeida);               // Marcar como leída
router.get('/pendientes/contador', verifyToken, contarNoLeidas);        // Obtener contador de no leídas

module.exports = router;
