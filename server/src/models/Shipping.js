const mongoose = require('mongoose');

const trackingTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    location: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    courierName: {
      type: String,
      required: true,
      default: 'Delhivery Surface Express',
    },
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    shipmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Manifested', 'In Transit', 'Out for Delivery', 'Delivered', 'RTO'],
      default: 'Manifested',
      index: true,
    },
    trackingTimeline: [trackingTimelineSchema],
  },
  {
    timestamps: true,
  }
);

const Shipping = mongoose.model('Shipping', shippingSchema);
module.exports = Shipping;
