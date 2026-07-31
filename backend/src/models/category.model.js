const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate clean URL slug
categorySchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
