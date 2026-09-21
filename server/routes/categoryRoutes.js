const router = require('express').Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', requireAdmin, createCategory);
router.delete('/:id', requireAdmin, deleteCategory);

module.exports = router;