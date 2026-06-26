const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  syncPermissions
} = require('../controllers/RoleController');

const { authorizePermission } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorizePermission('roles.manage'));

router.route('/')
  .get(getRoles)
  .post(createRole);

router.route('/:id')
  .get(getRoleById)
  .put(updateRole)
  .delete(deleteRole);

router.post('/:id/permissions', syncPermissions);

module.exports = router;
