const asyncHandler = require('express-async-handler');

// Middleware para verificar que el usuario tenga un rol específico
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      res.status(403);
      throw new Error('Acceso denegado: No tienes roles asignados');
    }

    const hasRole = req.user.roles.some((role) => roles.includes(role.name));

    if (!hasRole) {
      res.status(403);
      throw new Error('Acceso denegado: Rol insuficiente');
    }

    next();
  };
};

// Middleware para verificar que el usuario tenga un permiso específico
const authorizePermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      res.status(403);
      throw new Error('Acceso denegado');
    }

    let hasPermission = false;

    // Iterar sobre los roles del usuario para ver si alguno tiene el permiso
    for (const role of req.user.roles) {
      if (role.permissions && role.permissions.some(p => p.name === permissionName)) {
        hasPermission = true;
        break;
      }
    }

    if (!hasPermission) {
      res.status(403);
      throw new Error(`Acceso denegado: Falta el permiso ${permissionName}`);
    }

    next();
  };
};

module.exports = { authorizeRole, authorizePermission };
