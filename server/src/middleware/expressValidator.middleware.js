const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Middleware to check validation results from express-validator chains
 */
const validateExpress = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(', ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};

module.exports = validateExpress;
