const { isValidObjectId } = require('../utils/safeId');

function validateProductInput(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Product name is required');
  }

  if (!data.category || !isValidObjectId(data.category)) {
    errors.push('A valid Category ObjectId reference is required');
  }

  const actualPrice = Number(data.actualPrice);
  const sellingPrice = Number(data.sellingPrice);

  if (isNaN(actualPrice) || actualPrice < 0) {
    errors.push('Actual price must be a valid positive number');
  }

  if (isNaN(sellingPrice) || sellingPrice < 0) {
    errors.push('Selling price must be a valid positive number');
  }

  if (!isNaN(actualPrice) && !isNaN(sellingPrice) && sellingPrice > actualPrice) {
    errors.push('Selling price cannot be greater than actual price');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateProductInput };
