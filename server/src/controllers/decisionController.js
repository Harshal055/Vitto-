const Decision = require('../models/pg/Decision');
const LoanApplication = require('../models/pg/LoanApplication');
const { processDecisionAsync } = require('../services/asyncProcessor');
const { logAudit, getAuditTrail } = require('../middleware/auditLogger');

/**
 * POST /api/v1/decisions
 * Trigger an async credit decision for a loan application.
 * Returns 202 Accepted immediately — client polls for result.
 */
async function createDecision(req, res, next) {
  try {
    const { applicationId } = req.body;

    // Fetch the full application with profile data
    const application = await LoanApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'The referenced loan application does not exist',
          details: [],
        },
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Create decision record in PROCESSING state
    const decision = await Decision.create({
      applicationId: application.id,
      profileId: application.profile_id,
    });

    await logAudit({
      action: 'DECISION_REQUESTED',
      entityType: 'decision',
      entityId: decision.id,
      payload: { applicationId },
      req,
    });

    // Fire off async processing (runs in background)
    processDecisionAsync(decision.id, application, req);

    // Return immediately with 202
    res.status(202).json({
      success: true,
      data: {
        id: decision.id,
        status: 'PROCESSING',
        message: 'Decision is being processed. Poll GET /api/v1/decisions/' + decision.id + ' for results.',
      },
      error: null,
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/decisions/:id
 * Retrieve a decision (poll for status).
 */
async function getDecision(req, res, next) {
  try {
    const decision = await Decision.findById(req.params.id);

    if (!decision) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: 'Decision not found',
          details: [],
        },
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Parse score_breakdown if it's a string
    if (decision.score_breakdown && typeof decision.score_breakdown === 'string') {
      decision.score_breakdown = JSON.parse(decision.score_breakdown);
    }

    res.json({
      success: true,
      data: decision,
      error: null,
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/decisions/:id/audit
 * Retrieve the audit trail for a specific decision.
 */
async function getDecisionAudit(req, res, next) {
  try {
    const trail = await getAuditTrail(req.params.id);

    res.json({
      success: true,
      data: trail,
      error: null,
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createDecision, getDecision, getDecisionAudit };
