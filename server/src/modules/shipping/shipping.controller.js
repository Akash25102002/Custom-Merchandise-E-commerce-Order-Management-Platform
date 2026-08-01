const Shipping = require('../../models/Shipping');
const Order = require('../../models/Order');
const dbStore = require('../../utils/dbStore');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const courierService = require('./shipping.service');
const { transitionOrderStatus } = require('../../utils/orderStateMachine');

const createShipment = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  let order = null;
  if (dbStore.isMongoConnected()) {
    order = await Order.findById(orderId);
  } else {
    order = dbStore.orders.get(orderId) || Array.from(dbStore.orders.values()).find((o) => o._id === orderId || o.id === orderId || o.orderNumber === orderId);
  }

  if (!order) {
    return next(new AppError('Order not found for shipment creation', 404));
  }

  // Creating shipment is the ONLY way to transition order to "Shipment Created"
  if (order.status !== 'Packed' && order.status !== 'Shipment Created') {
    return next(
      new AppError(
        `Shipment can only be created when order is in "Packed" status. Current status: "${order.status}"`,
        400
      )
    );
  }

  // Call mock courier provider service
  const shipmentData = await courierService.createShipment(order, order.shippingAddress);

  let shippingRecord;
  if (dbStore.isMongoConnected()) {
    // Check if shipment already exists
    shippingRecord = await Shipping.findOne({ order: order._id });
    if (!shippingRecord) {
      shippingRecord = await Shipping.create({
        order: order._id,
        courierName: shipmentData.courierName,
        trackingNumber: shipmentData.trackingNumber,
        shipmentId: shipmentData.shipmentId,
        estimatedDeliveryDate: shipmentData.estimatedDeliveryDate,
        status: shipmentData.status,
        trackingTimeline: shipmentData.trackingTimeline,
      });
    }

    // Transition order state machine to "Shipment Created"
    if (order.status !== 'Shipment Created') {
      transitionOrderStatus(
        order,
        'Shipment Created',
        `Shipment created via ${shipmentData.courierName} (AWB Tracking: ${shipmentData.trackingNumber})`
      );
      order.shippingId = shipmentData.trackingNumber;
      await order.save();
    }
  } else {
    // In-memory fallback
    shippingRecord = {
      _id: `shp_${Date.now()}`,
      order: order._id || order.id,
      courierName: shipmentData.courierName,
      trackingNumber: shipmentData.trackingNumber,
      shipmentId: shipmentData.shipmentId,
      estimatedDeliveryDate: shipmentData.estimatedDeliveryDate,
      status: shipmentData.status,
      trackingTimeline: shipmentData.trackingTimeline,
      createdAt: new Date(),
    };

    dbStore.orders.set(shippingRecord.trackingNumber, shippingRecord);

    if (order.status !== 'Shipment Created') {
      transitionOrderStatus(
        order,
        'Shipment Created',
        `Shipment created via ${shipmentData.courierName} (AWB Tracking: ${shipmentData.trackingNumber})`
      );
      order.shippingId = shipmentData.trackingNumber;
      dbStore.orders.set(order._id || order.id, order);
    }
  }

  res.status(201).json({
    status: 'success',
    message: 'Courier shipment created and Order transitioned to "Shipment Created"',
    data: {
      shipment: shippingRecord,
      order,
    },
  });
});

const getPublicTracking = catchAsync(async (req, res, next) => {
  const { trackingId } = req.params;

  let shipment = null;
  let order = null;

  if (dbStore.isMongoConnected()) {
    shipment = await Shipping.findOne({
      $or: [{ trackingNumber: trackingId }, { shipmentId: trackingId }],
    }).populate('order', 'orderNumber status shippingAddress items totalAmount createdAt');
  } else {
    shipment =
      dbStore.orders.get(trackingId) ||
      Array.from(dbStore.orders.values()).find(
        (s) => s.trackingNumber === trackingId || s.shipmentId === trackingId
      );

    if (shipment) {
      order = dbStore.orders.get(shipment.order) || Array.from(dbStore.orders.values()).find((o) => o._id === shipment.order);
    }
  }

  if (!shipment) {
    return next(new AppError('No shipment or tracking record found with that tracking ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      courierName: shipment.courierName,
      trackingNumber: shipment.trackingNumber,
      shipmentId: shipment.shipmentId,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      status: shipment.status,
      trackingTimeline: shipment.trackingTimeline,
      orderNumber: shipment.order?.orderNumber || order?.orderNumber || 'ORD-MERCH',
    },
  });
});

module.exports = {
  createShipment,
  getPublicTracking,
};
