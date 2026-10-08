const { sendError } = require('../utils/response');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return sendError(res, error.errors, 400);
    }
  };
};

module.exports = validate;
