const vehicleService = require('../services/vehicle.service');
const { sendSuccess } = require('../utils/response');

const makeController = (serviceFunc, statusCode = 200) => async (req, res, next) => {
  try {
    const isIdRequired = ['updateCategory', 'deleteCategory', 'updateBrand', 'deleteBrand', 'updateModel', 'deleteModel', 'updateVariant', 'deleteVariant'].includes(serviceFunc.name);
    const args = [];
    if (isIdRequired) args.push(req.params.id);
    if (req.method === 'POST' || req.method === 'PATCH') args.push(req.body);
    
    const result = await serviceFunc(...args);
    return sendSuccess(res, result, statusCode);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCategory: makeController(vehicleService.createCategory, 201),
  getCategories: makeController(vehicleService.getCategories),
  updateCategory: makeController(vehicleService.updateCategory),
  deleteCategory: makeController(vehicleService.deleteCategory),

  createBrand: makeController(vehicleService.createBrand, 201),
  getBrands: makeController(vehicleService.getBrands),
  updateBrand: makeController(vehicleService.updateBrand),
  deleteBrand: makeController(vehicleService.deleteBrand),

  createModel: makeController(vehicleService.createModel, 201),
  getModels: makeController(vehicleService.getModels),
  updateModel: makeController(vehicleService.updateModel),
  deleteModel: makeController(vehicleService.deleteModel),

  createVariant: makeController(vehicleService.createVariant, 201),
  getVariants: makeController(vehicleService.getVariants),
  updateVariant: makeController(vehicleService.updateVariant),
  deleteVariant: makeController(vehicleService.deleteVariant),
};
