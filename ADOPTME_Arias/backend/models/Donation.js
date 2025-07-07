const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  monto: {
    type: Number,
    required: true,
    min: 1
  },
  tipo: {
    type: String,
    default: "dinero"
  },
  descripcion: {
    type: String,
    trim: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DonationGoal",
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", donationSchema);
