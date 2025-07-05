const mongoose = require('mongoose');

const SolicitudPublicacionSchema = new mongoose.Schema({
  adoptante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentoIdentidad: {
    type: String,
    required: [true, 'El documento de identidad es requerido']
  },

  contacto: {
    nombre: {
      type: String,
      required: [true, 'El nombre de contacto es requerido']
    },
    cedula: {
      type: String,
      required: [true, 'La cédula es requerida']
    },
    correo: {
      type: String,
      required: [true, 'El correo es requerido'],
      match: [/.+\@.+\..+/, 'Por favor ingrese un correo válido']
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es requerido']
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es requerida']
    },
    barrio: {
      type: String,
      required: [true, 'El barrio es requerido']
    },
    direccion: String
  },

  mascota: {
    nombre: {
      type: String,
      required: [true, 'El nombre de la mascota es requerido']
    },
    especie: { 
      type: String, 
      enum: ['perro', 'gato', 'otro'],
      required: [true, 'La especie es requerida']
    },
    raza: {
      type: String,
      required: [true, 'La raza es requerida']
    },
    fechaNacimiento: Date,
    tamaño: { 
      type: String, 
      enum: ['pequeño', 'mediano', 'grande'],
      required: [true, 'El tamaño es requerido']
    },
    sexo: { 
      type: String, 
      enum: ['macho', 'hembra'],
      required: [true, 'El sexo es requerido']
    },
    estadoSalud: { 
      type: String, 
      enum: ['saludable', 'en tratamiento', 'otro'],
      required: [true, 'El estado de salud es requerido']
    },
    personalidad: {
      type: String,
      required: [true, 'La descripción de personalidad es requerida']
    },
    historia: String
  },

  imagenes: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length >= 3;
      },
      message: 'Debe proporcionar al menos 3 imágenes de la mascota'
    },
    required: [true, 'Las imágenes son requeridas']
  },

  condiciones: {
    aceptaVisita: {
      type: Boolean,
      default: false,
      required: true
    },
    aceptaVerificacion: {
      type: Boolean,
      default: false,
      required: true
    },
    tieneCondiciones: {
      type: Boolean,
      default: false
    }
  },

  confirmaciones: {
    esResponsable: {
      type: Boolean,
      default: false,
      required: true
    },
    noSolicitaPago: {
      type: Boolean,
      default: false,
      required: true
    },
    aceptaVerificacion: {
      type: Boolean,
      default: false,
      required: true
    }
  },

  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada'],
    default: 'pendiente'
  },

  observacionesAdmin: String,
  
  // Auditoría
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar consultas
SolicitudPublicacionSchema.index({ adoptante: 1 });
SolicitudPublicacionSchema.index({ estado: 1 });
SolicitudPublicacionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SolicitudPublicacion', SolicitudPublicacionSchema);