const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Invalid role choice'),
  body('phone').optional().trim(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      throw new ApiError(400, errorMessages, errors.array());
    }
    next();
  }
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      throw new ApiError(400, errorMessages, errors.array());
    }
    next();
  }
];

module.exports = {
  validateRegister,
  validateLogin
};
