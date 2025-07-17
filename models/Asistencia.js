const mongoose = require("mongoose");

const asistenciaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Asistencia", asistenciaSchema);
