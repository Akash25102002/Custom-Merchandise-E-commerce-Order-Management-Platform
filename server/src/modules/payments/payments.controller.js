const crypto = require('crypto');
const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const Order = require('../../models/Order');
const dbStore = require('../../utils/dbStore');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { transitionOrderStatus } = require('../../utils/orderStateMachine');

/**
 * Server-Side Signature Verification Helper for Razorpay
 * Signature payload must strictly be: razorpay_order_id + "|" + razorpay_payment_id
 * Secret must be RAZORPAY_KEY_SECRET (never RAZORPAY_KEY_ID or JWT_ACCESS_SECRET)
 */
const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, signature, secret) => {
  if (!secret) {
    console.error('❌ [Razorpay Verification Error]: RAZORPAY_KEY_SECRET is undefined or missing in process.env!');
    return { isValid: false, reason: 'RAZORPAY_KEY_SECRET is not configured on the server environment' };
  }

  if (!razorpayOrderId || !razorpayPaymentId || !signature) {
    console.error('❌ [Razorpay Verification Error]: Missing required fields for signature calculation.', {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      signature: signature ? 'PRESENT' : 'MISSING',
    });
    return { isValid: false, reason: 'Missing required Razorpay parameters (razorpay_order_id, razorpay_payment_id, or signature)' };
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  let isValid = false;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch (e) {
    isValid = expectedSignature === signature;
  }

  if (!isValid) {
    console.error('❌ [Razorpay Signature Mismatch]: Computed HMAC digest does not match received signature!', {
      payload,
      expectedSignature,
      receivedSignature: signature,
      secretPrefix: secret.substring(0, 4) + '***',
    });
    return { isValid: false, reason: 'HMAC signature mismatch. Verify that RAZORPAY_KEY_SECRET matches the Razorpay dashboard mode (Test vs Live).' };
  }

  console.log('✅ [Razorpay Signature Verified]: HMAC SHA256 digest matched successfully.');
  return { isValid: true };
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
    paymentId: inputPaymentId,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    signature: directSignature,
    gateway = 'mock_gateway',
    simulateFailure = false,
  } = req.body;

  const effectivePaymentId = inputPaymentId || razorpay_payment_id;
  const signature = razorpay_signature || directSignature;

  console.log('🔍 [Payment Verify Request Received]:', {
    orderId,
    paymentId: effectivePaymentId,
    razorpay_order_id,
    razorpay_payment_id,
    signatureReceived: !!signature,
    gateway,
    keyIdPrefix: (process.env.RAZORPAY_KEY_ID || 'UNSET').substring(0, 9),
    simulateFailure,
  });

  let order = null;
  let payment = null;

  if (dbStore.isMongoConnected()) {
    order = await Order.findById(orderId);
    if (effectivePaymentId) {
      payment = await Payment.findOne({ paymentId: effectivePaymentId });
    }
  } else {
    order = dbStore.orders.get(orderId) || Array.from(dbStore.orders.values()).find((o) => o._id === orderId || o.id === orderId || o.orderNumber === orderId);
    if (effectivePaymentId) {
      payment = dbStore.orders.get(effectivePaymentId);
    }
  }

  if (!order) {
    console.error('❌ [Payment Verification Error]: Order not found in database.', { orderId });
    return next(new AppError('Order not found for payment verification', 404));
  }

  // Verification outcome determination
  let isSignatureValid = false;
  let failureReason = '';

  if (simulateFailure) {
    isSignatureValid = false;
    failureReason = 'Simulated verification failure explicitly triggered by test mode button.';
    console.warn('⚠️ [Payment Verification]: Simulated test failure triggered.');
  } else if (gateway === 'razorpay') {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      // In local dev mock mode when key is unconfigured, allow mock authorization with warning
      if (process.env.NODE_ENV !== 'production' && (!signature || signature.startsWith('sig_verified_'))) {
        console.warn('⚠️ [Razorpay Warning]: RAZORPAY_KEY_SECRET unconfigured in local dev environment. Falling back to test mock signature authorization.');
        isSignatureValid = true;
      } else {
        isSignatureValid = false;
        failureReason = 'RAZORPAY_KEY_SECRET environment variable is missing on server.';
        console.error('❌ [Razorpay Error]: RAZORPAY_KEY_SECRET is missing from environment variables.');
      }
    } else {
      const verifyResult = verifyRazorpaySignature(razorpay_order_id || order.orderNumber, razorpay_payment_id || effectivePaymentId, signature, secret);
      isSignatureValid = verifyResult.isValid;
      failureReason = verifyResult.reason || '';
    }
  } else {
    // Standard HMAC / Test mode gateway logic
    if (signature && signature.startsWith('sig_verified_')) {
      isSignatureValid = true;
    } else if (signature) {
      const secret = process.env.RAZORPAY_KEY_SECRET || process.env.JWT_ACCESS_SECRET || 'fallback_secret';
      const expectedSig = crypto.createHmac('sha256', secret).update(`${orderId}|${effectivePaymentId}`).digest('hex');
      isSignatureValid = signature === expectedSig;
      if (!isSignatureValid) {
        failureReason = 'HMAC signature verification failed.';
      }
    } else {
      isSignatureValid = !simulateFailure;
    }
  }

  // Handle Verification Failure
  if (!isSignatureValid) {
    console.error('❌ [Payment Verification Failed]:', {
      orderId,
      orderStatus: order.status,
      failureReason: failureReason || 'Invalid signature or authentication token.',
    });

    if (dbStore.isMongoConnected() && payment) {
      payment.status = 'Failed';
      await payment.save();
    } else if (payment) {
      payment.status = 'Failed';
      dbStore.orders.set(effectivePaymentId, payment);
    }

    // Keep order at 'Order Placed' — DO NOT ADVANCE!
    return next(
      new AppError(`Payment signature verification failed: ${failureReason || 'Invalid signature'}. Order status remains at "Order Placed".`, 400)
    );
  }

  // Handle Verification Success - Wrap atomic update
  const transactionId = razorpay_payment_id || effectivePaymentId || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const actualSignature = signature || 'sig_verified_server';

  if (dbStore.isMongoConnected()) {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // Update payment status
      if (payment) {
        payment.status = 'Successful';
        payment.transactionId = transactionId;
        payment.signature = actualSignature;
        payment.paymentDate = new Date();
        await payment.save({ session });
      }

      // Transition order status to 'Payment Verified'
      transitionOrderStatus(
        order,
        'Payment Verified',
        `Payment of ₹${order.totalAmount} verified via ${gateway} (TxID: ${transactionId})`
      );
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();
      console.log('✅ [Payment Transaction Committed]: Order status advanced to "Payment Verified".');
    } catch (txErr) {
      if (session) {
        try { await session.abortTransaction(); } catch (e) {}
        session.endSession();
      }

      // Handle standalone Mongo instance fallback where replica set transactions aren't supported
      if (txErr.message && (txErr.message.includes('replica set') || txErr.message.includes('Transaction numbers'))) {
        console.warn('⚠️ MongoDB Transactions not supported on standalone local instance, executing sequential update.');
        if (payment) {
          payment.status = 'Successful';
          payment.transactionId = transactionId;
          payment.signature = actualSignature;
          payment.paymentDate = new Date();
          await payment.save();
        }
        transitionOrderStatus(
          order,
          'Payment Verified',
          `Payment of ₹${order.totalAmount} verified via ${gateway} (TxID: ${transactionId})`
        );
        await order.save();
      } else {
        console.error('❌ [Atomic Transaction Exception]:', txErr);
        return next(new AppError(`Atomic payment transaction failed: ${txErr.message}`, 500));
      }
    }
  } else {
    // In-memory atomic fallback
    if (payment) {
      payment.status = 'Successful';
      payment.transactionId = transactionId;
      payment.signature = actualSignature;
      payment.paymentDate = new Date();
      dbStore.orders.set(effectivePaymentId, payment);
    }

    transitionOrderStatus(
      order,
      'Payment Verified',
      `Payment of ₹${order.totalAmount} verified via ${gateway} (TxID: ${transactionId})`
    );
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
