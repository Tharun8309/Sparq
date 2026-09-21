const router = require('express').Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', requireAdminAuth, createCategory);
router.delete('/:id', requireAdminAuth, deleteCategory);

module.exports = router;