const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const validate = require('../middleware/validate.middleware');
const { createSupplierSchema, updateSupplierSchema } = require('../validators/supplier.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Apply auth middleware to all supplier routes
router.use(authenticate);
router.use(authorize('ADMIN', 'STAFF'));

router.post('/', authorize('ADMIN', 'STAFF'), validate(createSupplierSchema), supplierController.createSupplier);
router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.patch('/:id', authorize('ADMIN', 'STAFF'), validate(updateSupplierSchema), supplierController.updateSupplier);
router.delete('/:id', authorize('ADMIN'), supplierController.deleteSupplier);

module.exports = router;
