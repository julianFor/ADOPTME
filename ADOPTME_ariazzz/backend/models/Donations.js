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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Solución para evitar recompilación
const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
export default Donation;