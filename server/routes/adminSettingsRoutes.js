const router = require('express').Router();
const { updateSettings } = require('../controllers/settingsController');
router.put('/', updateSettings);
module.exports = router;
