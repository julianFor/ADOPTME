const express = require("express");
const router = express.Router();
const controller = require("../controllers/donationController");
const { verifyToken } = require("../middlewares/authJwt");
const { checkRole } = require("../middlewares/role");

// Crear donación (solo usuarios autenticados, cualquier rol)
router.post("/", controller.crearDonacion);

// Obtener donaciones por meta (solo admin y adminFundacion)
router.get("/:goalId", controller.obtenerPorMeta);

// Total recaudado (solo admin y adminFundacion)
router.get("/total/:goalId", verifyToken, checkRole("admin", "adminFundacion"), controller.totalRecaudado);

module.exports = router;
