const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');
const config = require('../config/env');

async function seedAdmin() {
  try {
    await connectDB();
    const username = config.adminUsername.toLowerCase().trim();
    const existing = await Admin.findOne({ username });

    if (existing) {
      if (!existing.passwordHash) {
        console.log('[Seed] Admin exists with corrupt passwordHash. Generating new hash...');
        existing.passwordHash = await bcrypt.hash(config.adminInitialPassword, 12);
        await existing.save();
        console.log('[Seed] Fixed corrupt admin passwordHash.');
      } else {
        console.log(`[Seed] Admin "${username}" already exists with valid hash. Keeping existing password.`);
      }
    } else {
      console.log(`[Seed] Creating new admin account for "${username}"...`);
      const passwordHash = await bcrypt.hash(config.adminInitialPassword, 12);
      await Admin.create({ username, passwordHash });
      console.log(`[Seed] Successfully created admin: ${username}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('[Seed Admin Error]:', err.message);
    process.exit(1);
  }
}

seedAdmin();
