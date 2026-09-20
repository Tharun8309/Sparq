const router = require('express').Router();
const { checkPincode } = require('../controllers/deliveryController');
router.get('/check', checkPincode);
module.exports = router;
