/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a consistent JSON response.
 */
function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err.code === '23505') {
    // PostgreSQL unique violation
    return res.status(409).json({
      success: false,
      data: null,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'A record with this data already exists',
        details: [],
      },
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key violation
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'REFERENCE_ERROR',
        message: 'Referenced record does not exist',
        details: [],
      },
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'INVALID_JSON',
        message: 'Request body contains invalid JSON',
        details: [],
      },
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500
        ? 'An internal server error occurred'
        : err.message,
      details: [],
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = errorHandler;
