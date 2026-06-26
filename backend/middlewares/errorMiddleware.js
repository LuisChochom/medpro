const fs = require('fs');
const path = require('path');

const notFound = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'El endpoint solicitado no existe o no está disponible.',
    code: 404
  });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = null;

  // Manejo de errores de Mongoose (Validación)
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Error de validación';
    errors = {};
    for (let field in err.errors) {
      errors[field] = err.errors[field].message;
    }
  }

  // Manejo de Duplicate Key en Mongoose
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Registro duplicado. Ya existe un documento con este valor.';
    errors = { duplicate: Object.keys(err.keyValue)[0] };
  }

  // Cast Error (ID inválido)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Recurso no encontrado';
  }

  // Guardar en error.log
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${statusCode} - Error: ${message}\nStack: ${err.stack}\n\n`;
  fs.appendFileSync(path.join(__dirname, '../error.log'), logMsg);

  res.status(statusCode).json({
    status: 'error',
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
