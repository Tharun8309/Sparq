const router = require('express').Router();
const { getOrdersAdmin, updateOrderStatus, getDashboardStats } = require('../controllers/orderController');

router.get('/', getOrdersAdmin);
router.get('/stats', getDashboardStats);
router.put('/:id/status', updateOrderStatus);

module.exports = router;
