const express = require('express');
const router = express.Router();
const controller = require('../controllers/donationController');

// Crear donación manual o desde PayPal (sin IPN aún)
router.post('/', controller.crearDonacion);

// Obtener donaciones de una meta
router.get('/:goalId', controller.obtenerPorMeta);

// Obtener total recaudado de una meta
router.get('/:goalId/total', controller.totalRecaudado);

module.exports = router;
