const purchaseService = require('../services/purchase.service');

const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

const createPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.createPurchase(req.body, req.user?.id);
    sendSuccess(res, purchase, 201);
  } catch (error) {
    next(error);
  }
};

const postPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.postPurchase(req.params.id, req.user?.id);
    sendSuccess(res, purchase);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Only DRAFT')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getAllPurchases = async (req, res, next) => {
  try {
    const purchases = await purchaseService.getAllPurchases();
    sendSuccess(res, purchases);
  } catch (error) {
    next(error);
  }
};

const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await purchaseService.getPurchaseById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    sendSuccess(res, purchase);
  } catch (error) {
    next(error);
  }
};

const addPayment = async (req, res, next) => {
  try {
    const payment = await purchaseService.addPayment(req.params.id, req.body);
    sendSuccess(res, payment, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchase,
  postPurchase,
  getAllPurchases,
  getPurchaseById,
  addPayment
};
