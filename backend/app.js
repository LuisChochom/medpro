const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Variables de entorno
dotenv.config();

const app = express();

// Middlewares globales
app.use(cors()); // Permitir CORS
app.use(express.json()); // Parsear body JSON
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logging HTTP
}

// Importar Rutas
const authRoutes = require('./routes/authRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const medicoRoutes = require('./routes/medicoRoutes');
const citaRoutes = require('./routes/citaRoutes');
const consultaRoutes = require('./routes/consultaRoutes');
const recetaRoutes = require('./routes/recetaRoutes');
const documentoRoutes = require('./routes/documentoRoutes');

// Montar Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/pacientes', pacienteRoutes);
app.use('/api/v1/medicos', medicoRoutes);
app.use('/api/v1/citas', citaRoutes);
app.use('/api/v1/consultas', consultaRoutes);
app.use('/api/v1/recetas', recetaRoutes);
app.use('/api/v1/documentos', documentoRoutes);
// Catch-All Route (404)
app.use(notFound);

// Manejador de errores global
app.use(errorHandler);

module.exports = app;
