const z = require('zod');

const createRoleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  description: z.string().optional().nullable(),
  active: z.boolean().optional(),
}).strict();

const createPermissionSchema = z.object({
  code: z.string().min(3),
  module: z.string().min(2),
  description: z.string().optional().nullable(),
}).strict();

const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid("Invalid permission ID")),
}).strict();

const assignUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  roleId: z.string().uuid("Invalid role ID"),
}).strict();

module.exports = {
  createRoleSchema,
  createPermissionSchema,
  assignPermissionsSchema,
  assignUserRoleSchema,
};
