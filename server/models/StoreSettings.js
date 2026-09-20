const mongoose = require('mongoose');

const StoreSettingsSchema = new mongoose.Schema({
  shopName: {
    type: String,
    default: 'Sparq'
  },
  tagline: {
    type: String,
    default: 'Light Up Every Celebration'
  },
  phone: {
    type: String,
    default: '+91 9876543210'
  },
  whatsapp: {
    type: String,
    default: '919876543210'
  },
  email: {
    type: String,
    default: 'orders@sparqfireworks.com'
  },
  address: {
    type: String,
    default: 'Sparq Celebration Depot, Main Ring Road, Bangalore - 560001'
  },
  bannerAlert: {
    type: String,
    default: 'Festive Bookings Open! Direct Delivery & Courier available across selected pincodes.'
  },
  courierMinOrderValue: {
    type: Number,
    default: 1500,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);