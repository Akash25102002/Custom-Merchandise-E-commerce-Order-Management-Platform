const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result
  });
});

const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by verifyJWT middleware
  res.status(200).json({
    success: true,
    message: "User details retrieved successfully",
    data: { user: req.user }
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
  const result = await authService.refreshAccessToken(incomingRefreshToken);

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    data: result
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);

  res.status(200).json({
    success: true,
    message: "User logged out successfully"
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: result.message,
    data: result
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const result = await authService.resetPassword(resetToken, newPassword);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = {
  register,
  login,
  getMe,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword
};

