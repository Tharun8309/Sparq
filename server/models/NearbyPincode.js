const mongoose = require('mongoose');

const NearbyPincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    length: 6
  },
  minimumOrderValue: {
    type: Number,
    default: 1000
  },
  isServiceable: {
    type: Boolean,
    default: true
  },
  supportsCOD: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

NearbyPincodeSchema.index({ pincode: 1 });

module.exports = mongoose.models.NearbyPincode || mongoose.model('NearbyPincode', NearbyPincodeSchema);
