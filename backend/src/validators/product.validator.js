const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      throw new ApiError(400, errorMessages, errors.array());
    }
    next();
  }
];

const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('SKU').trim().notEmpty().withMessage('SKU is required'),
  body('productType').isIn(['T-Shirts', 'Hoodies', 'Caps', 'Mugs', 'Bottles', 'Tote Bags', 'Stickers']).withMessage('Invalid product type'),
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
  validateCategory,
  validateProduct
};
