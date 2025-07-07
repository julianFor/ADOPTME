const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificacionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  leida: {
    type: Boolean,
    default: false
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  datosAdicionales: {
    type: Object, // ejemplo: { fechaEntrevista, enlaceMeet }
    default: {}
  }
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);
