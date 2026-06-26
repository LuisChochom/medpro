const mongoose = require('mongoose');

const medicoSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    colegiado_numero: {
      type: String,
      required: [true, 'El número de colegiado es obligatorio'],
      unique: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
    },
    especialidad: {
      type: String,
      required: [true, 'La especialidad es obligatoria'],
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
    },
    horario_entrada: {
      type: String, // ej: "08:00"
      required: true,
    },
    horario_salida: {
      type: String, // ej: "16:00"
      required: true,
    },
    dias_laborables: [
      {
        type: String,
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Medico', medicoSchema);
