const NearbyPincode = require('../models/NearbyPincode');
const CourierPincode = require('../models/CourierPincode');
const StoreSettings = require('../models/StoreSettings');

async function checkPincodeEligibility(pincode, orderValue = 0) {
  const cleanPin = (pincode || '').toString().trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      available: false,
      reason: 'Invalid 6-digit pincode',
      type: null,
      supportsCOD: false,
      minimumOrderValue: 0
    };
  }

  // 1. Direct Local Delivery (COD supported, per-pincode custom MOV)
  const nearby = await NearbyPincode.findOne({ pincode: cleanPin, isServiceable: true });
  if (nearby) {
    if (orderValue > 0 && orderValue < nearby.minimumOrderValue) {
      return {
        available: false,
        reason: `Direct Delivery requires a minimum order of ₹${nearby.minimumOrderValue}`,
        type: 'DIRECT_COD',
        supportsCOD: nearby.supportsCOD,
        minimumOrderValue: nearby.minimumOrderValue
      };
    }
    return {
      available: true,
      reason: 'Direct Local Delivery & COD available',
      type: 'DIRECT_COD',
      supportsCOD: nearby.supportsCOD,
      minimumOrderValue: nearby.minimumOrderValue
    };
  }

  // 2. Global Courier Serviceability (Single global MOV for all courier orders)
  const courier = await CourierPincode.findOne({ pincode: cleanPin, isServiceable: true });
  if (courier) {
    const settings = await StoreSettings.findOne().lean();
    const globalCourierMOV = Number(settings?.courierMinOrderValue) || 1500;

    if (orderValue > 0 && orderValue < globalCourierMOV) {
      return {
        available: false,
        reason: `Courier delivery requires a minimum order of ₹${globalCourierMOV}`,
        type: 'COURIER',
        supportsCOD: false,
        minimumOrderValue: globalCourierMOV
      };
    }

    return {
      available: true,
      reason: 'Delivery available to your location',
      type: 'COURIER',
      supportsCOD: false,
      minimumOrderValue: globalCourierMOV
    };
  }

  return {
    available: false,
    reason: 'Delivery is currently not available for this pincode',
    type: null,
    supportsCOD: false,
    minimumOrderValue: 0
  };
}

module.exports = { checkPincodeEligibility };