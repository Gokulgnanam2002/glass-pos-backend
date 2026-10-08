const { sendError } = require('../utils/response');

const notFound = (req, res, next) => {
  return sendError(res, 'Route not found', 404);
};

module.exports = notFound;
