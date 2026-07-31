const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order },
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getCustomerOrders(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Customer orders retrieved successfully',
    data: { orders },
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Order details retrieved successfully',
    data: { order },
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const orders = await orderService.getAllOrders({ status });
  res.status(200).json({
    success: true,
    message: 'All orders retrieved successfully',
    data: { orders },
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status, note);
  res.status(200).json({
    success: true,
    message: `Order status updated to '${status}'`,
    data: { order },
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
