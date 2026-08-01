const express = require('express');
const adminController = require('./admin.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/customers', adminController.getCustomers);

module.exports = router;
