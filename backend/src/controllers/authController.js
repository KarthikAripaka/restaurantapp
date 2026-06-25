const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const DeliveryBoy = require('../models/DeliveryBoy');
const Settings = require('../models/Settings');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id, role) =>
  jwt.sign(role ? { id, role } : { id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const createSendToken = (restaurant, statusCode, res) => {
  const token = signToken(restaurant._id);

  res.status(statusCode).json({
    success: true,
    token,
    data: { restaurant },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const restaurant = await Restaurant.findOne({
    ownerEmail: email.toLowerCase(),
  }).select('+password');

  if (!restaurant || !(await restaurant.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!restaurant.isActive) {
    return next(new AppError('This account has been deactivated', 403));
  }

  restaurant.password = undefined;
  createSendToken(restaurant, 200, res);
});

exports.getMe = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.restaurant._id);
  res.status(200).json({
    success: true,
    data: { restaurant },
  });
});

exports.verifyToken = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: { restaurant: req.restaurant },
  });
});

// ── Delivery rider auth ───────────────────────────────────────────────────────

exports.riderLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const rider = await DeliveryBoy.findOne({ email: email.toLowerCase() }).select('+password');

  if (!rider || !(await rider.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!rider.isActive) {
    return next(new AppError('Your account has been deactivated. Contact the restaurant admin.', 403));
  }

  const token = signToken(rider._id, 'rider');
  rider.password = undefined;

  res.status(200).json({
    success: true,
    token,
    data: { rider },
  });
});

exports.getRiderMe = catchAsync(async (req, res, next) => {
  const rider = await DeliveryBoy.findById(req.rider._id);
  res.status(200).json({
    success: true,
    data: { rider },
  });
});
