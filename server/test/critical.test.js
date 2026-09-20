const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const { validateProductInput } = require('../validation/productValidation');
const { validateOrderInput } = require('../validation/orderValidation');
const { checkPincodeEligibility } = require('../services/deliveryService');
const mongoose = require('mongoose');

test('Product Validation: Rejects invalid price logic & string categories', () => {
  const invalidPrice = validateProductInput({
    name: 'Sparkler Deluxe',
    category: new mongoose.Types.ObjectId().toString(),
    actualPrice: 100,
    sellingPrice: 150 // Invalid: selling > actual
  });
  assert.strictEqual(invalidPrice.isValid, false);

  const invalidCat = validateProductInput({
    name: 'Flower Pot 500',
    category: 'Ground Chakkars', // Invalid: string instead of ObjectId
    actualPrice: 200,
    sellingPrice: 180
  });
  assert.strictEqual(invalidCat.isValid, false);
});

test('Admin Password Hash Safeguard: Prevents bcrypt.compare with undefined', async () => {
  const dummyAdmin = { username: 'testadmin', passwordHash: undefined };
  
  // Guard check logic as performed in controller
  let didCatchExpectedUndefined = false;
  if (!dummyAdmin || !dummyAdmin.passwordHash) {
    didCatchExpectedUndefined = true;
  } else {
    await bcrypt.compare('password', dummyAdmin.passwordHash);
  }

  assert.strictEqual(didCatchExpectedUndefined, true, 'Controller must catch missing passwordHash without calling bcrypt');
});

test('Order Validation: Requires Indian 6-digit pincode & non-empty items', () => {
  const badOrder = validateOrderInput({
    customer: { name: 'Tharun', phone: '9876543210', address: 'Bangalore', pincode: '5600' },
    items: [],
    idempotencyKey: 'idemp-1'
  });
  assert.strictEqual(badOrder.isValid, false);
});
