const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const { isValidObjectId } = require('../utils/safeId');
const { validateProductInput } = require('../validation/productValidation');
const { uploadImageStream, deleteImage } = require('../services/cloudinaryService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Robust Category Filter Resolver: resolves ObjectId, slug, or Name
async function resolveCategoryId(categoryParam) {
  if (!categoryParam) return null;
  if (isValidObjectId(categoryParam)) {
    return categoryParam;
  }
  const categoryDoc = await Category.findOne({
    $or: [{ slug: categoryParam.toLowerCase() }, { name: new RegExp(`^${categoryParam}$`, 'i') }]
  });
  return categoryDoc ? categoryDoc._id : null;
}

const getProducts = async (req, res) => {
  try {
    const { category, search, available, featured, sort, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category) {
      const resolvedCatId = await resolveCategoryId(category);
      if (resolvedCatId) {
        query.category = resolvedCatId;
      } else {
        // Safe return empty if non-existent category query passed
        return sendSuccess(res, {
          items: [],
          pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0 }
        });
      }
    }

    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    if (available !== undefined && available !== '') {
      query.isAvailable = available === 'true';
    }

    if (featured !== undefined && featured !== '') {
      query.isFeatured = featured === 'true';
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { sellingPrice: 1 };
    if (sort === 'price_desc') sortOption = { sellingPrice: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'name_desc') sortOption = { name: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Format category fallbacks safely
    const normalizedItems = (items || []).map(p => ({
      ...p,
      category: p.category || { name: 'Sparq Fireworks', slug: 'sparq-fireworks' }
    }));

    return sendSuccess(res, {
      items: normalizedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 0
      }
    });
  } catch (err) {
    return sendError(res, err.message, 'GET_PRODUCTS_ERROR', 500);
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return sendError(res, 'Product not found', 'NOT_FOUND', 404);
    }

    product.category = product.category || { name: 'Sparq Fireworks', slug: 'sparq-fireworks' };
    return sendSuccess(res, product);
  } catch (err) {
    return sendError(res, err.message, 'GET_PRODUCT_SLUG_ERROR', 500);
  }
};


const createProduct = async (req, res) => {
  try {
    const validation = validateProductInput(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.errors.join(', '), 'VALIDATION_ERROR', 400);
    }

    const { name, category, brand, actualPrice, sellingPrice, description, shortDescription, isAvailable, isFeatured, searchTags } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return sendError(res, 'Category does not exist', 'NOT_FOUND', 404);
    }

    let baseSlug = slugify(name);
    let candidateSlug = baseSlug;
    let counter = 2;
    while (await Product.exists({ slug: candidateSlug })) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const images = [];
    if (req.file && req.file.buffer) {
      const uploaded = await uploadImageStream(req.file.buffer);
      if (uploaded.url) {
        images.push({ url: uploaded.url, publicId: uploaded.publicId });
      }
    }

    // Default fallback placeholder if no image was uploaded or upload failed
    if (images.length === 0) {
      images.push({ url: '/brand/sparq-logo.svg', publicId: '' });
    }

    const product = new Product({
      name: name.trim(),
      slug: candidateSlug,
      category,
      brand: (brand && brand.trim()) || 'Sparq',
      actualPrice: Number(actualPrice),
      sellingPrice: Number(sellingPrice),
      description: description || '',
      shortDescription: shortDescription || '',
      images,
      isAvailable: isAvailable !== 'false' && isAvailable !== false,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      searchTags: Array.isArray(searchTags)
        ? searchTags
        : typeof searchTags === 'string' && searchTags.trim()
        ? searchTags.split(',').map(s => s.trim())
        : []
    });

    await product.save();
    return sendSuccess(res, product, 201);
  } catch (err) {
    console.error('[Create Product Error]:', err);
    return sendError(res, err.message, 'CREATE_PRODUCT_ERROR', 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return sendError(res, 'Invalid Product ID', 'INVALID_ID', 400);
    }

    const validation = validateProductInput(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.errors.join(', '), 'VALIDATION_ERROR', 400);
    }

    const product = await Product.findById(id);
    if (!product) {
      return sendError(res, 'Product not found', 'NOT_FOUND', 404);
    }

    const { name, category, brand, actualPrice, sellingPrice, description, shortDescription, isAvailable, isFeatured, searchTags } = req.body;

    if (category.toString() !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) return sendError(res, 'Selected category does not exist', 'NOT_FOUND', 404);
      product.category = category;
    }

    if (name.trim() !== product.name) {
      let baseSlug = slugify(name);
      let candidateSlug = baseSlug;
      let counter = 2;
      while (await Product.exists({ slug: candidateSlug, _id: { $ne: product._id } })) {
        candidateSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      product.slug = candidateSlug;
      product.name = name.trim();
    }

    product.brand = brand?.trim() || 'Sparq';
    product.actualPrice = Number(actualPrice);
    product.sellingPrice = Number(sellingPrice);
    product.description = description || '';
    product.shortDescription = shortDescription || '';
    product.isAvailable = isAvailable === true || isAvailable === 'true';
    product.isFeatured = isFeatured === true || isFeatured === 'true';
    product.searchTags = Array.isArray(searchTags) ? searchTags : (searchTags ? searchTags.split(',').map(s => s.trim()) : []);

    await product.save();
    return sendSuccess(res, product);
  } catch (err) {
    return sendError(res, err.message, 'UPDATE_PRODUCT_ERROR', 500);
  }
};

const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 'Invalid Product ID', 'INVALID_ID', 400);
    if (!req.file) return sendError(res, 'No image file uploaded', 'BAD_REQUEST', 400);

    const product = await Product.findById(id);
    if (!product) return sendError(res, 'Product not found', 'NOT_FOUND', 404);

    const uploaded = await uploadImageStream(req.file.buffer);
    product.images.push({ url: uploaded.url, publicId: uploaded.publicId });
    await product.save();

    return sendSuccess(res, product);
  } catch (err) {
    return sendError(res, err.message, 'IMAGE_UPLOAD_ERROR', 500);
  }
};

const removeProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { publicId } = req.body;
    if (!isValidObjectId(id)) return sendError(res, 'Invalid Product ID', 'INVALID_ID', 400);

    const product = await Product.findById(id);
    if (!product) return sendError(res, 'Product not found', 'NOT_FOUND', 404);

    product.images = product.images.filter(img => img.publicId !== publicId);
    await product.save();

    if (publicId) {
      await deleteImage(publicId);
    }

    return sendSuccess(res, product);
  } catch (err) {
    return sendError(res, err.message, 'IMAGE_DELETE_ERROR', 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, 'Invalid Product ID', 'INVALID_ID', 400);

    const product = await Product.findById(id);
    if (!product) return sendError(res, 'Product not found', 'NOT_FOUND', 404);

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.publicId) await deleteImage(img.publicId);
      }
    }

    await Product.findByIdAndDelete(id);
    return sendSuccess(res, { deleted: true, id });
  } catch (err) {
    return sendError(res, err.message, 'DELETE_PRODUCT_ERROR', 500);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  uploadProductImage,
  removeProductImage,
  deleteProduct
};
