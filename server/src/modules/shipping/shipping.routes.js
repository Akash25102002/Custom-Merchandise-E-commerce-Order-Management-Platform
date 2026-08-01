const express = require('express');
const shippingController = require('./shipping.controller');
const { createShipmentRules, trackingLookupRules } = require('./shipping.validation');
const validateExpress = require('../../middleware/expressValidator.middleware');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public Tracking Lookup (No Auth Required)
router.get('/:trackingId', trackingLookupRules, validateExpress, shippingController.getPublicTracking);

// Admin-only Shipment Creation
router.post('/create', protect, restrictTo('admin'), createShipmentRules, validateExpress, shippingController.createShipment);

module.exports = router;
