const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  username: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,
    trim: true,
    minlength: [3, 'Mínimo 3 caracteres'],
    maxlength: [20, 'Máximo 20 caracteres'],
    match: [/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'Mínimo 8 caracteres'],
    select: false,
    validate: {
      validator: (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v),
      message: 'Debe contener mayúscula, minúscula y número'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'adminFundacion', 'adoptante'],
    default: 'adoptante',
    required: true
  },
  contactNumber: {
    type: String,
    validate: {
      validator: (v) => validator.isMobilePhone(v, 'es-CO'),
      message: 'Número de contacto inválido'
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/tu_cloud/default_avatar.jpg'
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);