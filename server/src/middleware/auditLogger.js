const AuditLog = require('../models/mongo/AuditLog');

/**
 * Logs an audit event to MongoDB.
 * Fails silently — audit logging is non-critical.
 */
async function logAudit({ action, entityType, entityId, payload, result, req }) {
  try {
    await AuditLog.create({
      action,
      entityType,
      entityId: String(entityId),
      payload: sanitizePayload(payload),
      result,
      ip: req?.ip || 'unknown',
      userAgent: req?.get('User-Agent') || 'unknown',
      timestamp: new Date(),
    });
  } catch (err) {
    console.warn('[AUDIT] Failed to log event:', err.message);
  }
}

/**
 * Remove sensitive fields before storing in audit logs.
 */
function sanitizePayload(payload) {
  if (!payload) return {};
  const sanitized = { ...payload };
  // Mask PAN if present (show only last 4 chars)
  if (sanitized.pan) {
    sanitized.pan = '******' + sanitized.pan.slice(-4);
  }
  return sanitized;
}

/**
 * Retrieve audit trail for a specific entity.
 */
async function getAuditTrail(entityId) {
  try {
    return await AuditLog.find({ entityId: String(entityId) })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();
  } catch (err) {
    console.warn('[AUDIT] Failed to fetch trail:', err.message);
    return [];
  }
}

module.exports = { logAudit, getAuditTrail };
