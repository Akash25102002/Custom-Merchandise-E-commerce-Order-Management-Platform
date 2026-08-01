const express = require('express');
const productsController = require('./products.controller');
const { createProductRules, createCategoryRules } = require('./products.validation');
const validateExpress = require('../../middleware/expressValidator.middleware');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();

// Public Routes
router.get('/products', productsController.getProducts);
router.get('/products/:id', productsController.getProductById);
router.get('/categories', productsController.getCategories);

// Admin Protected Product Mutating Routes
router.post(
  '/products',
  protect,
  restrictTo('admin'),
  upload.array('images', 5),
  createProductRules,
  validateExpress,
  productsController.createProduct
);

router.put(
  '/products/:id',
  protect,
  restrictTo('admin'),
  upload.array('images', 5),
  productsController.updateProduct
);

router.delete(
  '/products/:id',
  protect,
  restrictTo('admin'),
  productsController.deleteProduct
);

// Admin Protected Category Mutating Routes
router.post(
  '/categories',
  protect,
  restrictTo('admin'),
  createCategoryRules,
  validateExpress,
  productsController.createCategory
);

module.exports = router;
