const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const validate = require('../middleware/validate.middleware');
const { createCustomerSchema, updateCustomerSchema } = require('../validators/customer.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorize('ADMIN', 'STAFF'));

router.post('/', authorize('ADMIN', 'STAFF'), validate(createCustomerSchema), customerController.createCustomer);
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id', authorize('ADMIN', 'STAFF'), validate(updateCustomerSchema), customerController.updateCustomer);

module.exports = router;
