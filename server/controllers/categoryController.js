const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const { isValidObjectId } = require('../utils/safeId');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
    return sendSuccess(res, categories || []);
  } catch (err) {
    return sendError(res, err.message, 'GET_CATEGORIES_ERROR', 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'Category name is required', 'VALIDATION_ERROR', 400);
    }

    const cleanName = name.trim();
    let baseSlug = slugify(cleanName);
    let candidateSlug = baseSlug;
    let counter = 2;

    while (await Category.exists({ slug: candidateSlug })) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const category = new Category({
      name: cleanName,
      slug: candidateSlug,
      isPermanent: false, // Custom categories can be deleted
      displayOrder: 99
    });

    await category.save();
    return sendSuccess(res, category, 201);
  } catch (err) {
    return sendError(res, err.message, 'CREATE_CATEGORY_ERROR', 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return sendError(res, 'Invalid Category ID', 'INVALID_ID', 400);
    }

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 'Category not found', 'NOT_FOUND', 404);
    }

    if (category.isPermanent) {
      return sendError(res, 'Permanent system categories cannot be deleted', 'FORBIDDEN', 403);
    }

    await Category.findByIdAndDelete(id);
    return sendSuccess(res, { deleted: true, id });
  } catch (err) {
    return sendError(res, err.message, 'DELETE_CATEGORY_ERROR', 500);
  }
};

module.exports = { getCategories, createCategory, deleteCategory };