const { body } = require('express-validator');

const createPaymentRules = [
  body('orderId').trim().notEmpty().withMessage('Order ID is required'),
  body('gateway')
    .optional()
    .isIn(['razorpay', 'stripe', 'mock_gateway'])
    .withMessage('Invalid payment gateway type'),
];

const verifyPaymentRules = [
  body('orderId').trim().notEmpty().withMessage('Order ID is required'),
  body('paymentId').trim().notEmpty().withMessage('Payment ID is required'),
  body('signature').optional().trim(),
];

module.exports = {
  createPaymentRules,
  verifyPaymentRules,
};
