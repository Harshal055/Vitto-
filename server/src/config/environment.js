require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // PostgreSQL
  PG_HOST: process.env.PG_HOST || 'localhost',
  PG_PORT: parseInt(process.env.PG_PORT, 10) || 5432,
  PG_DATABASE: process.env.PG_DATABASE || 'lending_db',
  PG_USER: process.env.PG_USER || 'postgres',
  PG_PASSWORD: process.env.PG_PASSWORD || 'postgres',
  PG_SSL: process.env.PG_SSL === 'true',
  DATABASE_URL: process.env.DATABASE_URL,

  // MongoDB
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/lending_audit',

  // CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  DECISION_RATE_LIMIT_MAX: parseInt(process.env.DECISION_RATE_LIMIT_MAX, 10) || 10,
};

module.exports = env;
