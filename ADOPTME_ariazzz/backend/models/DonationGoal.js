const mongoose = require('mongoose');

const donationGoalSchema = new mongoose.Schema({
  descripcion: {
    type: String,
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  moneda: {
    type: String,
    default: 'USD'
  },
  activa: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DonationGoal', donationGoalSchema);
