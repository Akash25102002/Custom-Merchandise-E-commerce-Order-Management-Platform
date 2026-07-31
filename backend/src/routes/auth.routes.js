const { Router } = require('express');
const { 
  register, 
  login, 
  getMe, 
  refreshAccessToken, 
  logout, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', verifyJWT, getMe);
router.post('/refresh', refreshAccessToken);
router.post('/logout', verifyJWT, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

