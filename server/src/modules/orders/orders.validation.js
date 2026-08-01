const { body, param } = require('express-validator');

const createOrderRules = [
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required'),
];

const updateStatusRules = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Next status is required')
    .isIn([
      'Order Placed',
      'Payment Verified',
      'Design Approved',
      'Printing In Progress',
      'Quality Check',
      'Packed',
      'Shipment Created',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ])
    .withMessage('Invalid order status step'),
];

module.exports = {
  createOrderRules,
  updateStatusRules,
};
