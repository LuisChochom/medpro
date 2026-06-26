const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener el token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener el usuario del token, poblado con roles y permisos
      req.user = await User.findById(decoded.id)
        .select('-password')
        .populate({
          path: 'roles',
          populate: { path: 'permissions' }
        });

      if (!req.user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
      }

      if (!req.user.is_active) {
        res.status(401);
        throw new Error('La cuenta está inactiva');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('No autorizado, token fallido');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no hay token');
  }
});

module.exports = { protect };
