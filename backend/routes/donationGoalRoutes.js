const express = require('express');
const router = express.Router();
const controller = require('../controllers/donationGoalController');

// Crear meta
router.post('/', controller.crearMeta);

// Obtener todas las metas
router.get('/', controller.obtenerMetas);

// Obtener la meta activa más reciente
router.get('/actual', controller.obtenerMetaActual);

// Editar meta
router.put('/:id', controller.editarMeta);

// Eliminar meta
router.delete('/:id', controller.eliminarMeta);

module.exports = router;
