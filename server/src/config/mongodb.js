const mongoose = require('mongoose');
const env = require('./environment');

async function connectMongoDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('✓ MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // MongoDB is used for audit logs — non-critical, don't crash server
    console.warn('⚠ Continuing without MongoDB audit logging');
  }
}

module.exports = { connectMongoDB };
