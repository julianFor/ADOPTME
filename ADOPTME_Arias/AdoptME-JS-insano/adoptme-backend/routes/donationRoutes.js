const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");

// ✅ Ruta para guardar una donación con goalId
router.post("/", async (req, res) => {
  try {
    const { nombre, monto, tipo, descripcion, goalId } = req.body;

    if (!goalId) {
      return res.status(400).json({ success: false, message: "Falta el goalId (meta activa)" });
    }

    const nuevaDonacion = new Donation({
      nombre,
      monto,
      tipo,
      descripcion,
      goalId, // 👉 Guarda la meta asociada
    });

    await nuevaDonacion.save();
    res.status(201).json(nuevaDonacion);
  } catch (error) {
    console.error("❌ Error al guardar donación:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

// ✅ Ruta para obtener donaciones de una meta específica
router.get("/:goalId", async (req, res) => {
  try {
    const donaciones = await Donation.find({ goalId: req.params.goalId });
    res.json(donaciones);
  } catch (error) {
    console.error("❌ Error al obtener donaciones por goalId:", error);
    res.status(500).json({ success: false, message: "Error al obtener donaciones" });
  }
});

module.exports = router;
