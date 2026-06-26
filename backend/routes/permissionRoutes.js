const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRole, authorizePermission } = require('../middlewares/roleMiddleware');
const {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} = require('../controllers/PermissionController');

const router = express.Router();

// Opcional: Proteger todas las rutas y pedir un permiso genérico o rol de admin
router.use(protect);
router.use(authorizePermission('roles.manage'));

router.route('/')
  .get(getPermissions)
  .post(createPermission);

router.route('/:id')
  .get(getPermissionById)
  .put(updatePermission)
  .delete(deletePermission);

module.exports = router;
