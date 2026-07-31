const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    availableSizes: {
      type: [String],
      default: [],
    },
    availableColors: {
      type: [String],
      default: [],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    SKU: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      index: true,
    },
    printType: {
      type: [String],
      enum: ['Screen Printing', 'DTF Printing', 'Sublimation', 'Embroidery', 'UV Printing'],
      required: [true, 'At least one print type is required'],
    },
    productType: {
      type: String,
      enum: ['T-Shirts', 'Hoodies', 'Caps', 'Mugs', 'Bottles', 'Tote Bags', 'Stickers'],
      required: [true, 'Product type is required'],
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
