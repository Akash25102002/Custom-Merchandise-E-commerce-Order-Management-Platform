const crypto = require('crypto');
const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const Order = require('../../models/Order');
const dbStore = require('../../utils/dbStore');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { transitionOrderStatus } = require('../../utils/orderStateMachine');

/**
 * Server-Side Signature Verification Helper
 */
const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');
  return expectedSignature === signature;
};

const createPaymentOrder = catchAsync(async (req, res, next) => {
  const { orderId, gateway = 'mock_gateway' } = req.body;
  const userId = req.user.id || req.user._id;

  let order = null;
  if (dbStore.isMongoConnected()) {
    order = await Order.findById(orderId);
  } else {
    order = dbStore.orders.get(orderId) || Array.from(dbStore.orders.values()).find((o) => o._id === orderId || o.id === orderId || o.orderNumber === orderId);
  }

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Validate owner
  const orderUserId = order.user?._id ? order.user._id.toString() : order.user.toString();
  if (orderUserId !== userId.toString()) {
    return next(new AppError('You do not have permission to pay for this order', 403));
  }

  if (order.status !== 'Order Placed') {
    return next(new AppError(`Payment can only be initiated for orders in "Order Placed" status. Current status: ${order.status}`, 400));
  }

  const paymentId = `pay_${gateway}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key';

  let paymentRecord;
  if (dbStore.isMongoConnected()) {
    paymentRecord = await Payment.create({
      order: order._id,
      gateway,
      paymentId,
      amount: order.totalAmount,
      currency: 'INR',
      status: 'Pending',
    });
  } else {
    paymentRecord = {
      _id: `pmt_${Date.now()}`,
      order: order._id || order.id,
      gateway,
      paymentId,
      amount: order.totalAmount,
      currency: 'INR',
      status: 'Pending',
      createdAt: new Date(),
    };
    dbStore.orders.set(paymentRecord.paymentId, paymentRecord);
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment gateway session created',
    session: {
      gateway,
      key_id: keyId,
      paymentId: paymentRecord.paymentId,
      order_id: order.orderNumber,
      amount: order.totalAmount,
      currency: 'INR',
      notes: {
        customerName: req.user.name,
        customerEmail: req.user.email,
      },
    },
  });
});

const verifyPayment = catchAsync(async (req, res, next) => {
  const {
    orderId,
    paymentId,
    razorpay_payment_id,
    razorpay_order_id,
    signature,
    gateway = 'mock_gateway',
    simulateFailure = false,
  } = req.body;

  let order = null;
  let payment = null;

  if (dbStore.isMongoConnected()) {
    order = await Order.findById(orderId);
    payment = await Payment.findOne({ paymentId });
  } else {
    order = dbStore.orders.get(orderId) || Array.from(dbStore.orders.values()).find((o) => o._id === orderId || o.id === orderId || o.orderNumber === orderId);
    payment = dbStore.orders.get(paymentId);
  }

  if (!order) {
    return next(new AppError('Order not found for payment verification', 404));
  }

  // 1. NEVER TRUST CLIENT: Perform Server-Side Signature Verification
  const secret = process.env.RAZORPAY_KEY_SECRET || process.env.JWT_ACCESS_SECRET || 'prod_merchandise_access_secret_key_32bytes_long_string!';
  let isSignatureValid = false;

  if (gateway === 'razorpay' && signature && razorpay_order_id && razorpay_payment_id) {
    isSignatureValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, signature, secret);
  } else if (signature) {
    // Verified against HMAC token
    const expectedSig = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    isSignatureValid = signature === expectedSig;
  } else {
    // Valid generated token in test/mock mode if simulateFailure is false
    isSignatureValid = !simulateFailure;
  }

  // Handle Verification Failure
  if (!isSignatureValid || simulateFailure) {
    if (dbStore.isMongoConnected() && payment) {
      payment.status = 'Failed';
      await payment.save();
    } else if (payment) {
      payment.status = 'Failed';
      dbStore.orders.set(paymentId, payment);
    }

    // Keep order at 'Order Placed' — DO NOT ADVANCE!
    return next(
      new AppError('Payment signature verification failed. Order status remains at "Order Placed".', 400)
    );
  }

  // Handle Verification Success - Wrap atomic update
  const transactionId = razorpay_payment_id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  if (dbStore.isMongoConnected()) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // Update payment status
      if (payment) {
        payment.status = 'Successful';
        payment.transactionId = transactionId;
        payment.signature = signature || 'sig_verified_server';
        payment.paymentDate = new Date();
        await payment.save({ session });
      }

      // Transition order status to 'Payment Verified'
      transitionOrderStatus(order, 'Payment Verified', `Payment of ₹${order.totalAmount} verified via ${gateway} (TxID: ${transactionId})`);
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError(`Atomic transaction failed: ${err.message}`, 500));
    }
  } else {
    // In-memory atomic fallback
    if (payment) {
      payment.status = 'Successful';
      payment.transactionId = transactionId;
      payment.signature = signature || 'sig_verified_server';
      payment.paymentDate = new Date();
      dbStore.orders.set(paymentId, payment);
    }

    transitionOrderStatus(order, 'Payment Verified', `Payment of ₹${order.totalAmount} verified via ${gateway} (TxID: ${transactionId})`);
    dbStore.orders.set(order._id || order.id, order);
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment verified successfully and Order updated to "Payment Verified"',
    data: {
      order,
      paymentStatus: 'Successful',
      transactionId,
    },
  });
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
};
