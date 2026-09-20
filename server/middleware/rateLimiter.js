const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  handler: (req, res) => {
    sendError(res, 'Too many requests, please slow down', 'RATE_LIMITED', 429);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    sendError(res, 'Too many login attempts, please try again later', 'AUTH_RATE_LIMITED', 429);
  }
});

const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  handler: (req, res) => {
    sendError(res, 'Order creation limit reached. Please wait a few moments.', 'ORDER_RATE_LIMITED', 429);
  }
});

module.exports = { apiLimiter, authLimiter, orderLimiter };
