const NearbyPincode = require('../models/NearbyPincode');
const connectDB = require('../config/db');

// Direct Delivery & COD pincodes specified in prompt
const directNearbyPincodes = [
  // Initial direct-delivery zones. These can also be added/updated from Admin > Direct Delivery.
  { pincode: '560037', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '560043', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '560048', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '560049', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '560064', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '560067', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '560100', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '562101', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '562110', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '562114', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '563101', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true },
  { pincode: '563130', minimumOrderValue: 1000, isServiceable: true, supportsCOD: true }
];

async function seedNearby() {
  try {
    await connectDB();
    console.log('[Seed] Seeding direct local delivery & COD pincodes...');

    for (const item of directNearbyPincodes) {
      await NearbyPincode.findOneAndUpdate(
        { pincode: item.pincode },
        { $set: item },
        { upsert: true, new: true }
      );
    }

    console.log('[Seed] Direct delivery & COD pincodes successfully saved.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Nearby Error]:', err.message);
    process.exit(1);
  }
}

seedNearby();
