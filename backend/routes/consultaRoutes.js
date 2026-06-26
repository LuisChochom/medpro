const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getConsultas,
  getConsultaById,
  createConsulta,
  updateConsulta,
  deleteConsulta
} = require('../controllers/ConsultaController');

const { authorizePermission } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizePermission('consultas.view'), getConsultas)
  .post(authorizePermission('consultas.manage'), createConsulta);

router.route('/:id')
  .get(authorizePermission('consultas.view'), getConsultaById)
  .put(authorizePermission('consultas.manage'), updateConsulta)
  .delete(authorizePermission('consultas.manage'), deleteConsulta);

module.exports = router;
