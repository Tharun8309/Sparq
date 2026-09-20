function validateOrderInput(data) {
  const errors = [];

  if (!data.customer || typeof data.customer !== 'object') {
    errors.push('Customer details are required');
    return { isValid: false, errors };
  }

  const { name, phone, address, pincode } = data.customer;

  if (!name || !name.trim()) errors.push('Customer name is required');
  
  // Indian 10-digit mobile check (optionally prefixed by +91 or 0)
  const phoneClean = (phone || '').replace(/\D/g, '');
  if (phoneClean.length < 10 || phoneClean.length > 12) {
    errors.push('A valid 10-digit Indian mobile number is required');
  }

  if (!address || !address.trim()) errors.push('Delivery address is required');

  if (!pincode || !/^\d{6}$/.test(pincode.toString().trim())) {
    errors.push('A valid 6-digit Indian pincode is required');
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    for (const item of data.items) {
      if (!item.productId) errors.push('Each item requires a productId');
      if (!item.quantity || Number(item.quantity) < 1) errors.push('Item quantity must be at least 1');
    }
  }

  if (!data.idempotencyKey || typeof data.idempotencyKey !== 'string') {
    errors.push('Idempotency key is required to prevent duplicate orders');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateOrderInput };
