const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const validate = require('../middleware/validate.middleware');
const { createRoleSchema, createPermissionSchema, assignPermissionsSchema, assignUserRoleSchema } = require('../validators/role.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Protect all RBAC routes - normally strictly ADMIN
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/roles', authorize('ADMIN'), validate(createRoleSchema), roleController.createRole);
router.get('/roles', roleController.getAllRoles);
router.post('/roles/:id/permissions', authorize('ADMIN'), validate(assignPermissionsSchema), roleController.assignPermissionsToRole);

router.post('/permissions', authorize('ADMIN'), validate(createPermissionSchema), roleController.createPermission);
router.get('/permissions', roleController.getAllPermissions);

router.post('/assign-user', authorize('ADMIN'), validate(assignUserRoleSchema), roleController.assignRoleToUser);

module.exports = router;
