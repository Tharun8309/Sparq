const jwt = require('jsonwebtoken');
const config = require('../config/env');
const Admin = require('../models/Admin');
const { sendError } = require('../utils/apiResponse');

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.sparq_admin_token;
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
};

module.exports = { requireAdmin };
