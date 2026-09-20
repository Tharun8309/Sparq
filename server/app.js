const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requireAdmin } = require('./middleware/authMiddleware');

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration for cookies & credentials
const allowedOrigins = [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173','https://spark-client-six.vercel.app','https://spark-client-six.vercel.app/'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback for preview deployments
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use('/api/', apiLimiter);

// Public API Routes
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Admin Authentication Route
app.use('/api/auth/admin', require('./routes/adminAuthRoutes'));

// Protected Admin Management Routes
app.use('/api/admin/products', requireAdmin, require('./routes/adminProductRoutes'));
app.use('/api/admin/delivery', requireAdmin, require('./routes/adminDeliveryRoutes'));
app.use('/api/admin/orders', requireAdmin, require('./routes/adminOrderRoutes'));
app.use('/api/admin/settings', requireAdmin, require('./routes/adminSettingsRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, status: 'Sparq API Operational' }));

// Global Error Handler
app.use(errorHandler);

module.exports = app;
