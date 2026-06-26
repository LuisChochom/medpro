const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/UserController');

const { authorizePermission } = require('../middlewares/roleMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorizePermission('usuarios.manage'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
