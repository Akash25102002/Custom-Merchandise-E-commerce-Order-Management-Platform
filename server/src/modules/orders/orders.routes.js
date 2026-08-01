const express = require('express');
const ordersController = require('./orders.controller');
const { createOrderRules, updateStatusRules } = require('./orders.validation');
const validateExpress = require('../../middleware/expressValidator.middleware');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/', createOrderRules, validateExpress, ordersController.createOrderFromCart);
router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);

// Admin-only State Machine Status Transition
router.patch(
  '/:id/status',
  restrictTo('admin'),
  updateStatusRules,
  validateExpress,
  ordersController.updateOrderStatus
);

// Customer Order Cancellation (only before Printing In Progress)
router.patch('/:id/cancel', ordersController.cancelOrder);

module.exports = router;
