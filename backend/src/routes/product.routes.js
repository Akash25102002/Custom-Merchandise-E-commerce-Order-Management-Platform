const { Router } = require('express');
const {
  createCategory,
  getCategories,
  deleteCategory,
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { validateCategory, validateProduct } = require('../validators/product.validator');
const { verifyJWT, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = Router();

// Category CRUD endpoints
router.get('/categories', getCategories);
router.post('/categories', verifyJWT, isAdmin, validateCategory, createCategory);
router.delete('/categories/:id', verifyJWT, isAdmin, deleteCategory);

// Product CRUD endpoints
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', verifyJWT, isAdmin, upload.single('image'), validateProduct, createProduct);
router.put('/:id', verifyJWT, isAdmin, upload.single('image'), validateProduct, updateProduct);
router.delete('/:id', verifyJWT, isAdmin, deleteProduct);

module.exports = router;
