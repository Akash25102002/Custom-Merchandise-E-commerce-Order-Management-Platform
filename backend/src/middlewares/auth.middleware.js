const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Unauthorized request. No token provided.');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await userRepository.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Access Token');
  }
});

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden. Admin access required.');
  }
  next();
};

module.exports = {
  verifyJWT,
  isAdmin
};
