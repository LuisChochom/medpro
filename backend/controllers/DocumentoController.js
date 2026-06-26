const asyncHandler = require('express-async-handler');
const Documento = require('../models/Documento');
const Paciente = require('../models/Paciente');
const fs = require('fs');
const path = require('path');

// @desc    Subir un documento
// @route   POST /api/v1/documentos/upload
// @access  Private
const uploadDocumento = asyncHandler(async (req, res) => {
  const { paciente_id, tipo_documento, titulo } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    res.status(400);
    throw new Error('Por favor adjunte al menos un archivo');
  }

  const paciente = await Paciente.findById(paciente_id);
  if (!paciente) {
    files.forEach(f => {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    });
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  const archivos = files.map(file => ({
    nombre_archivo: file.originalname,
    storage_path: file.path,
    mime_type: file.mimetype,
    size_bytes: file.size
  }));

  const documento = await Documento.create({
    paciente_id,
    titulo: titulo || 'Registro de Documentos',
    tipo_documento,
    archivos,
    subido_por_user_id: req.user._id // Requiere middleware auth
  });

  res.status(201).json({
    status: 'success',
    data: documento
  });
});

// @desc    Obtener lista de documentos de un paciente
// @route   GET /api/v1/documentos?paciente_id=123
// @access  Private
const getDocumentos = asyncHandler(async (req, res) => {
  const { paciente_id } = req.query;

  let query = { is_active: true };
  
  if (paciente_id) {
    query.paciente_id = paciente_id;
  }
  
  if (req.query.search) {
    const Paciente = require('../models/Paciente');
    const searchRegex = new RegExp(req.query.search, 'i');
    const pacientes = await Paciente.find({
      $or: [{ nombre: searchRegex }, { apellido: searchRegex }]
    }).select('_id');
    const pacientesIds = pacientes.map(p => p._id);

    query.$or = [
      { titulo: searchRegex },
      { paciente_id: { $in: pacientesIds } }
    ];
  }

  const documentos = await Documento.find(query)
    .populate('paciente_id', 'nombre apellido expediente_numero')
    .select('-archivos.storage_path') // Ocultar rutas físicas
    .populate('subido_por_user_id', 'email');

  res.json({ status: 'success', data: documentos });
});

// @desc    Descargar/Ver archivo
// @route   GET /api/v1/documentos/stream/:id
// @access  Private
const streamDocumento = asyncHandler(async (req, res) => {
  const { id, fileIndex } = req.params;
  const documento = await Documento.findById(id);

  if (!documento || !documento.archivos[fileIndex]) {
    res.status(404);
    throw new Error('Documento o archivo no encontrado');
  }

  const fileInfo = documento.archivos[fileIndex];

  if (fs.existsSync(fileInfo.storage_path)) {
    res.setHeader('Content-Type', fileInfo.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.nombre_archivo}"`);
    const fileStream = fs.createReadStream(fileInfo.storage_path);
    fileStream.pipe(res);
  } else {
    res.status(404);
    throw new Error('Archivo físico no encontrado en el servidor');
  }
});

// @desc    Actualizar metadata del documento
// @route   PUT /api/v1/documentos/:id
// @access  Private
const updateDocumento = asyncHandler(async (req, res) => {
  const { tipo_documento } = req.body;
  const documento = await Documento.findById(req.params.id);

  if (!documento) {
    res.status(404);
    throw new Error('Documento no encontrado');
  }

  if (tipo_documento) documento.tipo_documento = tipo_documento;
  if (req.body.titulo) documento.titulo = req.body.titulo;

  const updatedDocumento = await documento.save();

  // Eliminar paths del response
  updatedDocumento.archivos.forEach(a => a.storage_path = undefined);
  res.json({ status: 'success', data: updatedDocumento });
});

// @desc    Eliminar documento
// @route   DELETE /api/v1/documentos/:id
// @access  Private
const deleteDocumento = asyncHandler(async (req, res) => {
  const documento = await Documento.findById(req.params.id);

  if (!documento) {
    res.status(404);
    throw new Error('Documento no encontrado');
  }

  // Eliminar archivos físicos
  documento.archivos.forEach(fileInfo => {
    if (fs.existsSync(fileInfo.storage_path)) {
      fs.unlinkSync(fileInfo.storage_path);
    }
  });

  // Eliminar registro
  documento.is_active = false;
  await documento.save();
  res.json({ status: 'success', message: 'Documento archivado exitosamente' });
});

module.exports = {
  uploadDocumento,
  getDocumentos,
  streamDocumento,
  updateDocumento,
  deleteDocumento
};
