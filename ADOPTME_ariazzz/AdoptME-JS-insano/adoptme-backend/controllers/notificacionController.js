const Notificacion = require('../models/Notificacion');

// Crear una notificación
exports.crearNotificacion = async (req, res) => {
  try {
    const { destinatarios, mensaje, tipo, datosAdicionales } = req.body;

    if (!destinatarios || !Array.isArray(destinatarios)) {
      return res.status(400).json({ success: false, message: 'Debes enviar un arreglo de destinatarios' });
    }

    const nuevas = await Notificacion.insertMany(
      destinatarios.map(userId => ({
        user: userId,
        tipo,
        mensaje,
        datosAdicionales
      }))
    );

    res.status(201).json({ success: true, notificaciones: nuevas });
  } catch (error) {
    console.error('[crearNotificacion] Error:', error);
    res.status(500).json({ success: false, message: 'Error al crear notificaciones', error: error.message });
  }
};


// Obtener notificaciones del usuario autenticado
exports.getMisNotificaciones = async (req, res) => {
  try {
    const userId = req.userId;

    const notificaciones = await Notificacion.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notificaciones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener notificaciones', error: error.message });
  }
};

// Marcar una notificación como leída
exports.marcarComoLeida = async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id);

    if (!notificacion) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }

    if (notificacion.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'No autorizado para modificar esta notificación' });
    }

    notificacion.leida = true;
    await notificacion.save();

    res.status(200).json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al marcar como leída', error: error.message });
  }
};

// Contar notificaciones no leídas del usuario autenticado
exports.contarNoLeidas = async (req, res) => {
  try {
    const total = await Notificacion.countDocuments({
      user: req.userId,
      leida: false
    });

    res.status(200).json({ success: true, noLeidas: total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al contar notificaciones no leídas', error: error.message });
  }
};
