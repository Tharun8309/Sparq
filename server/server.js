const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');

async function startServer() {
  try {
    await connectDB();
    // server/server.js
async function startServer() {
  try {
    await connectDB();
    
    // Auto-clean obsolete draft indexes if they exist
    const Order = require('./models/Order');
    try {
      await Order.collection.dropIndex('orderId_1');
      console.log('[MongoDB] Cleaned up obsolete legacy orderId_1 index.');
    } catch (e) {
      // Ignore if index doesn't exist
    }

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`[Sparq Server] Running on http://127.0.0.1:${config.port}`);
    });
  } catch (err) {
    console.error('[Server Startup Failure]:', err);
    process.exit(1);
  }
}
    app.listen(config.port, () => {
      console.log(`[Sparq Server] Running on http://localhost:${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    console.error('[Server Startup Failure]:', err.message);
    process.exit(1);
  }
}

startServer();
