const sendSuccess = (res, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    data
  });
};

const sendError = (res, message = 'An error occurred', code = 'INTERNAL_ERROR', status = 500) => {
  return res.status(status).json({
    success: false,
    message,
    code
  });
};

module.exports = { sendSuccess, sendError };
