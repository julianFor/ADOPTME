const express = require('express');
const router = express.Router();
const DonationGoal = require('../models/DonationGoal');

// Crear nueva meta
router.post('/', async (req, res) => {
  try {
    const nuevaMeta = new DonationGoal(req.body);
    const metaGuardada = await nuevaMeta.save();
    res.status(201).json(metaGuardada);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Obtener todas las metas (ordenadas)
router.get('/', async (req, res) => {
  try {
    const metas = await DonationGoal.find().sort({ createdAt: -1 });
    res.json(metas); // devuelve todas las metas
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Ruta adicional: Obtener solo la meta actual más reciente
router.get('/actual', async (req, res) => {
  try {
    const meta = await DonationGoal.findOne().sort({ createdAt: -1 });

    if (!meta) {
      return res.status(404).json({ message: 'No hay metas activas' });
    }

    // Devolver solo el número
    res.json(meta); // devuelve { _id, monto, descripcion, ... }

  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la meta actual' });
  }
});

// Actualizar meta
router.put('/:id', async (req, res) => {
  try {
    const metaActualizada = await DonationGoal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!metaActualizada) {
      return res.status(404).json({ success: false, message: 'Meta no encontrada' });
    }

    res.json(metaActualizada);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Eliminar meta
router.delete('/:id', async (req, res) => {
  try {
    const metaEliminada = await DonationGoal.findByIdAndDelete(req.params.id);
    if (!metaEliminada) {
      return res.status(404).json({ success: false, message: 'Meta no encontrada' });
    }

    res.json({ success: true, message: 'Meta eliminada' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
