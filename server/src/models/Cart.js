const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
    },
    color: {
      name: { type: String, required: true },
      hex: { type: String, required: true },
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    printType: {
      type: String,
      required: [true, 'Print type is required'],
    },
    printLocation: {
      type: String,
      enum: ['front', 'back', 'left-sleeve', 'right-sleeve', 'center', 'wrap'],
      default: 'front',
    },
    designImageUrl: {
      type: String,
      default: '',
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    lineTotal: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingEstimate: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method: Recalculate totals live
cartSchema.methods.recalculateTotals = function () {
  this.subtotal = this.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  this.tax = Math.round(this.subtotal * 0.18); // 18% GST tax rate
  this.shippingEstimate = this.subtotal > 1499 || this.subtotal === 0 ? 0 : 99; // Free shipping over 1499
  this.grandTotal = this.subtotal + this.tax + this.shippingEstimate;
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
