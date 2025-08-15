const mongoose = require('mongoose');

const ProcesoAdopcionSchema = new mongoose.Schema({
  solicitud: { type: mongoose.Schema.Types.ObjectId, ref: 'SolicitudAdopcion', required: true },

  entrevista: {
    fechaEntrevista: Date,
    enlaceMeet: String,
    observacionesEntrevista: String,
    aprobada: { type: Boolean, default: false }
  },

  visita: {
    fechaVisita: Date,
    horaVisita: String,
    responsable: String,
    observacionesVisita: String,
    asistio: Boolean,
    aprobada: { type: Boolean, default: false }
  },

  compromiso: {
    // antes: archivo: String
    archivo: mongoose.Schema.Types.Mixed,   // ← guardaremos el objeto de Cloudinary
    firmado: { type: Boolean, default: false },
    aprobada: { type: Boolean, default: false }
  },

  entrega: {
    fechaEntrega: Date,
    personaEntrega: String,
    observacionesEntrega: String,
    aprobada: { type: Boolean, default: false }
  },

  finalizado: { type: Boolean, default: false },
  etapaRechazada: { type: String },
  motivoRechazo: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('ProcesoAdopcion', ProcesoAdopcionSchema);
