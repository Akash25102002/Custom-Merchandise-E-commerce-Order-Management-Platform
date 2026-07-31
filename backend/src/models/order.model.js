const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  customization: {
    color: { type: String, required: true },
    colorHex: { type: String },
    size: { type: String, required: true },
    printArea: { type: String, enum: ['front', 'back', 'both'], default: 'front' },
    customText: { type: String, default: '' },
    textFont: { type: String },
    textColor: { type: String },
    logoUrl: { type: String, default: null },
  },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'Pending',
      'Payment Confirmed',
      'Production',
      'Quality Check',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ],
    required: true,
  },
  note: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: 'USA' },
    },
    shippingMethod: {
      type: String,
      enum: ['Standard', 'Express', 'Overnight'],
      default: 'Standard',
    },
    shippingFee: { type: Number, required: true, default: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    taxFee: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentInfo: {
      provider: { type: String, enum: ['Mock Gateway', 'Stripe', 'Razorpay', 'COD'], default: 'Mock Gateway' },
      status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
      transactionId: { type: String, default: '' },
      paidAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Payment Confirmed',
        'Production',
        'Quality Check',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
      ],
      default: 'Pending',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    trackingId: { type: String, default: '' },
    carrier: { type: String, default: 'MerchStudio Logistics' },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
