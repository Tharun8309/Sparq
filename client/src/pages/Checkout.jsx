import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { formatCurrency, buildWhatsAppMessage } from '../utils/formatters';

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    landmark: '',
    notes: ''
  });

  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic delivery & MOV verification whenever pincode or cart value changes
  useEffect(() => {
    async function verifyDelivery() {
      if (/^\d{6}$/.test(form.pincode.trim())) {
        setCheckingDelivery(true);
        try {
          const res = await api(`/delivery/check?pincode=${form.pincode.trim()}&orderValue=${cartSubtotal}`);
          setDeliveryStatus(res.data);
        } catch (err) {
          setDeliveryStatus({ available: false, reason: err.message });
        } finally {
          setCheckingDelivery(false);
        }
      } else {
        setDeliveryStatus(null);
      }
    }
    verifyDelivery();
  }, [form.pincode, cartSubtotal]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white text-center rounded border border-gray-200">
        <p className="text-xs text-gray-600 mb-4">You have no items in your cart.</p>
        <button onClick={() => navigate('/products')} className="bg-sparq-maroon text-white text-xs px-4 py-2 rounded">
          Return to Catalogue
        </button>
      </div>
    );
  }

  const isEligibleToOrder = deliveryStatus && deliveryStatus.available === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!isEligibleToOrder) {
      setError(deliveryStatus?.reason || 'Order does not meet minimum order requirements.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const payload = {
        customer: form,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        idempotencyKey
      };

      const res = await api('/orders', {
        method: 'POST',
        body: payload
      });

      if (res.success && res.data?.order) {
        const orderData = res.data.order;
        const whatsappNumber = res.data.whatsappNumber || '919876543210';

        // 1. Build pre-filled WhatsApp message
        const encodedMsg = buildWhatsAppMessage({
          orderNumber: orderData.orderNumber,
          customer: orderData.customer,
          items: orderData.items,
          total: orderData.total,
          deliveryType: orderData.delivery?.type,
          notes: orderData.customer?.notes
        });

        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

        // 2. Clear customer cart
        clearCart();

        // 3. Immediately launch WhatsApp
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        // 4. Navigate this tab to Order Success
        // When the customer switches back from WhatsApp, the success page is waiting
        navigate('/order-success', {
          replace: true,
          state: {
            order: orderData,
            whatsappNumber
          }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to process order.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon mb-6">Complete Celebration Order</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg border border-sparq-gold/30 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Your Mobile Number (For Order Delivery Updates) *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="6-digit pincode"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  placeholder="e.g. Near Temple"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
                />
              </div>
            </div>

            {checkingDelivery && (
              <p className="text-xs text-gray-500">Checking delivery eligibility & minimum order value...</p>
            )}

            {deliveryStatus && (
              <div className={`p-3 rounded text-xs font-semibold ${
                deliveryStatus.available
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {deliveryStatus.reason}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Complete Address *</label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House no, Street name, Area"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Order Notes (Optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special celebration timing instructions"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-sparq-gold focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || checkingDelivery || !isEligibleToOrder}
              className="w-full py-3 bg-sparq-maroon text-sparq-cream font-bold text-xs rounded hover:bg-sparq-darkmaroon border border-sparq-gold/40 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-4"
            >
              {submitting
                ? 'Opening WhatsApp...'
                : !isEligibleToOrder
                ? 'Minimum Order Value Not Met'
                : 'Place Order & Send via WhatsApp'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-sparq-offwhite p-6 rounded-lg border border-sparq-gold/30 h-fit">
          <h3 className="font-bold text-sm text-sparq-darkmaroon mb-4">Order Summary</h3>
          <div className="divide-y divide-gray-200 text-xs text-gray-700 mb-4">
            {cartItems.map(item => (
              <div key={item.productId} className="py-2 flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span className="font-semibold">{formatCurrency(item.sellingPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-300 pt-3 flex justify-between items-center text-sm font-bold text-sparq-maroon">
            <span>Total Value:</span>
            <span>{formatCurrency(cartSubtotal)}</span>
          </div>

          {deliveryStatus && (
            <div className="mt-4 pt-3 border-t border-gray-200 text-xs space-y-1">
              <p className="text-gray-600">
                <strong>Service Type:</strong> {deliveryStatus.supportsCOD ? 'Direct Delivery (COD)' : 'Courier Delivery'}
              </p>
              {deliveryStatus.minimumOrderValue > 0 && (
                <p className="text-gray-600">
                  <strong>Required Minimum:</strong> {formatCurrency(deliveryStatus.minimumOrderValue)}
                </p>
              )}
            </div>
          )}

          <p className="text-[11px] text-gray-500 mt-4 leading-normal">
            Clicking the button immediately launches WhatsApp to send your order details. When you switch back, your confirmation receipt will be here.
          </p>
        </div>
      </div>
    </div>
  );
}