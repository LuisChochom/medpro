const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  changeEstadoCita,
  deleteCita
} = require('../controllers/CitaController');

const { authorizePermission } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizePermission('citas.view'), getCitas)
  .post(authorizePermission('citas.manage'), createCita);

router.route('/:id')
  .get(authorizePermission('citas.view'), getCitaById)
  .put(authorizePermission('citas.manage'), updateCita)
  .delete(authorizePermission('citas.manage'), deleteCita);

router.patch('/:id/estado', changeEstadoCita);

module.exports = router;
