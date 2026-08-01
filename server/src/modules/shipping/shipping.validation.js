const { body, param } = require('express-validator');

const createShipmentRules = [
  body('orderId').trim().notEmpty().withMessage('Order ID is required'),
];

const trackingLookupRules = [
  param('trackingId').trim().notEmpty().withMessage('Tracking ID is required'),
];

module.exports = {
  createShipmentRules,
  trackingLookupRules,
};
