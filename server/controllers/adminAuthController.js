const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/env');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const isProduction = process.env.NODE_ENV === 'production';

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return sendError(res, 'Username and password are required', 'BAD_REQUEST', 400);
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    
    // Guard against undefined hash comparison error
    if (!admin || !admin.passwordHash) {
      return sendError(res, 'Invalid username or password', 'INVALID_CREDENTIALS', 401);
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid username or password', 'INVALID_CREDENTIALS', 401);
    }

    const token = jwt.sign({ id: admin._id, username: admin.username }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });

    const isProd = config.nodeEnv === 'production';
res.cookie('token', token, {
  httpOnly: true,
  secure: isProduction,               // MUST be true in production on Vercel (HTTPS)
  sameSite: isProduction ? 'none' : 'lax', // MUST be 'none' across separate Vercel domains
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
});

    return sendSuccess(res, { username: admin.username });
  } catch (err) {
    return sendError(res, err.message, 'LOGIN_ERROR', 500);
  }
};

const logout = async (req, res) => {
  const isProd = config.nodeEnv === 'production';
res.clearCookie('token', {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/'
});
  return sendSuccess(res, { loggedOut: true });
};

const getMe = async (req, res) => {
  return sendSuccess(res, { admin: req.admin });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required', 'BAD_REQUEST', 400);
    }
    if (newPassword.length < 8) {
      return sendError(res, 'New password must be at least 8 characters long', 'BAD_REQUEST', 400);
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin || !admin.passwordHash) {
      return sendError(res, 'Admin account corrupted', 'SERVER_ERROR', 500);
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Current password does not match', 'INVALID_CREDENTIALS', 400);
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await admin.save();

    // Clear active session to mandate re-login
    const isProd = config.nodeEnv === 'production';
    res.clearCookie('sparq_admin_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: config.cookieSameSite
    });

return sendSuccess(res, {
  admin: {
    id: admin._id,
    username: admin.username,
    role: admin.role
  },
  token // <--- Include token in response body
}, 200, 'Login successful');  } catch (err) {
    return sendError(res, err.message, 'CHANGE_PASSWORD_ERROR', 500);
  }
};

module.exports = { login, logout, getMe, changePassword };
