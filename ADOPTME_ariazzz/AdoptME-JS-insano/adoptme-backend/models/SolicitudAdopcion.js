const mongoose = require('mongoose');

const SolicitudAdopcionSchema = new mongoose.Schema({
  mascota: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mascota',
    required: true
  },
  adoptante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Información Personal
  nombreCompleto: { type: String, required: true },
  cedula: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  direccion: { type: String, required: true },
  barrio: { type: String, required: true },
  ciudad: { type: String, required: true },
  telefono: { type: String, required: true },
  correo: { type: String, required: true },

  // Información del Hogar
  tipoVivienda: { type: String, enum: ['casa', 'apartamento', 'otro'], required: true },
  tenenciaVivienda: { type: String, enum: ['propia', 'arrendada'], required: true },
  acuerdoFamiliar: { type: String, enum: ['si', 'no'], required: true },
  hayNinos: { type: String, enum: ['si', 'no'], required: true },
  otrasMascotas: { type: String, enum: ['si', 'no'], required: true },
  alergias: { type: String, enum: ['si', 'no'], required: true },

  // Información sobre la Adopción
  motivoAdopcion: { type: String, required: true },
  lugarMascota: { type: String, enum: ['interior', 'exterior', 'mixto'], required: true },
  reaccionProblemas: { type: String, required: true },
  tiempoSola: { type: String, enum: ['menos de 4 horas', '4-8 horas', 'más de 8 horas'], required: true },
  responsable: { type: String, required: true },
  queHariasMudanza: { type: String, required: true },

  // Compromiso
  aceptaVisitaVirtual: { type: String, enum: ['si', 'no'], required: true },
  compromisoCuidados: { type: String, enum: ['si', 'no'], required: true },
  aceptaContrato: { type: String, enum: ['si', 'no'], required: true },

  // Documentos
  documentoIdentidad: { type: String }, // filename (PDF/JPG/PNG)
  pruebaResidencia: { type: String },

  // Estado de la solicitud
  estado: {
    type: String,
    enum: ['pendiente', 'rechazada', 'en proceso', 'finalizada'],
    default: 'pendiente'
  },

  // Seguimiento (opcional)
  comentarios: { type: String, default: '' }

}, {
  timestamps: true
});

module.exports = mongoose.model('SolicitudAdopcion', SolicitudAdopcionSchema);
