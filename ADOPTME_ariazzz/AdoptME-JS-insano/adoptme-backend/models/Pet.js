const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  species: {
    type: String,
    required: [true, 'La especie es obligatoria'],
    enum: ['Gato', 'Perro', 'Ave', 'Conejo', 'Otro'],
    default: 'Otro'
  },
  breed: {
    type: String,
    required: [true, 'La raza es obligatoria']
  },
  age: {
    type: Number,
    required: [true, 'La edad es obligatoria']
  },
  gender: {
    type: String,
    required: [true, 'El género es obligatorio'],
    enum: ['macho', 'hembra'],
    lowercase: true
  },
  size: {
    type: String,
    required: [true, 'El tamaño es obligatorio'],
    enum: ['pequeño', 'mediano', 'grande'],
    default: 'mediano',
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  location: {
    type: String,
    required: [true, 'La ubicación es obligatoria']
  },
  status: {
    type: String,
    enum: ['Disponible', 'Adoptado', 'En proceso'],
    default: 'Disponible'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photos: [{
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true,
  collection: 'pets'
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;