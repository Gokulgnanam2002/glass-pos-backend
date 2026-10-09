const salesService = require('../services/sales.service');

const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

const createInvoice = async (req, res, next) => {
  try {
    const invoice = await salesService.createInvoice(req.body, req.user?.id);
    sendSuccess(res, invoice, 201);
  } catch (error) {
    next(error);
  }
};

const postInvoice = async (req, res, next) => {
  try {
    const invoice = await salesService.postInvoice(req.params.id, req.user?.id);
    sendSuccess(res, invoice);
  } catch (error) {
    if (error.message.includes('Insufficient stock') || error.message.includes('Only DRAFT')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await salesService.getAllInvoices();
    sendSuccess(res, invoices);
  } catch (error) {
    next(error);
  }
};

const addPayment = async (req, res, next) => {
  try {
    const payment = await salesService.addPayment(req.params.id, req.body);
    sendSuccess(res, payment, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  postInvoice,
  getAllInvoices,
  addPayment
};
