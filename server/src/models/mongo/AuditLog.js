const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'PROFILE_CREATED',
      'LOAN_SUBMITTED',
      'DECISION_REQUESTED',
      'DECISION_PROCESSING',
      'DECISION_COMPLETED',
      'VALIDATION_FAILED',
      'ERROR_OCCURRED',
    ],
  },
  entityType: {
    type: String,
    required: true,
    enum: ['profile', 'loan', 'decision'],
  },
  entityId: {
    type: String,
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  ip: {
    type: String,
    default: 'unknown',
  },
  userAgent: {
    type: String,
    default: 'unknown',
  },
  duration_ms: {
    type: Number,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

auditLogSchema.index({ entityId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
