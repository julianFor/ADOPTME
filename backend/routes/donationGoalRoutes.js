const express = require("express");
const router = express.Router();
const controller = require("../controllers/donationGoalController");
const { verifyToken } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/role");

// Crear nueva meta (solo admin y adminFundacion)
router.post("/", verifyToken, checkRole("admin", "adminFundacion"), controller.crearMeta);

// Obtener TODAS las metas 
router.get("/", controller.obtenerMetas);

// Obtener la meta actual (todos los roles autenticados pueden ver)
router.get("/actual", controller.obtenerMetaActual);

// Editar meta (solo admin y adminFundacion)
router.put("/:id", verifyToken, checkRole("admin", "adminFundacion"), controller.editarMeta);

// Eliminar meta (solo admin)
router.delete("/:id", verifyToken, checkRole("admin"), controller.eliminarMeta);

module.exports = router;
