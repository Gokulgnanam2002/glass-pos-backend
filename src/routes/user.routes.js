const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { updateUserSchema } = require('../validators/user.validator');

router.use(authenticate);

router.get('/', authorize('ADMIN', 'STAFF'), userController.getAllUsers);
router.get('/:id', authorize('ADMIN', 'STAFF'), userController.getUserById);
router.patch('/:id', authorize('ADMIN'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

module.exports = router;
