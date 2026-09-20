import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { buildWhatsAppMessage, formatCurrency } from '../utils/formatters';

export default function OrderSuccess() {
  const location = useLocation();
  const orderData = location.state?.order;
  const whatsappNumber = location.state?.whatsappNumber || '919876543210';
  const [copied, setCopied] = useState(false);

  if (!orderData) {
    return <Navigate to="/" replace />;
  }

  const encodedMsg = buildWhatsAppMessage({
    orderNumber: orderData.orderNumber,
    customer: orderData.customer,
    items: orderData.items,
    total: orderData.total,
    deliveryType: orderData.delivery?.type,
    notes: orderData.customer?.notes
  });

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(decodeURIComponent(encodedMsg));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-lg border border-sparq-gold/40 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ✓
        </div>

        <h1 className="font-serif text-2xl font-bold text-sparq-darkmaroon mb-1">
          Celebration Order Recorded!
        </h1>
        <p className="text-xs text-gray-600 mb-2">
          Your order was directed to WhatsApp for instant confirmation.
        </p>
        <p className="text-xs font-semibold text-sparq-maroon mb-6">
          Order Reference: <span className="font-mono">{orderData.orderNumber}</span>
        </p>

        {/* Snapshot details */}
        <div className="bg-sparq-offwhite p-4 rounded text-left text-xs mb-6 space-y-1.5 border border-gray-200">
          <p><strong>Customer:</strong> {orderData.customer?.name}</p>
          <p><strong>Delivery Pincode:</strong> {orderData.customer?.pincode}</p>
          <p><strong>Items:</strong> {orderData.items?.length || 0} celebration items</p>
          <p><strong>Total Value:</strong> {formatCurrency(orderData.total)}</p>
          <p><strong>Delivery Option:</strong> {orderData.delivery?.type === 'DIRECT_COD' ? 'Direct Delivery (COD)' : 'Courier Service'}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded transition-colors shadow"
          >
            Re-open WhatsApp Message
          </a>

          <button
            onClick={handleCopy}
            className="block w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded transition-colors"
          >
            {copied ? '✓ Order Message Copied to Clipboard!' : 'Copy Order Text (Fallback)'}
          </button>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-4">
          <Link to="/" className="text-xs text-sparq-maroon font-semibold hover:underline">
            ← Return to Sparq Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}