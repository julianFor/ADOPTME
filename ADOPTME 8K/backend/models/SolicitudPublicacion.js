const mongoose = require('mongoose');

const SolicitudPublicacionSchema = new mongoose.Schema({
  adoptante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentoIdentidad: String, // nombre del archivo subido

  contacto: {
    nombre: String,
    cedula: String,
    correo: String,
    telefono: String,
    ciudad: String,
    barrio: String,
    direccion: String
  },

  mascota: {
    nombre: String,
    especie: { type: String, enum: ['perro', 'gato', 'otro'] },
    raza: String,
    fechaNacimiento: Date, // se calcula desde la edad aproximada
    tamaño: { type: String, enum: ['pequeño', 'mediano', 'grande'] },
    sexo: { type: String, enum: ['macho', 'hembra'] },
    estadoSalud: { type: String, enum: ['saludable', 'en tratamiento', 'otro'] },
    personalidad: String,
    historia: String,
  },

  imagenes: [String], // nombres de archivo subidos
  condiciones: {
    aceptaVisita: Boolean,
    aceptaVerificacion: Boolean,
    tieneCondiciones: Boolean
  },

  confirmaciones: {
    esResponsable: Boolean,
    noSolicitaPago: Boolean,
    aceptaVerificacion: Boolean
  },

  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada'],
    default: 'pendiente'
  },

  observacionesAdmin: String // por si se desea dejar alguna nota al aprobar/rechazar

}, { timestamps: true });

module.exports = mongoose.model('SolicitudPublicacion', SolicitudPublicacionSchema);
