const StoreSettings = require('../models/StoreSettings');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne().lean();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    return sendSuccess(res, settings);
  } catch (err) {
    return sendError(res, err.message, 'GET_SETTINGS_ERROR', 500);
  }
};

const updateSettings = async (req, res) => {
  try {
    const { shopName, tagline, phone, whatsapp, email, address, bannerAlert, courierMinOrderValue } = req.body;
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings();
    }

    if (shopName) settings.shopName = shopName.trim();
    if (tagline) settings.tagline = tagline.trim();
    if (phone) settings.phone = phone.trim();
    if (whatsapp) settings.whatsapp = whatsapp.trim().replace(/\D/g, '');
    if (email) settings.email = email.trim();
    if (address) settings.address = address.trim();
    if (bannerAlert !== undefined) settings.bannerAlert = bannerAlert.trim();
    if (courierMinOrderValue !== undefined) {
      const val = Number(courierMinOrderValue);
      if (!isNaN(val) && val >= 0) {
        settings.courierMinOrderValue = val;
      }
    }

    await settings.save();
    return sendSuccess(res, settings);
  } catch (err) {
    return sendError(res, err.message, 'UPDATE_SETTINGS_ERROR', 500);
  }
};

module.exports = { getSettings, updateSettings };