const Donation = require('../models/Donation');
const mongoose = require('mongoose');

// ✅ Crear donación
exports.crearDonacion = async (req, res) => {
  try {
    const donacion = new Donation(req.body);
    await donacion.save();
    res.status(201).json(donacion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Obtener donaciones por goalId (mitigación NoSQL injection)
exports.obtenerPorMeta = async (req, res) => {
  try {
    let { goalId } = req.params;

    // Forzar a string y validar ObjectId
    if (typeof goalId !== 'string') {
      return res.status(400).json({ message: 'goalId inválido' });
    }
    goalId = goalId.trim();
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'goalId no es un ObjectId válido' });
    }

    const goalObjectId = new mongoose.Types.ObjectId(goalId);
    const donaciones = await Donation.find({ goalId: goalObjectId });

    res.status(200).json(donaciones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Obtener total recaudado por goalId (mitigación NoSQL injection)
exports.totalRecaudado = async (req, res) => {
  try {
    let { goalId } = req.params;

    if (typeof goalId !== 'string') {
      return res.status(400).json({ message: 'goalId inválido' });
    }
    goalId = goalId.trim();
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'goalId no es un ObjectId válido' });
    }

    const goalObjectId = new mongoose.Types.ObjectId(goalId);
    const total = await Donation.aggregate([
      { $match: { goalId: goalObjectId } },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);

    res.json({ total: total[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
