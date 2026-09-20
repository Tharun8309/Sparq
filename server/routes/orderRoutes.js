const router = require('express').Router();
const { createOrder } = require('../controllers/orderController');
const { orderLimiter } = require('../middleware/rateLimiter');
router.post('/', orderLimiter, createOrder);
module.exports = router;
