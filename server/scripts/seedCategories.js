const mongoose = require('mongoose');
const Category = require('../models/Category');
const connectDB = require('../config/db');
const slugify = require('../utils/slugify');

const PERMANENT_CATEGORIES = [
  'Sparklers',
  'Flower Pots',
  'Ground Spinners',
  'Ground Chakkars',
  'Rockets',
  'Garland',
  'Gift Boxes',
  'Combos',
  'Fancy Fountains',
  'Others'
];

async function seedCategories() {
  try {
    await connectDB();
    console.log('[Seed] Seeding permanent categories...');

    for (let i = 0; i < PERMANENT_CATEGORIES.length; i++) {
      const name = PERMANENT_CATEGORIES[i];
      const slug = slugify(name);
      await Category.findOneAndUpdate(
        { slug },
        { name, slug, isPermanent: true, displayOrder: i },
        { upsert: true, new: true }
      );
    }

    console.log(`[Seed] Success: ${PERMANENT_CATEGORIES.length} permanent categories verified.`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
}

seedCategories();
