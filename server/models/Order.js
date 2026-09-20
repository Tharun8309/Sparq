const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true, default: 'Product' },
  category: { type: String, default: 'General' },
  quantity: { type: Number, required: true, min: 1 },
  actualPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' }
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  delivery: {
    available: { type: Boolean, default: true },
    type: { type: String, enum: ['DIRECT_COD', 'COURIER'], default: 'COURIER' },
    pincode: { type: String, required: true }
  },
  orderStatus: {
    type: String,
    enum: ['NEW', 'PAYMENT_PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'],
    default: 'NEW'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED'],
    default: 'PENDING'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  idempotencyKey: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ idempotencyKey: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
