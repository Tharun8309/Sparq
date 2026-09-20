const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: String,
    trim: true,
    default: 'Sparq'
  },
  actualPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  shortDescription: {
    type: String,
    trim: true,
    default: ''
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, default: '' }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  searchTags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isAvailable: 1, isFeatured: 1 });
ProductSchema.index({ name: 'text', searchTags: 'text' });

ProductSchema.pre('save', function(next) {
  if (this.actualPrice > 0 && this.sellingPrice <= this.actualPrice) {
    this.discountPercentage = Math.round(((this.actualPrice - this.sellingPrice) / this.actualPrice) * 100);
  } else {
    this.discountPercentage = 0;
  }
  next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
