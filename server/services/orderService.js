const Order = require('../models/Order');
const Product = require('../models/Product');
const generateOrderNumber = require('../utils/orderNumber');
const { checkPincodeEligibility } = require('./deliveryService');

async function createOrderWithSnapshot(data) {
  // Prevent duplicate execution using idempotencyKey
  const existingOrder = await Order.findOne({ idempotencyKey: data.idempotencyKey });
  if (existingOrder) {
    return { isDuplicate: true, order: existingOrder };
  }

  const productIds = data.items.map(item => item.productId);
  const productsInDb = await Product.find({ _id: { $in: productIds } }).populate('category', 'name');
  const productMap = new Map(productsInDb.map(p => [p._id.toString(), p]));

  let subtotal = 0;
  const snapshotItems = [];

  for (const item of data.items) {
    const product = productMap.get(item.productId.toString());
    if (!product) {
      throw new Error(`Product with ID ${item.productId} was not found.`);
    }
    if (!product.isAvailable) {
      throw new Error(`"${product.name}" is out of stock.`);
    }

    const qty = parseInt(item.quantity, 10);
    const itemSubtotal = product.sellingPrice * qty;
    subtotal += itemSubtotal;

    snapshotItems.push({
      productId: product._id,
      name: product.name,
      category: product.category?.name || 'Sparq Special',
      quantity: qty,
      actualPrice: product.actualPrice,
      sellingPrice: product.sellingPrice,
      subtotal: itemSubtotal
    });
  }

  // Strict MOV and eligibility validation for BOTH Direct and Courier
  const deliveryResult = await checkPincodeEligibility(data.customer.pincode, subtotal);
  if (!deliveryResult.available) {
    throw new Error(deliveryResult.reason || 'Minimum order value requirement not met or delivery unavailable.');
  }

  const orderNumber = generateOrderNumber();

  const newOrder = new Order({
    orderNumber,
    customer: {
      name: data.customer.name.trim(),
      phone: data.customer.phone.trim(),
      address: data.customer.address.trim(),
      pincode: data.customer.pincode.trim(),
      landmark: data.customer.landmark?.trim() || '',
      notes: data.customer.notes?.trim() || ''
    },
    items: snapshotItems,
    subtotal,
    total: subtotal,
    delivery: {
      available: true,
      type: deliveryResult.type,
      pincode: data.customer.pincode.trim()
    },
    orderStatus: 'NEW',
    paymentStatus: 'PENDING',
    idempotencyKey: data.idempotencyKey
  });

  await newOrder.save();
  return { isDuplicate: false, order: newOrder };
}

module.exports = { createOrderWithSnapshot };