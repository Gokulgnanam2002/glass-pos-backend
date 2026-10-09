const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createRole = async (data) => {
  return prisma.roleDef.create({ data });
};

const getAllRoles = async () => {
  return prisma.roleDef.findMany({
    include: { rolePermissions: { include: { permission: true } } }
  });
};

const createPermission = async (data) => {
  return prisma.permission.create({ data });
};

const getAllPermissions = async () => {
  return prisma.permission.findMany();
};

const assignPermissionsToRole = async (roleId, permissionIds) => {
  return prisma.$transaction(async (tx) => {
    // Clear existing
    await tx.rolePermission.deleteMany({ where: { roleId } });
    
    // Add new
    const data = permissionIds.map(permissionId => ({
      roleId,
      permissionId
    }));
    await tx.rolePermission.createMany({ data });
    
    return tx.roleDef.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } }
    });
  });
};

const assignRoleToUser = async (userId, roleId) => {
  // Assuming a user can have multiple roles, or if one, maybe clear first. Let's do upsert-like or create.
  // We'll just create. If they already have it, Prisma will throw unique constraint error.
  return prisma.userRole.create({
    data: { userId, roleId }
  });
};

module.exports = {
  createRole,
  getAllRoles,
  createPermission,
  getAllPermissions,
  assignPermissionsToRole,
  assignRoleToUser
};
