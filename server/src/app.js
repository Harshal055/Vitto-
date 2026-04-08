const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const env = require('./config/environment');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const profileRoutes = require('./routes/profileRoutes');
const loanRoutes = require('./routes/loanRoutes');
const decisionRoutes = require('./routes/decisionRoutes');

const app = express();

// ── Security ──
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// ── Body parsing ──
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──
app.use(morgan('dev'));

// ── Request ID ──
app.use((req, _res, next) => {
  req.requestId = uuidv4();
  next();
});

// ── Rate Limiting ──
app.use('/api/', generalLimiter);

// ── Health Check ──
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
});

// ── API Routes ──
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/decisions', decisionRoutes);

// ── 404 Handler ──
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
      details: [],
    },
  });
});

// ── Global Error Handler ──
app.use(errorHandler);

module.exports = app;
