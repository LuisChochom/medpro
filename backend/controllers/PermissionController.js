const asyncHandler = require('express-async-handler');
const Permission = require('../models/Permission');

// @desc    Obtener todos los permisos
// @route   GET /api/v1/permissions
// @access  Private
const getPermissions = asyncHandler(async (req, res) => {
  let query = { is_active: true };
  const permissions = await Permission.find(query);
  res.json({
    status: 'success',
    data: permissions
  });
});

// @desc    Obtener un permiso
// @route   GET /api/v1/permissions/:id
// @access  Private
const getPermissionById = asyncHandler(async (req, res) => {
  const permission = await Permission.findById(req.params.id);
  if (!permission) {
    res.status(404);
    throw new Error('Permiso no encontrado');
  }
  res.json({ status: 'success', data: permission });
});

// @desc    Crear un permiso
// @route   POST /api/v1/permissions
// @access  Private
const createPermission = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const permission = await Permission.create({ name, description });
  res.status(201).json({ status: 'success', data: permission });
});

// @desc    Actualizar un permiso
// @route   PUT /api/v1/permissions/:id
// @access  Private
const updatePermission = asyncHandler(async (req, res) => {
  const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!permission) {
    res.status(404);
    throw new Error('Permiso no encontrado');
  }
  res.json({ status: 'success', data: permission });
});

// @desc    Eliminar un permiso
// @route   DELETE /api/v1/permissions/:id
// @access  Private
const deletePermission = asyncHandler(async (req, res) => {
  const permission = await Permission.findById(req.params.id);
  if (!permission) {
    res.status(404);
    throw new Error('Permiso no encontrado');
  }
  permission.is_active = false;
  await permission.save();
  res.json({ status: 'success', message: 'Permiso archivado exitosamente' });
});

module.exports = {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
};
