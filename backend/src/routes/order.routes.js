const { Router } = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { verifyJWT, isAdmin } = require('../middlewares/auth.middleware');

const router = Router();

// Customer Endpoints
router.post('/', verifyJWT, createOrder);
router.get('/my-orders', verifyJWT, getMyOrders);
router.get('/:id', verifyJWT, getOrderById);

// Admin Endpoints
router.get('/', verifyJWT, isAdmin, getAllOrders);
router.patch('/:id/status', verifyJWT, isAdmin, updateOrderStatus);

module.exports = router;
