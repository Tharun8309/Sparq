const router = require('express').Router();
const { login, logout, getMe, changePassword } = require('../controllers/adminAuthController');
const { requireAdmin } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAdmin, getMe);
router.post('/change-password', requireAdmin, changePassword);

module.exports = router;
