const asyncHandler = require('express-async-handler');
const Paciente = require('../models/Paciente');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

// @desc    Obtener pacientes (paginados y con filtros)
// @route   GET /api/v1/pacientes
// @access  Private
const getPacientes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  let query = { is_active: true };

  // Búsqueda simple
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { nombre: searchRegex },
      { apellido: searchRegex },
      { expediente_numero: searchRegex }
    ];
  }

  const pacientes = await Paciente.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Paciente.countDocuments(query);

  res.json({
    status: 'success',
    data: pacientes,
    pagination: {
      total,
      page,
      per_page: limit,
      total_pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Obtener un paciente por ID
// @route   GET /api/v1/pacientes/:id
// @access  Private
const getPacienteById = asyncHandler(async (req, res) => {
  const paciente = await Paciente.findById(req.params.id).populate('user_id', 'email is_active');
  if (!paciente) {
    res.status(404);
    throw new Error('Paciente no encontrado');
  }
  res.json({ status: 'success', data: paciente });
});

// Generador de número de expediente
const generateExpediente = async () => {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  // Buscar el último expediente de este mes
  const lastPaciente = await Paciente.findOne({ expediente_numero: new RegExp(`^E-${yearMonth}-`) })
    .sort({ createdAt: -1 });

  let sequence = 1;
  if (lastPaciente) {
    const parts = lastPaciente.expediente_numero.split('-');
    sequence = parseInt(parts[2], 10) + 1;
  }

  return `E-${yearMonth}-${String(sequence).padStart(3, '0')}`;
};

// @desc    Crear un paciente
// @route   POST /api/v1/pacientes
// @access  Private
const createPaciente = asyncHandler(async (req, res) => {
  const {
    nombre, apellido, fecha_nacimiento, genero, telefono,
    direccion, contacto_emergencia_nombre, contacto_emergencia_telefono, tipo_sangre,
    crear_usuario, email, password
  } = req.body;

  let user_id = null;

  // Si se solicita crear credenciales de usuario
  if (crear_usuario && email && password) {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('El correo electrónico ya está en uso');
    }

    let pacienteRole = await Role.findOne({ name: 'paciente' });
    if (!pacienteRole) {
      pacienteRole = await Role.create({ name: 'paciente', display_name: 'Paciente' });
    }

    const newUser = await User.create({
      email,
      password,
      roles: [pacienteRole._id]
    });
    user_id = newUser._id;
  }

  const expediente_numero = await generateExpediente();

  const paciente = await Paciente.create({
    user_id,
    expediente_numero,
    nombre,
    apellido,
    fecha_nacimiento,
    genero,
    telefono,
    direccion,
    contacto_emergencia_nombre,
    contacto_emergencia_telefono,
    tipo_sangre
  });

  res.status(201).json({ status: 'success', data: paciente });
});

// @desc    Actualizar un paciente
// @route   PUT /api/v1/pacientes/:id
// @access  Private
const updatePaciente = asyncHandler(async (req, res) => {
  const paciente = await Paciente.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!paciente) {
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  res.json({ status: 'success', data: paciente });
});

// @desc    Eliminar/Archivar paciente
// @route   DELETE /api/v1/pacientes/:id
// @access  Private
const deletePaciente = asyncHandler(async (req, res) => {
  const paciente = await Paciente.findById(req.params.id);
  if (!paciente) {
    res.status(404);
    throw new Error('Paciente no encontrado');
  }

  // Soft delete
  paciente.is_active = false;
  await paciente.save();

  // Si tiene usuario, también desactivarlo
  if (paciente.user_id) {
    await User.findByIdAndUpdate(paciente.user_id, { is_active: false });
  }

  res.json({ status: 'success', message: 'Paciente archivado correctamente' });
});

module.exports = {
  getPacientes,
  getPacienteById,
  createPaciente,
  updatePaciente,
  deletePaciente
};
