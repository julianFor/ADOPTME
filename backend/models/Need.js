// models/Need.js
const mongoose = require("mongoose");

const ImagenSchema = new mongoose.Schema({
  publicId: { type: String },
  url: { type: String, required: true }
}, { _id: false });

const NeedSchema = new mongoose.Schema({
  // Tarjeta
  titulo: { type: String, required: true, trim: true },
  categoria: {
    type: String,
    enum: ["comida", "camas", "juguetes", "arena", "medicina", "higiene", "otro"],
    required: true
  },
  urgencia: { type: String, enum: ["alta", "media", "baja"], default: "media" },
  descripcionBreve: { type: String, required: true, trim: true },

  // Progreso (siempre en "unidades")
  objetivo: { type: Number, required: true, min: 1 },
  recibido: { type: Number, default: 0, min: 0 },

  // Publicación / estado
  fechaPublicacion: { type: Date, default: Date.now },
  fechaLimite: { type: Date, default: null },
  estado: { type: String, enum: ["activa", "pausada", "cumplida", "vencida"], default: "activa" },
  visible: { type: Boolean, default: true },

  // Media
  imagenPrincipal: { type: ImagenSchema, required: true },
  imagenes: [ImagenSchema],

  // Auditoría
  creadaPor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

// Helpers de estado
NeedSchema.methods.syncEstado = function () {
  if (this.recibido >= this.objetivo) {
    this.estado = "cumplida";
    return;
  }
  if (this.fechaLimite && this.estado === "activa") {
    const hoy = new Date();
    if (hoy > this.fechaLimite) this.estado = "vencida";
  }
};

NeedSchema.pre("save", function (next) {
  this.syncEstado();
  next();
});

NeedSchema.index({ estado: 1, categoria: 1, urgencia: 1, fechaPublicacion: -1 });

module.exports = mongoose.model("Need", NeedSchema);
