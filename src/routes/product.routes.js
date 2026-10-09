const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');

router.use(authenticate);

router.post('/', authorize('ADMIN'), validate(createProductSchema), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.patch('/:id', authorize('ADMIN'), validate(updateProductSchema), productController.updateProduct);
router.post('/:id/compatibility', authorize('ADMIN'), productController.addVehicleCompatibility);
router.delete('/:id', authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
