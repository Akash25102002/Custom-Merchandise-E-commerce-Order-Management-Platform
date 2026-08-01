const { body } = require('express-validator');

const addItemRules = [
  body('productId').trim().notEmpty().withMessage('Product ID is required'),
  body('size').trim().notEmpty().withMessage('Size selection is required'),
  body('color.name').trim().notEmpty().withMessage('Color name is required'),
  body('color.hex').trim().notEmpty().withMessage('Color hex is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than or equal to 1'),
  body('printType').trim().notEmpty().withMessage('Print type selection is required'),
  body('printLocation')
    .optional()
    .isIn(['front', 'back', 'left-sleeve', 'right-sleeve', 'center', 'wrap'])
    .withMessage('Invalid print location'),
];

const updateItemRules = [
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

module.exports = {
  addItemRules,
  updateItemRules,
};
