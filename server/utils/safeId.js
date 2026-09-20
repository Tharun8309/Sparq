const mongoose = require('mongoose');

function isValidObjectId(id) {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && (new mongoose.Types.ObjectId(id)).toString() === id.toString();
}

module.exports = { isValidObjectId };
