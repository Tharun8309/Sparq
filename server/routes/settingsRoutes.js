const router = require('express').Router();
const { getSettings } = require('../controllers/settingsController');
router.get('/', getSettings);
module.exports = router;
