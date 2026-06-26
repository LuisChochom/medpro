const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Obtener todos los usuarios
// @route   GET /api/v1/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.email = searchRegex;
  }
  const users = await User.find(query).select('-password').populate('roles');
  res.json({
    status: 'success',
    data: users
  });
});

// @desc    Obtener un usuario
// @route   GET /api/v1/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').populate('roles');
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
  res.json({ status: 'success', data: user });
});

// @desc    Crear un usuario
// @route   POST /api/v1/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { email, password, roles, is_active } = req.body;
  
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  const user = await User.create({ email, password, roles, is_active });
  
  if (user) {
    res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        is_active: user.is_active
      }
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Actualizar un usuario
// @route   PUT /api/v1/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.email = req.body.email || user.email;
    user.is_active = req.body.is_active !== undefined ? req.body.is_active : user.is_active;
    if (req.body.roles) user.roles = req.body.roles;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    
    res.json({
      status: 'success',
      data: {
        _id: updatedUser._id,
        email: updatedUser.email,
        roles: updatedUser.roles,
        is_active: updatedUser.is_active
      }
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Eliminar/Desactivar un usuario (Soft Delete)
// @route   DELETE /api/v1/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
  
  // Soft delete
  user.is_active = false;
  await user.save();
  
  res.json({ status: 'success', message: 'Usuario desactivado' });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
