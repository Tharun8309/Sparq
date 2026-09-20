const router = require('express').Router();
const {
  getNearbyPincodes,
  updateNearbyPincode,
  deleteNearbyPincode,
  getCourierPincodes,
  updateCourierPincode
} = require('../controllers/deliveryController');

router.get('/nearby', getNearbyPincodes);
router.post('/nearby', updateNearbyPincode);
router.delete('/nearby/:id', deleteNearbyPincode); // <--- ADDED

router.get('/courier', getCourierPincodes);
router.post('/courier', updateCourierPincode);

module.exports = router;
