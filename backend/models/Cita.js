const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema(
  {
    paciente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: true,
    },
    medico_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medico',
      required: true,
    },
    fecha_hora: {
      type: Date,
      required: [true, 'La fecha y hora son obligatorias'],
    },
    motivo: {
      type: String,
      required: [true, 'El motivo de la cita es obligatorio'],
    },
    estado: {
      type: String,
      enum: ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada'],
      default: 'Pendiente',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cita', citaSchema);
