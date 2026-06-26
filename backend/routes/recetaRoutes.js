const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizePermission } = require('../middlewares/roleMiddleware');
const {
  getRecetas,
  getRecetaById,
  createReceta,
  updateReceta,
  deleteReceta
} = require('../controllers/RecetaController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizePermission('recetas.view'), getRecetas)
  .post(authorizePermission('recetas.manage'), createReceta);

router.route('/:id')
  .get(authorizePermission('recetas.view'), getRecetaById)
  .put(authorizePermission('recetas.manage'), updateReceta)
  .delete(authorizePermission('recetas.manage'), deleteReceta);

module.exports = router;
