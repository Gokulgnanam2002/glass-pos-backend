const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const validate = require('../middleware/validate.middleware');
const { createPurchaseSchema, addPaymentSchema } = require('../validators/purchase.validator');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Apply auth middleware
router.use(authenticate);
router.use(authorize('ADMIN', 'STAFF'));

router.post('/', authorize('ADMIN', 'STAFF'), validate(createPurchaseSchema), purchaseController.createPurchase);
router.post('/:id/post', authorize('ADMIN'), purchaseController.postPurchase); // Only ADMIN can post purchases
router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/:id/payments', authorize('ADMIN', 'STAFF'), validate(addPaymentSchema), purchaseController.addPayment);

module.exports = router;
