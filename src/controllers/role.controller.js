const roleService = require('../services/role.service');

const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

const createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    sendSuccess(res, role, 201);
  } catch (error) {
    next(error);
  }
};

const getAllRoles = async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles();
    sendSuccess(res, roles);
  } catch (error) {
    next(error);
  }
};

const createPermission = async (req, res, next) => {
  try {
    const permission = await roleService.createPermission(req.body);
    sendSuccess(res, permission, 201);
  } catch (error) {
    next(error);
  }
};

const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await roleService.getAllPermissions();
    sendSuccess(res, permissions);
  } catch (error) {
    next(error);
  }
};

const assignPermissionsToRole = async (req, res, next) => {
  try {
    // Expecting req.body.permissionIds array
    const updatedRole = await roleService.assignPermissionsToRole(req.params.id, req.body.permissionIds);
    sendSuccess(res, updatedRole);
  } catch (error) {
    next(error);
  }
};

const assignRoleToUser = async (req, res, next) => {
  try {
    const result = await roleService.assignRoleToUser(req.body.userId, req.body.roleId);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRole,
  getAllRoles,
  createPermission,
  getAllPermissions,
  assignPermissionsToRole,
  assignRoleToUser
};
