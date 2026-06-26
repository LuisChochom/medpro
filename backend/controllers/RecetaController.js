const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Receta = require('../models/Receta');
const Consulta = require('../models/Consulta');

// @desc    Obtener todas las recetas
// @route   GET /api/v1/recetas
// @access  Private
const getRecetas = asyncHandler(async (req, res) => {
  let query = { is_active: true };
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    
    // Buscar pacientes que coincidan
    const Paciente = require('../models/Paciente');
    const pacientes = await Paciente.find({
      $or: [{ nombre: searchRegex }, { apellido: searchRegex }]
    }).select('_id');
    const pacientesIds = pacientes.map(p => p._id);
    
    // Buscar consultas de esos pacientes
    const Consulta = require('../models/Consulta');
    const consultas = await Consulta.find({ paciente_id: { $in: pacientesIds } }).select('_id');
    const consultasIds = consultas.map(c => c._id);
    
    query.$or = [
      { codigo_receta: searchRegex },
      { consulta_id: { $in: consultasIds } }
    ];
  }
  const recetas = await Receta.find(query).populate({
    path: 'consulta_id',
    select: 'fecha_consulta paciente_id medico_id diagnostico',
    populate: [
      { path: 'paciente_id', select: 'nombre apellido expediente_numero' },
      { path: 'medico_id', select: 'nombre apellido especialidad colegiado_numero' }
    ]
  });
  
  res.json({ status: 'success', data: recetas });
});

// @desc    Obtener una receta por ID
// @route   GET /api/v1/recetas/:id
// @access  Private
const getRecetaById = asyncHandler(async (req, res) => {
  const receta = await Receta.findById(req.params.id).populate({
    path: 'consulta_id',
    populate: [
      { path: 'paciente_id', select: 'nombre apellido expediente_numero' },
      { path: 'medico_id', select: 'nombre apellido especialidad colegiado_numero' }
    ]
  });

  if (!receta) {
    res.status(404);
    throw new Error('Receta no encontrada');
  }

  res.json({ status: 'success', data: receta });
});

// @desc    Emitir una receta médica
// @route   POST /api/v1/recetas
// @access  Private (Solo Médicos)
const createReceta = asyncHandler(async (req, res) => {
  const { consulta_id, instrucciones_generales, medicamentos } = req.body;

  const consulta = await Consulta.findById(consulta_id);
  if (!consulta) {
    res.status(404);
    throw new Error('Consulta no encontrada');
  }

  const recetaExistente = await Receta.findOne({ consulta_id });
  if (recetaExistente) {
    res.status(400);
    throw new Error('Esta consulta ya tiene una receta asociada');
  }

  // Generar código único alfanumérico para la receta
  const codigo_receta = crypto.randomBytes(6).toString('hex').toUpperCase();

  const receta = await Receta.create({
    consulta_id,
    codigo_receta,
    instrucciones_generales,
    medicamentos
  });

  const recetaPopulated = await Receta.findById(receta._id).populate({
    path: 'consulta_id',
    populate: [
      { path: 'paciente_id', select: 'nombre apellido expediente_numero' },
      { path: 'medico_id', select: 'nombre apellido especialidad colegiado_numero' }
    ]
  });

  res.status(201).json({ status: 'success', data: recetaPopulated });
});

// @desc    Actualizar instrucciones de receta
// @route   PUT /api/v1/recetas/:id
// @access  Private
const updateReceta = asyncHandler(async (req, res) => {
  const receta = await Receta.findById(req.params.id);

  if (!receta) {
    res.status(404);
    throw new Error('Receta no encontrada');
  }

  if (req.body.instrucciones_generales) {
    receta.instrucciones_generales = req.body.instrucciones_generales;
  }
  
  // Opcional: Permitir actualizar medicamentos si no ha sido impresa/surtida

  const updatedReceta = await receta.save();

  res.json({ status: 'success', data: updatedReceta });
});

// @desc    Anular una receta
// @route   DELETE /api/v1/recetas/:id
// @access  Private
const deleteReceta = asyncHandler(async (req, res) => {
  const receta = await Receta.findById(req.params.id);
  if (!receta) {
    res.status(404);
    throw new Error('Receta no encontrada');
  }

  receta.is_active = false;
  await receta.save();
  res.json({ status: 'success', message: 'Receta archivada exitosamente' });
});

module.exports = {
  getRecetas,
  getRecetaById,
  createReceta,
  updateReceta,
  deleteReceta
};
