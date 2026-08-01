const { body, param } = require('express-validator');

const createProductRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('basePrice').isNumeric().withMessage('Base price must be a valid number'),
  body('stockQuantity').isNumeric().withMessage('Stock quantity must be a number'),
  body('sku').trim().notEmpty().withMessage('Product SKU is required'),
];

const createCategoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

module.exports = {
  createProductRules,
  createCategoryRules,
};
