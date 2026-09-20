const Order = require('../models/Order');
const StoreSettings = require('../models/StoreSettings');
const { validateOrderInput } = require('../validation/orderValidation');
const { createOrderWithSnapshot } = require('../services/orderService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const createOrder = async (req, res) => {
  try {
    const validation = validateOrderInput(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.errors.join(', '), 'VALIDATION_ERROR', 400);
    }

    const { order, isDuplicate } = await createOrderWithSnapshot(req.body);
    const settings = await StoreSettings.findOne().lean();
    const whatsappNumber = settings?.whatsapp || '919876543210';

    return sendSuccess(res, {
      order,
      isDuplicate,
      whatsappNumber
    }, 201);
  } catch (err) {
    return sendError(res, err.message, 'CREATE_ORDER_ERROR', 400);
  }
};

const getOrdersAdmin = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      query.$or = [
        { orderNumber: new RegExp(cleanSearch, 'i') },
        { 'customer.phone': new RegExp(cleanSearch, 'i') },
        { 'customer.name': new RegExp(cleanSearch, 'i') }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [rawOrders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Order.countDocuments(query)
    ]);

    // Defensive data normalization preventing undefined customer / item crashes
    const safeOrders = (rawOrders || []).map(order => ({
      ...order,
      customer: {
        name: order.customer?.name || 'Customer information unavailable',
        phone: order.customer?.phone || 'N/A',
        address: order.customer?.address || 'N/A',
        pincode: order.customer?.pincode || 'N/A',
        landmark: order.customer?.landmark || '',
        notes: order.customer?.notes || ''
      },
      items: Array.isArray(order.items)
        ? order.items.map(item => ({
            name: item.name || 'Unknown Product',
            quantity: item.quantity || 1,
            sellingPrice: item.sellingPrice || 0,
            subtotal: item.subtotal || 0
          }))
        : [],
      orderStatus: order.orderStatus || 'NEW',
      paymentStatus: order.paymentStatus || 'PENDING',
      total: order.total || 0
    }));

    return sendSuccess(res, {
      items: safeOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 0
      }
    });
  } catch (err) {
    return sendError(res, err.message, 'GET_ADMIN_ORDERS_ERROR', 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, adminNotes } = req.body;

    const allowedOrderStatus = ['NEW', 'PAYMENT_PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const allowedPaymentStatus = ['PENDING', 'CONFIRMED'];

    const updateFields = {};
    if (orderStatus) {
      if (!allowedOrderStatus.includes(orderStatus)) return sendError(res, 'Invalid order status', 'BAD_REQUEST', 400);
      updateFields.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      if (!allowedPaymentStatus.includes(paymentStatus)) return sendError(res, 'Invalid payment status', 'BAD_REQUEST', 400);
      updateFields.paymentStatus = paymentStatus;
    }
    if (adminNotes !== undefined) {
      updateFields.adminNotes = adminNotes;
    }

    const order = await Order.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).lean();
    if (!order) return sendError(res, 'Order not found', 'NOT_FOUND', 404);

    return sendSuccess(res, order);
  } catch (err) {
    return sendError(res, err.message, 'UPDATE_ORDER_ERROR', 500);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProducts,
      availableProducts,
      featuredProducts,
      totalOrders,
      newOrders,
      pendingPaymentOrders,
      confirmedOrders,
      deliveredOrders
    ] = await Promise.all([
      require('../models/Product').countDocuments(),
      require('../models/Product').countDocuments({ isAvailable: true }),
      require('../models/Product').countDocuments({ isFeatured: true }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'NEW' }),
      Order.countDocuments({ orderStatus: 'PAYMENT_PENDING' }),
      Order.countDocuments({ orderStatus: 'CONFIRMED' }),
      Order.countDocuments({ orderStatus: 'DELIVERED' })
    ]);

    return sendSuccess(res, {
      products: { total: totalProducts, available: availableProducts, featured: featuredProducts },
      orders: {
        total: totalOrders,
        new: newOrders,
        pendingPayment: pendingPaymentOrders,
        confirmed: confirmedOrders,
        delivered: deliveredOrders
      }
    });
  } catch (err) {
    return sendError(res, err.message, 'GET_DASHBOARD_STATS_ERROR', 500);
  }
};

module.exports = {
  createOrder,
  getOrdersAdmin,
  updateOrderStatus,
  getDashboardStats
};
