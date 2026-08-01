const express = require('express');
const cartController = require('./cart.controller');
const { addItemRules, updateItemRules } = require('./cart.validation');
const validateExpress = require('../../middleware/expressValidator.middleware');
const { protect } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router.get('/', cartController.getCart);
router.post('/', addItemRules, validateExpress, cartController.addToCart);
router.put('/:itemId', updateItemRules, validateExpress, cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);

// Customer Artwork upload endpoint
router.post('/upload-artwork', upload.single('artwork'), cartController.uploadArtwork);

module.exports = router;
