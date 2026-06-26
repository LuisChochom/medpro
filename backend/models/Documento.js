const mongoose = require('mongoose');

const archivoSchema = new mongoose.Schema({
  nombre_archivo: { type: String, required: true },
  storage_path: { type: String, required: true },
  mime_type: { type: String, required: true },
  size_bytes: { type: Number, required: true }
});

const documentoSchema = new mongoose.Schema(
  {
    paciente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: true,
    },
    titulo: {
      type: String,
      required: true,
      default: 'Registro de Documentos'
    },
    tipo_documento: {
      type: String,
      enum: ['Laboratorio', 'Imagenología', 'Consentimiento', 'Identificación', 'Otro'],
      required: true,
    },
    archivos: [archivoSchema],
    subido_por_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

module.exports = mongoose.model('Documento', documentoSchema);
