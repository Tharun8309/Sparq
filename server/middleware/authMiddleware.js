// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const Admin = require('../models/Admin');
const { sendError } = require('../utils/apiResponse');

async function requireAdminAuth(req, res, next) {
  try {
    let token = req.cookies?.token;

    // Check Authorization header if cookie wasn't forwarded
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const admin = await Admin.findById(decoded.id).select('-passwordHash');

    if (!admin) {
      return sendError(res, 'Invalid admin session', 'UNAUTHORIZED', 401);
    }

    req.admin = admin;
    next();
  } catch (err) {
    return sendError(res, 'Session expired or invalid', 'UNAUTHORIZED', 401);
  }
}

module.exports = { requireAdminAuth };