const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  return sendError(res, err.message || 'Internal Server Error', 500);
};

module.exports = errorHandler;
