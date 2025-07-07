const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Lista de tipos permitidos
const tiposPermitidos = [
  'solicitud-adopcion-creada',
  'solicitud-adopcion-aprobada',
  'solicitud-adopcion-rechazada',
  'firma-compromiso-habilitado',
  'proceso-entrega-confirmada',
  'nueva-solicitud-publicacion',
  'solicitud-publicacion-aprobada',
  'solicitud-publicacion-rechazada'
];

const NotificacionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: tiposPermitidos,
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
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);
