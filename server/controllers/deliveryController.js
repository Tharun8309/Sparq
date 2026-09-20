const { checkPincodeEligibility } = require('../services/deliveryService');
const NearbyPincode = require('../models/NearbyPincode');
const CourierPincode = require('../models/CourierPincode');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const checkPincode = async (req, res) => {
  try {
    const { pincode, orderValue } = req.query;
    if (!pincode) {
      return sendError(res, 'Pincode is required', 'BAD_REQUEST', 400);
    }
    const result = await checkPincodeEligibility(pincode, Number(orderValue) || 0);
    return sendSuccess(res, {
      pincode: pincode.toString().trim(),
      available: result.available,
      reason: result.reason,
      supportsCOD: result.supportsCOD,
      minimumOrderValue: result.minimumOrderValue
    });
  } catch (err) {
    return sendError(res, err.message, 'DELIVERY_CHECK_ERROR', 500);
  }
};

// Admin Delivery Endpoints
const getNearbyPincodes = async (req, res) => {
  try {
    const items = await NearbyPincode.find().sort({ pincode: 1 }).lean();
    return sendSuccess(res, items || []);
  } catch (err) {
    return sendError(res, err.message, 'GET_NEARBY_ERROR', 500);
  }
};

const updateNearbyPincode = async (req, res) => {
  try {
    const { pincode, minimumOrderValue, isServiceable, supportsCOD } = req.body;
    if (!/^\d{6}$/.test(pincode)) return sendError(res, 'Valid 6-digit pincode is required', 'BAD_REQUEST', 400);

    const doc = await NearbyPincode.findOneAndUpdate(
      { pincode },
      { minimumOrderValue: Number(minimumOrderValue) || 1000, isServiceable: !!isServiceable, supportsCOD: !!supportsCOD },
      { new: true, upsert: true }
    );
    return sendSuccess(res, doc);
  } catch (err) {
    return sendError(res, err.message, 'UPDATE_NEARBY_ERROR', 500);
  }
};

const getCourierPincodes = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const query = {};
    if (search.trim()) {
      query.pincode = new RegExp(search.trim());
    }
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    const [items, total] = await Promise.all([
      CourierPincode.find(query).sort({ pincode: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      CourierPincode.countDocuments(query)
    ]);

    return sendSuccess(res, {
      items: items || [],
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) || 0 }
    });
  } catch (err) {
    return sendError(res, err.message, 'GET_COURIER_ERROR', 500);
  }
};

const updateCourierPincode = async (req, res) => {
  try {
    const { pincode, isServiceable } = req.body;
    if (!/^\d{6}$/.test(pincode)) return sendError(res, 'Valid 6-digit pincode required', 'BAD_REQUEST', 400);

    const doc = await CourierPincode.findOneAndUpdate(
      { pincode },
      { isServiceable: !!isServiceable },
      { new: true, upsert: true }
    );
    return sendSuccess(res, doc);
  } catch (err) {
    return sendError(res, err.message, 'UPDATE_COURIER_ERROR', 500);
  }
};

// Add this inside server/controllers/deliveryController.js:

const deleteNearbyPincode = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await NearbyPincode.findByIdAndDelete(id);
    if (!doc) {
      return sendError(res, 'Pincode not found', 'NOT_FOUND', 404);
    }
    return sendSuccess(res, { deleted: true, id });
  } catch (err) {
    return sendError(res, err.message, 'DELETE_NEARBY_ERROR', 500);
  }
};

// Ensure deleteNearbyPincode is added to module.exports:
module.exports = {
  checkPincode,
  getNearbyPincodes,
  updateNearbyPincode,
  deleteNearbyPincode, // <--- ADDED
  getCourierPincodes,
  updateCourierPincode
};
