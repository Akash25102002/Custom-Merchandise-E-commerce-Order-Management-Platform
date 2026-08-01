const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const dbStore = require('../../utils/dbStore');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { transitionOrderStatus, getNextValidStatuses } = require('../../utils/orderStateMachine');
const { decrementProductStockAtomic } = require('../products/products.controller');

// Helper to generate human-readable order numbers
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
};

const createOrderFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const { shippingAddress, paymentId = 'pay_mock_' + Date.now() } = req.body;

  let cart = null;
  if (dbStore.isMongoConnected()) {
    cart = await Cart.findOne({ user: userId }).populate('items.product');
  } else {
    cart = dbStore.orders.get(`cart_${userId}`);
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return next(new AppError('Cannot place an order with an empty cart', 400));
  }

  // 1. Snapshot cart items and perform atomic stock decrements
  const orderItemsSnapshot = [];
  for (const item of cart.items) {
    const prodObj = item.product || {};
    const productId = prodObj._id || prodObj.id || item.product;

    // Execute atomic stock reduction
    await decrementProductStockAtomic(productId, item.quantity);

    orderItemsSnapshot.push({
      product: productId,
      name: prodObj.name || item.name || 'Custom Merchandise Item',
      sku: prodObj.sku || 'MERCH-001',
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      printType: item.printType,
      printLocation: item.printLocation || 'front',
      designImageUrl: item.designImageUrl || '',
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    });
  }

  const orderNumber = generateOrderNumber();
  const subtotal = cart.subtotal;
  const tax = cart.tax;
  const shippingCharge = cart.shippingEstimate;
  const totalAmount = cart.grandTotal;

  const initialStatus = 'Order Placed';
  const initialHistory = [
    {
      status: initialStatus,
      timestamp: new Date(),
      note: 'Order successfully placed by customer',
    },
  ];

  let newOrder;
  if (dbStore.isMongoConnected()) {
    newOrder = await Order.create({
      orderNumber,
      user: userId,
      items: orderItemsSnapshot,
      subtotal,
      tax,
      shippingCharge,
      totalAmount,
      status: initialStatus,
      statusHistory: initialHistory,
      paymentId,
      shippingId: 'shp_delhivery_' + Date.now(),
      shippingAddress,
    });

    // Clear user cart after placing order
    cart.items = [];
    cart.recalculateTotals();
    await cart.save();
  } else {
    // In-memory fallback
    const mockOrderId = 'ord_' + Date.now();
    newOrder = {
      _id: mockOrderId,
      id: mockOrderId,
      orderNumber,
      user: userId,
      items: orderItemsSnapshot,
      subtotal,
      tax,
      shippingCharge,
      totalAmount,
      status: initialStatus,
      statusHistory: initialHistory,
      paymentId,
      shippingId: 'shp_delhivery_' + Date.now(),
      shippingAddress,
      createdAt: new Date(),
    };

    dbStore.orders.set(mockOrderId, newOrder);

    // Clear memory cart
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.tax = 0;
      cart.shippingEstimate = 0;
      cart.grandTotal = 0;
      dbStore.orders.set(`cart_${userId}`, cart);
    }
  }

  res.status(201).json({
    status: 'success',
    message: 'Order created successfully',
    data: { order: newOrder },
  });
});

const getOrders = catchAsync(async (req, res, next) => {
  const userId = req.user.id || req.user._id;
  const isAdmin = req.user.role === 'admin';
  const { status } = req.query;

  if (dbStore.isMongoConnected()) {
    const query = {};
    if (!isAdmin) {
      query.user = userId;
    }
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } else {
    // In-memory fallback
    let list = Array.from(dbStore.orders.values()).filter((o) => o.orderNumber);

    if (!isAdmin) {
      list = list.filter((o) => o.user === userId || o.user?._id === userId);
    }
    if (status) {
      list = list.filter((o) => o.status === status);
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      status: 'success',
      results: list.length,
      data: { orders: list },
    });
  }
});

const getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id || req.user._id;
  const isAdmin = req.user.role === 'admin';

  let order = null;
  if (dbStore.isMongoConnected()) {
    order = await Order.findById(id).populate('user', 'name email phone');
  } else {
    order = dbStore.orders.get(id) || Array.from(dbStore.orders.values()).find((o) => o.orderNumber === id || o._id === id);
  }

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Validate ownership
  const orderUserId = order.user?._id ? order.user._id.toString() : order.user.toString();
  if (!isAdmin && orderUserId !== userId.toString()) {
    return next(new AppError('You do not have permission to view this order', 403));
  }

  const nextValidStatuses = getNextValidStatuses(order.status);

  res.status(200).json({
    status: 'success',
    data: {
      order,
      nextValidStatuses,
    },
  });
});

const updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status: nextStatus, note } = req.body;

  let order = null;
  if (dbStore.isMongoConnected()) {
    order = await Order.findById(id);
  } else {
    order = dbStore.orders.get(id) || Array.from(dbStore.orders.values()).find((o) => o.orderNumber === id || o._id === id);
  }

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Enforce strict workflow state machine
  transitionOrderStatus(order, nextStatus, note);

  if (dbStore.isMongoConnected()) {
    await order.save();
  } else {
    dbStore.orders.set(order._id || order.id, order);
  }

  res.status(200).json({
    status: 'success',
    message: `Order status successfully transitioned to "${nextStatus}"`,
    data: {
      order,
      nextValidStatuses: getNextValidStatuses(order.status),
    },
  });
});

const cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id || req.user._id;

  let order = null;
  if (dbStore.isMongoConnected()) {
    order = await Order.findById(id);
  } else {
    order = dbStore.orders.get(id) || Array.from(dbStore.orders.values()).find((o) => o.orderNumber === id || o._id === id);
  }

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Validate owner
  const orderUserId = order.user?._id ? order.user._id.toString() : order.user.toString();
  if (orderUserId !== userId.toString()) {
    return next(new AppError('You do not have permission to cancel this order', 403));
  }

  // Customer can only cancel before "Printing In Progress"
  transitionOrderStatus(order, 'Cancelled', 'Order cancelled by customer before printing started');

  if (dbStore.isMongoConnected()) {
    await order.save();
  } else {
    dbStore.orders.set(order._id || order.id, order);
  }

  res.status(200).json({
    status: 'success',
    message: 'Order cancelled successfully',
    data: { order },
  });
});

module.exports = {
  createOrderFromCart,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
