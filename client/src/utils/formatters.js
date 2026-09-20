export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

export function buildWhatsAppMessage({ orderNumber, customer, items, total, deliveryType, notes }) {
  const lines = [
    `*✨ SPARQ CELEBRATION ORDER ✨*`,
    `*Order No:* ${orderNumber}`,
    `--------------------------------`,
    `*Customer Details:*`,
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Pincode: ${customer.pincode}`,
    `Address: ${customer.address}`,
    customer.landmark ? `Landmark: ${customer.landmark}` : null,
    `--------------------------------`,
    `*Items Ordered:*`,
    ...items.map(it => `• ${it.name} x ${it.quantity} = ₹${it.subtotal}`),
    `--------------------------------`,
    `*Total Value: ₹${total}*`,
    `*Delivery Type:* ${deliveryType === 'DIRECT_COD' ? 'Direct Delivery & COD' : 'Courier Service'}`,
    notes ? `*Notes:* ${notes}` : null,
    `--------------------------------`,
    `Sparq - Light Up Every Celebration!`
  ].filter(Boolean);

  return encodeURIComponent(lines.join('\n'));
}
