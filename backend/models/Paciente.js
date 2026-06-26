const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    expediente_numero: {
      type: String,
      unique: true,
      required: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
    },
    fecha_nacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    genero: {
      type: String,
      enum: ['M', 'F', 'Otro'],
      required: [true, 'El género es obligatorio'],
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
    },
    direccion: {
      type: String,
    },
    contacto_emergencia_nombre: {
      type: String,
    },
    contacto_emergencia_telefono: {
      type: String,
    },
    tipo_sangre: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
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

module.exports = mongoose.model('Paciente', pacienteSchema);
