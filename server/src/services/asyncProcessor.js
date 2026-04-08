const Decision = require('../models/pg/Decision');
const LoanApplication = require('../models/pg/LoanApplication');
const { evaluateApplication } = require('./decisionEngine');
const { logAudit } = require('../middleware/auditLogger');

/**
 * In-memory store for processing decisions.
 * In production, this would be a Redis queue or similar.
 */
const processingQueue = new Map();

/**
 * Simulates asynchronous decision processing.
 *
 * Flow:
 *  1. Creates a decision record with status = PROCESSING
 *  2. Returns immediately (202 Accepted)
 *  3. After a simulated delay (1.5–3s), runs the decision engine
 *  4. Updates the decision record with results
 *
 * The frontend polls GET /decisions/:id to check status.
 */
async function processDecisionAsync(decisionId, applicationData, req) {
  processingQueue.set(decisionId, { status: 'PROCESSING', startedAt: Date.now() });

  // Log processing start
  await logAudit({
    action: 'DECISION_PROCESSING',
    entityType: 'decision',
    entityId: decisionId,
    payload: { applicationId: applicationData.id },
    req,
  });

  // Simulate processing delay (1.5s to 3s)
  const delay = 1500 + Math.random() * 1500;

  setTimeout(async () => {
    try {
      // Run the decision engine
      const result = evaluateApplication({
        monthlyRevenue: parseFloat(applicationData.monthly_revenue),
        loanAmount: parseFloat(applicationData.loan_amount),
        tenureMonths: parseInt(applicationData.tenure_months, 10),
        businessType: applicationData.business_type,
        pan: applicationData.pan,
      });

      // Update decision record in PostgreSQL
      await Decision.complete(decisionId, {
        decision: result.decision,
        creditScore: result.creditScore,
        riskLevel: result.riskLevel,
        reasonCodes: result.reasonCodes,
        scoreBreakdown: result.scoreBreakdown,
        estimatedEmi: result.estimatedEmi,
      });

      // Update loan application status
      await LoanApplication.updateStatus(
        applicationData.id,
        result.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED'
      );

      // Remove from processing queue
      processingQueue.delete(decisionId);

      // Log completion
      await logAudit({
        action: 'DECISION_COMPLETED',
        entityType: 'decision',
        entityId: decisionId,
        result: {
          decision: result.decision,
          creditScore: result.creditScore,
          riskLevel: result.riskLevel,
          reasonCodes: result.reasonCodes,
        },
        req,
      });

      console.log(`✓ Decision ${decisionId} completed: ${result.decision} (score: ${result.creditScore})`);
    } catch (err) {
      console.error(`✗ Decision ${decisionId} failed:`, err.message);
      processingQueue.delete(decisionId);

      await logAudit({
        action: 'ERROR_OCCURRED',
        entityType: 'decision',
        entityId: decisionId,
        result: { error: err.message },
        req,
      });
    }
  }, delay);
}

/**
 * Check if a decision is still being processed.
 */
function isProcessing(decisionId) {
  return processingQueue.has(decisionId);
}

module.exports = { processDecisionAsync, isProcessing };
