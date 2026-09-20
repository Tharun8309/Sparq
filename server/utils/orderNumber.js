const crypto = require('crypto');

function generateOrderNumber() {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `SPQ-${dateStr}-${rand}`;
}

module.exports = generateOrderNumber;
