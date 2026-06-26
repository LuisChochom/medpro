const mongoose = require('mongoose');

const consultaSchema = new mongoose.Schema(
  {
    cita_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cita',
      unique: true,
      sparse: true, // Permite valores null sin violar restricción unique
    },
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
    fecha_consulta: {
      type: Date,
      default: Date.now,
    },
    motivo_consulta: {
      type: String,
      required: true,
    },
    sintomas: {
      type: String,
      required: true,
    },
    signos_vitales: {
      presion_arterial: String,
      frecuencia_cardiaca: Number,
      temperatura: Number,
      peso_kg: Number,
    },
    diagnostico: {
      type: String,
      required: true,
    },
    notas_evolucion: {
      type: String,
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

module.exports = mongoose.model('Consulta', consultaSchema);
