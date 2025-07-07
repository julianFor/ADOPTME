const DonationGoal = require('../models/DonationGoal');

// ✅ Crear nueva meta
exports.crearMeta = async (req, res) => {
  try {
    const nuevaMeta = new DonationGoal(req.body);
    const metaGuardada = await nuevaMeta.save();
    res.status(201).json(metaGuardada);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Obtener todas las metas
exports.obtenerMetas = async (req, res) => {
  try {
    const metas = await DonationGoal.find().sort({ createdAt: -1 });
    res.json(metas);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Obtener la meta activa más reciente
exports.obtenerMetaActual = async (req, res) => {
  try {
    const meta = await DonationGoal.findOne({ activa: true }).sort({ createdAt: -1 });
    if (!meta) return res.status(404).json({ message: 'No hay metas activas' });
    res.json(meta);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la meta actual' });
  }
};

// ✅ Editar una meta
exports.editarMeta = async (req, res) => {
  try {
    const meta = await DonationGoal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!meta) return res.status(404).json({ message: 'Meta no encontrada' });
    res.json(meta);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Eliminar una meta
exports.eliminarMeta = async (req, res) => {
  try {
    const eliminada = await DonationGoal.findByIdAndDelete(req.params.id);
    if (!eliminada) return res.status(404).json({ message: 'Meta no encontrada' });
    res.json({ message: 'Meta eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
