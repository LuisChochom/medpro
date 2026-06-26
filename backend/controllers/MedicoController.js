const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Medico = require('../models/Medico');
const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Obtener médicos
// @route   GET /api/v1/medicos
// @access  Private
const getMedicos = asyncHandler(async (req, res) => {
  let query = { is_active: true };

  if (req.query.especialidad) {
    query.especialidad = new RegExp(req.query.especialidad, 'i');
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { nombre: searchRegex },
      { apellido: searchRegex },
      { colegiado_numero: searchRegex }
    ];
  }

  const medicos = await Medico.find(query).populate('user_id', 'email is_active');
  res.json({ status: 'success', data: medicos });
});

// @desc    Obtener un médico por ID
// @route   GET /api/v1/medicos/:id
// @access  Private
const getMedicoById = asyncHandler(async (req, res) => {
  const medico = await Medico.findById(req.params.id).populate('user_id', 'email is_active');
  if (!medico) {
    res.status(404);
    throw new Error('Médico no encontrado');
  }
  res.json({ status: 'success', data: medico });
});

// @desc    Crear un médico y su cuenta de usuario
// @route   POST /api/v1/medicos
// @access  Private/Admin
const createMedico = asyncHandler(async (req, res) => {
  const {
    email, password,
    colegiado_numero, nombre, apellido, especialidad, telefono,
    horario_entrada, horario_salida, dias_laborables
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('El correo electrónico ya está en uso');
    }

    const medicoExists = await Medico.findOne({ colegiado_numero });
    if (medicoExists) {
      res.status(400);
      throw new Error('El número de colegiado ya está registrado');
    }

    let medicoRole = await Role.findOne({ name: 'medico' });
    if (!medicoRole) {
      medicoRole = await Role.create({ name: 'medico', display_name: 'Personal Médico' });
    }

    const user = await User.create({
      email,
      password,
      roles: [medicoRole._id]
    });

    const medico = await Medico.create({
      user_id: user._id,
      colegiado_numero,
      nombre,
      apellido,
      especialidad,
      telefono,
      horario_entrada,
      horario_salida,
      dias_laborables
    });

    res.status(201).json({ status: 'success', data: medico });

  } catch (error) {
    throw error;
  }
});

// @desc    Actualizar un médico
// @route   PUT /api/v1/medicos/:id
// @access  Private
const updateMedico = asyncHandler(async (req, res) => {
  const medico = await Medico.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!medico) {
    res.status(404);
    throw new Error('Médico no encontrado');
  }

  res.json({ status: 'success', data: medico });
});

// @desc    Eliminar/Dar de baja a un médico
// @route   DELETE /api/v1/medicos/:id
// @access  Private/Admin
const deleteMedico = asyncHandler(async (req, res) => {
  const medico = await Medico.findById(req.params.id);
  if (!medico) {
    res.status(404);
    throw new Error('Médico no encontrado');
  }

  medico.is_active = false;
  await medico.save();

  await User.findByIdAndUpdate(medico.user_id, { is_active: false });

  res.json({ status: 'success', message: 'Médico dado de baja correctamente' });
});

module.exports = {
  getMedicos,
  getMedicoById,
  createMedico,
  updateMedico,
  deleteMedico
};
