const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  if (err.name === 'CastError') {
    return sendError(res, `Invalid format for field: ${err.path}`, 'INVALID_ID', 400);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return sendError(res, messages.join(', '), 'VALIDATION_ERROR', 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `Duplicate entry for ${field}`, 'DUPLICATE_KEY', 409);
  }

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'An internal error occurred' : err.message,
    'SERVER_ERROR',
    500
  );
};

module.exports = errorHandler;
