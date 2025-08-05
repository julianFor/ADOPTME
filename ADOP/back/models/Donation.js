import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  photo: {  // 👈 Nuevo campo para la imagen
    type: String,
    default: '' // Opcional: puede ser null o tener un valor por defecto
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true }, // Para incluir campos virtuales al convertir a JSON
  toObject: { virtuals: true }
});

// Virtual para URL completa de la imagen
donationSchema.virtual('photoUrl').get(function() {
  return this.photo 
    ? `${process.env.BASE_URL}/uploads/${this.photo}`
    : null;
});


export default mongoose.model('Donation', donationSchema);