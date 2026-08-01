const Product = require('../../models/Product');
const Order = require('../../models/Order');
const dbStore = require('../../utils/dbStore');
const catchAsync = require('../../utils/catchAsync');

const getDashboardStats = catchAsync(async (req, res, next) => {
  const lowStockThreshold = Number(req.query.threshold) || 10;

  if (dbStore.isMongoConnected()) {
    // 1. Total Products Count
    const totalProducts = await Product.countDocuments({ isActive: true });

    // 2. Total Orders Count
    const totalOrders = await Order.countDocuments();

    // 3. MongoDB Aggregation Pipeline for Total Revenue (Paid orders only)
    const paidStatuses = [
      'Payment Verified',
      'Design Approved',
      'Printing In Progress',
      'Quality Check',
      'Packed',
      'Shipment Created',
      'Shipped',
      'Out for Delivery',
      'Delivered',
    ];

    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: paidStatuses } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // 4. MongoDB Aggregation Pipeline for Orders by Status breakdown
    const ordersByStatusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const ordersByStatus = {};
    ordersByStatusAgg.forEach((item) => {
      ordersByStatus[item._id] = item.count;
    });

    // 5. Low Stock Products Query (< threshold)
    const lowStockProducts = await Product.find({
      isActive: true,
      stockQuantity: { $lt: lowStockThreshold },
    }).select('name sku stockQuantity basePrice images category');

    return res.status(200).json({
      status: 'success',
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        ordersByStatus,
        lowStockProducts,
        lowStockThreshold,
      },
    });
  } else {
    // In-Memory Fallback Aggregation
    const productsList = Array.from(dbStore.products.values()).filter((p) => p.isActive !== false);
    const ordersList = Array.from(dbStore.orders.values()).filter((o) => o.orderNumber);

    const totalProducts = productsList.length;
    const totalOrders = ordersList.length;

    const paidStatuses = [
      'Payment Verified',
      'Design Approved',
      'Printing In Progress',
      'Quality Check',
      'Packed',
      'Shipment Created',
      'Shipped',
      'Out for Delivery',
      'Delivered',
    ];

    const totalRevenue = ordersList
      .filter((o) => paidStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const ordersByStatus = {};
    ordersList.forEach((o) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    const lowStockProducts = productsList.filter((p) => (p.stockQuantity ?? 100) < lowStockThreshold);

    return res.status(200).json({
      status: 'success',
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        ordersByStatus,
        lowStockProducts,
        lowStockThreshold,
      },
    });
  }
});

module.exports = {
  getDashboardStats,
};
