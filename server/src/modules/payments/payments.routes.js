const express = require('express');
const paymentsController = require('./payments.controller');
const { createPaymentRules, verifyPaymentRules } = require('./payments.validation');
const validateExpress = require('../../middleware/expressValidator.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/create', createPaymentRules, validateExpress, paymentsController.createPaymentOrder);
router.post('/verify', verifyPaymentRules, validateExpress, paymentsController.verifyPayment);

module.exports = router;
