const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { 
  categorySchema, updateCategorySchema,
  brandSchema, updateBrandSchema,
  modelSchema, updateModelSchema,
  variantSchema, updateVariantSchema
} = require('../validators/vehicle.validator');

router.use(authenticate);

// Categories
router.post('/categories', authorize('ADMIN'), validate(categorySchema), vehicleController.createCategory);
router.get('/categories', vehicleController.getCategories);
router.patch('/categories/:id', authorize('ADMIN'), validate(updateCategorySchema), vehicleController.updateCategory);
router.delete('/categories/:id', authorize('ADMIN'), vehicleController.deleteCategory);

// Brands
router.post('/brands', authorize('ADMIN'), validate(brandSchema), vehicleController.createBrand);
router.get('/brands', vehicleController.getBrands);
router.patch('/brands/:id', authorize('ADMIN'), validate(updateBrandSchema), vehicleController.updateBrand);
router.delete('/brands/:id', authorize('ADMIN'), vehicleController.deleteBrand);

// Models
router.post('/models', authorize('ADMIN'), validate(modelSchema), vehicleController.createModel);
router.get('/models', vehicleController.getModels);
router.patch('/models/:id', authorize('ADMIN'), validate(updateModelSchema), vehicleController.updateModel);
router.delete('/models/:id', authorize('ADMIN'), vehicleController.deleteModel);

// Variants
router.post('/variants', authorize('ADMIN'), validate(variantSchema), vehicleController.createVariant);
router.get('/variants', vehicleController.getVariants);
router.patch('/variants/:id', authorize('ADMIN'), validate(updateVariantSchema), vehicleController.updateVariant);
router.delete('/variants/:id', authorize('ADMIN'), vehicleController.deleteVariant);

module.exports = router;
