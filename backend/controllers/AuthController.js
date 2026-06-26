const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor ingrese correo y contraseña');
  }

  // Verificar email
  const user = await User.findOne({ email }).populate({
    path: 'roles',
    populate: { path: 'permissions' }
  });

  if (user && (await user.matchPassword(password))) {
    if (!user.is_active) {
      res.status(401);
      throw new Error('La cuenta está inactiva');
    }

    // Actualizar last_login
    user.last_login = Date.now();
    await user.save();

    // Extraer nombres de roles y permisos para el payload (opcional, pero útil)
    const roles = user.roles.map(r => r.name);
    const permissions = [];
    user.roles.forEach(role => {
      role.permissions.forEach(p => {
        if (!permissions.includes(p.name)) permissions.push(p.name);
      });
    });

    res.json({
      status: 'success',
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        roles,
        permissions
      }
    });
  } else {
    res.status(401);
    throw new Error('Credenciales incorrectas');
  }
});

module.exports = { login };
