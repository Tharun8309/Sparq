const path = require('path');
const dotenv = require('dotenv');

// Explicitly load server/.env or root .env (for local development)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sparq_fireworks',
  jwtSecret: process.env.JWT_SECRET || 'sparq_fallback_dev_secret_key_needs_change_32_chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // In production across two Vercel domains, cookies MUST be 'none' with secure: true
  cookieSameSite: process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax'),
  cookieSecure: isProduction,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  adminUsername: process.env.ADMIN_USERNAME || 'sparqadmin',
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || 'SparqCelebrations@2026',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
};

module.exports = config;