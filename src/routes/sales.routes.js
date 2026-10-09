const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const validate = require('../middleware/validate.middleware');
const { createInvoiceSchema, addSalesPaymentSchema } = require('../validators/sales.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorize('ADMIN', 'STAFF'));

router.post('/', authorize('ADMIN', 'STAFF'), validate(createInvoiceSchema), salesController.createInvoice);
router.post('/:id/post', authorize('ADMIN', 'STAFF'), salesController.postInvoice);
router.get('/', salesController.getAllInvoices);
router.post('/:id/payments', authorize('ADMIN', 'STAFF'), validate(addSalesPaymentSchema), salesController.addPayment);

module.exports = router;
