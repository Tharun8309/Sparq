const mongoose = require('mongoose');

const CourierPincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    length: 6
  },
  isServiceable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

CourierPincodeSchema.index({ pincode: 1 });

module.exports = mongoose.models.CourierPincode || mongoose.model('CourierPincode', CourierPincodeSchema);
