const router = require('express').Router();
const {
  createProduct,
  updateProduct,
  uploadProductImage,
  removeProductImage,
  deleteProduct
} = require('../controllers/productController');
const upload = require('../middleware/multerUpload');
const { sendError } = require('../utils/apiResponse');

// Safe multer wrapper preventing abrupt connection resets on malformed parts
const handleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.error('[Multer Middleware Error]:', err.message);
      return sendError(res, err.message, 'FILE_UPLOAD_ERROR', 400);
    }
    next();
  });
};

router.post('/', handleUpload('image'), createProduct);
router.put('/:id', updateProduct);
router.post('/:id/images', handleUpload('image'), uploadProductImage);
router.delete('/:id/images', removeProductImage);
router.delete('/:id', deleteProduct);

module.exports = router;