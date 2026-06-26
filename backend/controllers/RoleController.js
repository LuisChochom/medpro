const asyncHandler = require('express-async-handler');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

// @desc    Obtener todos los roles
// @route   GET /api/v1/roles
// @access  Private
const getRoles = asyncHandler(async (req, res) => {
  let query = { is_active: true };
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [{ name: searchRegex }, { display_name: searchRegex }];
  }
  const roles = await Role.find(query).populate('permissions');
  res.json({
    status: 'success',
    data: roles
  });
});

// @desc    Obtener un rol
// @route   GET /api/v1/roles/:id
// @access  Private
const getRoleById = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id).populate('permissions');
  if (!role) {
    res.status(404);
    throw new Error('Rol no encontrado');
  }
  res.json({ status: 'success', data: role });
});

// @desc    Crear un rol
// @route   POST /api/v1/roles
// @access  Private
const createRole = asyncHandler(async (req, res) => {
  const { name, display_name } = req.body;
  const role = await Role.create({ name, display_name });
  res.status(201).json({ status: 'success', data: role });
});

// @desc    Actualizar un rol
// @route   PUT /api/v1/roles/:id
// @access  Private
const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!role) {
    res.status(404);
    throw new Error('Rol no encontrado');
  }
  res.json({ status: 'success', data: role });
});

// @desc    Sincronizar permisos de un rol
// @route   POST /api/v1/roles/:id/permissions
// @access  Private
const syncPermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body; // Array de IDs de permisos
  const role = await Role.findById(req.params.id);

  if (!role) {
    res.status(404);
    throw new Error('Rol no encontrado');
  }

  // Validar si existen los permisos
  const count = await Permission.countDocuments({ _id: { $in: permissions } });
  if (count !== permissions.length) {
    res.status(400);
    throw new Error('Uno o más IDs de permisos son inválidos');
  }

  role.permissions = permissions;
  await role.save();

  res.json({ status: 'success', message: 'Permisos actualizados correctamente' });
});

// @desc    Eliminar un rol
// @route   DELETE /api/v1/roles/:id
// @access  Private
const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    res.status(404);
    throw new Error('Rol no encontrado');
  }
  role.is_active = false;
  await role.save();
  res.json({ status: 'success', message: 'Rol archivado exitosamente' });
});

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  syncPermissions,
  deleteRole,
};
