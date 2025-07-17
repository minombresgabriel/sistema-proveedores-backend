const mongoose = require("mongoose");

const registroSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario", // Asegúrate de que tu modelo de usuarios se llama 'Usuario'
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Registro", registroSchema);
