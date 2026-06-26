const asyncHandler = require('express-async-handler');
const Consulta = require('../models/Consulta');
const Cita = require('../models/Cita');
const mongoose = require('mongoose');

// @desc    Obtener todas las consultas
// @route   GET /api/v1/consultas
// @access  Private
const getConsultas = asyncHandler(async (req, res) => {
  let query = { is_active: true };
  if (req.query.search) {
    const Paciente = require('../models/Paciente');
    const searchRegex = new RegExp(req.query.search, 'i');
    const pacientes = await Paciente.find({ 
      $or: [{ nombre: searchRegex }, { apellido: searchRegex }] 
    }).select('_id');
    const pacientesIds = pacientes.map(p => p._id);
    query.paciente_id = { $in: pacientesIds };
  }

  const consultas = await Consulta.find(query)
    .populate('paciente_id', 'nombre apellido expediente_numero')
    .populate('medico_id', 'nombre apellido especialidad')
    .sort({ fecha_consulta: -1 });
    
  res.json({ status: 'success', data: consultas });
});

// @desc    Obtener detalles de una consulta
// @route   GET /api/v1/consultas/:id
// @access  Private
const getConsultaById = asyncHandler(async (req, res) => {
  const consulta = await Consulta.findById(req.params.id)
    .populate('paciente_id')
    .populate('medico_id');

  if (!consulta) {
    res.status(404);
    throw new Error('Consulta no encontrada');
  }

  res.json({ status: 'success', data: consulta });
});

// @desc    Registrar una atención médica (Consulta)
// @route   POST /api/v1/consultas
// @access  Private (Solo Médicos idealmente)
const createConsulta = asyncHandler(async (req, res) => {
  const {
    cita_id, paciente_id, medico_id,
    motivo_consulta, sintomas, signos_vitales, diagnostico, notas_evolucion
  } = req.body;

  try {
    let cita = null;
    let finalCitaId = cita_id || undefined;

    if (finalCitaId) {
      const consultaExistente = await Consulta.findOne({ cita_id: finalCitaId });
      if (consultaExistente) {
        res.status(400);
        throw new Error('Esta cita ya tiene una consulta asociada');
      }

      cita = await Cita.findById(finalCitaId);
      if (!cita) {
        res.status(404);
        throw new Error('Cita no encontrada');
      }
    }

    const consulta = await Consulta.create({
      cita_id: finalCitaId,
      paciente_id,
      medico_id,
      motivo_consulta,
      sintomas,
      signos_vitales,
      diagnostico,
      notas_evolucion
    });

    if (cita) {
      // Cambiar estado de la cita a Atendida
      cita.estado = 'Atendida';
      await cita.save();
    }

    res.status(201).json({ status: 'success', data: consulta });
  } catch (error) {
    throw error;
  }
});

// @desc    Actualizar consulta (ej. modificar notas_evolucion)
// @route   PUT /api/v1/consultas/:id
// @access  Private
const updateConsulta = asyncHandler(async (req, res) => {
  const consulta = await Consulta.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!consulta) {
    res.status(404);
    throw new Error('Consulta no encontrada');
  }

  res.json({ status: 'success', data: consulta });
});

// @desc    Eliminar una consulta
// @route   DELETE /api/v1/consultas/:id
// @access  Private/Admin
const deleteConsulta = asyncHandler(async (req, res) => {
  const consulta = await Consulta.findById(req.params.id);
  if (!consulta) {
    res.status(404);
    throw new Error('Consulta no encontrada');
  }

  consulta.is_active = false;
  await consulta.save();
  res.json({ status: 'success', message: 'Consulta archivada' });
});

module.exports = {
  getConsultas,
  getConsultaById,
  createConsulta,
  updateConsulta,
  deleteConsulta
};
