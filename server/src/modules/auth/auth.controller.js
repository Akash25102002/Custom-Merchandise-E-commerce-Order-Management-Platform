const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const dbStore = require('../../utils/dbStore');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

const signAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_ACCESS_SECRET || 'prod_merchandise_access_secret_key_32bytes_long_string!',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

const signRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'prod_merchandise_refresh_secret_key_32bytes_long_string!',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const sendTokenResponse = async (user, statusCode, res) => {
  const userId = user._id || user.id;
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  if (dbStore.isMongoConnected() && user.save) {
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
  } else {
    const memoryUser = dbStore.users.get(userId.toString());
    if (memoryUser) {
      memoryUser.refreshToken = refreshToken;
      dbStore.users.set(userId.toString(), memoryUser);
    }
  }

  // Options for HttpOnly refresh cookie (~7 days)
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  const userRes = {
    id: userId,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    user: userRes,
  });
};

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  let existingUser = null;
  if (dbStore.isMongoConnected()) {
    existingUser = await User.findOne({ email });
  } else {
    existingUser = Array.from(dbStore.users.values()).find((u) => u.email === email.toLowerCase());
  }

  if (existingUser) {
    return next(new AppError('Email is already registered!', 400));
  }

  // Self-registration forces 'customer' role only
  let newUser;
  if (dbStore.isMongoConnected()) {
    newUser = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'customer',
    });
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    const mockId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    newUser = {
      _id: mockId,
      id: mockId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      createdAt: new Date(),
    };
    dbStore.users.set(mockId, newUser);
  }

  await sendTokenResponse(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  let user = null;
  let isPasswordCorrect = false;

  if (dbStore.isMongoConnected()) {
    user = await User.findOne({ email }).select('+password');
    if (user) {
      isPasswordCorrect = await user.correctPassword(password, user.password);
    }
  } else {
    user = Array.from(dbStore.users.values()).find((u) => u.email === email.toLowerCase());
    if (user) {
      isPasswordCorrect = await bcrypt.compare(password, user.password);
    }
  }

  // Generic non-enumerating error message
  if (!user || !isPasswordCorrect) {
    return next(new AppError('Invalid email or password', 401));
  }

  await sendTokenResponse(user, 200, res);
});

const refreshToken = catchAsync(async (req, res, next) => {
  let token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new AppError('Refresh token is required', 400));
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || 'prod_merchandise_refresh_secret_key_32bytes_long_string!'
  );

  let user = null;
  if (dbStore.isMongoConnected()) {
    user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid or expired refresh token. Please login again.', 401));
    }
  } else {
    user = dbStore.users.get(decoded.id);
    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid or expired refresh token. Please login again.', 401));
    }
  }

  await sendTokenResponse(user, 200, res);
});

const logout = catchAsync(async (req, res, next) => {
  if (req.user) {
    if (dbStore.isMongoConnected() && req.user.save) {
      req.user.refreshToken = undefined;
      await req.user.save({ validateBeforeSave: false });
    } else {
      const memoryUser = dbStore.users.get(req.user.id);
      if (memoryUser) {
        memoryUser.refreshToken = undefined;
        dbStore.users.set(req.user.id, memoryUser);
      }
    }
  }

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
