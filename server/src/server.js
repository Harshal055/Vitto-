const app = require('./app');
const env = require('./config/environment');
const { initializeDatabase } = require('./config/database');
const { connectMongoDB } = require('./config/mongodb');

async function startServer() {
  try {
    // Initialize PostgreSQL schema
    await initializeDatabase();

    // Connect MongoDB (non-critical — continues if fails)
    await connectMongoDB();

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════╗
║   MSME Lending Decision System — API Server          ║
║   Environment: ${env.NODE_ENV.padEnd(38)}║
║   Port:        ${String(env.PORT).padEnd(38)}║
║   Health:      http://localhost:${env.PORT}/api/health${' '.repeat(Math.max(0, 14 - String(env.PORT).length))}║
╚══════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
