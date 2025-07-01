const mongoose = require('mongoose');

const MascotaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  especie: {
    type: String,
    required: true,
    enum: ['perro', 'gato', 'otro']
  },
  raza: {
    type: String,
    default: 'Sin especificar'
  },
  fechaNacimiento: {
    type: Date,
    required: true
  },
  sexo: {
    type: String,
    enum: ['macho', 'hembra'],
    required: true
  },
  tamano: {
    type: String,
    enum: ['pequeño', 'mediano', 'grande'],
    // required: true
  },
  descripcion: {
    type: String,
    maxlength: 500
  },
  estadoSalud: {
    type: String,
    enum: ['saludable', 'en tratamiento', 'otro'],
    default: 'saludable'
  },
  vacunas: {
    type: [String], // Lista de vacunas aplicadas
    default: []
  },
  esterilizado: {
    type: Boolean,
    default: false
  },
  imagenes: {
    type: [String], // URLs de las imágenes
    default: []
  },
  origen: {
    type: String,
    enum: ['fundacion', 'externo'],
    required: true
  },
  publicadaPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  },
  contactoExterno: {
  nombre: String,
  telefono: String,
  correo: String,
  ubicacion: String,
  observaciones: String
  },
  publicada: {
  type: Boolean,
  default: function () {
    return this.origen === 'fundacion'; // Fundaciones publican directamente, externos no
  }
  },
  

  disponible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mascota', MascotaSchema);
