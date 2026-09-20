const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  isPermanent: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

CategorySchema.index({ slug: 1 });

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
