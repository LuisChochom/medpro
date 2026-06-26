const mongoose = require('mongoose');

const recetaDetalleSchema = new mongoose.Schema({
  medicamento_nombre: {
    type: String,
    required: true,
  },
  dosis: {
    type: String, // Ej: "500 mg"
    required: true,
  },
  frecuencia: {
    type: String, // Ej: "Cada 8 horas"
    required: true,
  },
  duracion: {
    type: String, // Ej: "7 días"
    required: true,
  },
  cantidad_entregar: {
    type: Number, // Unidades
    required: true,
  },
});

const recetaSchema = new mongoose.Schema(
  {
    consulta_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consulta',
      required: true,
      unique: true, // Una consulta solo puede tener una receta
    },
    codigo_receta: {
      type: String,
      unique: true,
      required: true,
    },
    instrucciones_generales: {
      type: String,
    },
    medicamentos: [recetaDetalleSchema], // Embebido para NoSQL
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Receta', recetaSchema);
