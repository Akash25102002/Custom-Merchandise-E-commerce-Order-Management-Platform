const express = require('express');
const authController = require('./auth.controller');
const { registerRules, loginRules } = require('./auth.validation');
const validateExpress = require('../../middleware/expressValidator.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerRules, validateExpress, authController.register);
router.post('/login', loginRules, validateExpress, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
