const mongoose = require('mongoose');
const config = require('./env');

let cachedConnection = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10
    };
    const conn = await mongoose.connect(config.mongoUri, opts);
    cachedConnection = conn;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    try {
      const ordersCollection = conn.connection.db.collection('orders');
      const indexes = await ordersCollection.indexes();
      const hasGhostIndex = indexes.some(idx => idx.name === 'orderId_1');

      if (hasGhostIndex) {
        await ordersCollection.dropIndex('orderId_1');
        console.log(' Successfully removed obsolete ghost index: orderId_1');
      }
    } catch (indexErr) {
      // Ignore if collection doesn't exist yet
    }
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }
}

module.exports = connectDB;
