const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getPacientes,
  getPacienteById,
  createPaciente,
  updatePaciente,
  deletePaciente
} = require('../controllers/PacienteController');

const { authorizePermission } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizePermission('pacientes.view'), getPacientes)
  .post(authorizePermission('pacientes.manage'), createPaciente);

router.route('/:id')
  .get(authorizePermission('pacientes.view'), getPacienteById)
  .put(authorizePermission('pacientes.manage'), updatePaciente)
  .delete(authorizePermission('pacientes.manage'), deletePaciente);

module.exports = router;
