const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getMedicos,
  getMedicoById,
  createMedico,
  updateMedico,
  deleteMedico
} = require('../controllers/MedicoController');

const { authorizePermission } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizePermission('medicos.view'), getMedicos)
  .post(authorizePermission('medicos.manage'), createMedico);

router.route('/:id')
  .get(authorizePermission('medicos.view'), getMedicoById)
  .put(authorizePermission('medicos.manage'), updateMedico)
  .delete(authorizePermission('medicos.manage'), deleteMedico);

module.exports = router;
