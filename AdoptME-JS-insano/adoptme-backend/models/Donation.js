const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  monto: {
    type: Number,
    required: [true, "El monto es obligatorio"],
    min: [1, "El monto mínimo es 1"]
  },
  tipo: {
    type: String,
    default: "dinero"
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: 500
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DonationGoal",
    required: [true, "La donación debe estar asociada a una meta"]
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", donationSchema);
