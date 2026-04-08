const LoanApplication = require('../models/pg/LoanApplication');
const BusinessProfile = require('../models/pg/BusinessProfile');
const { logAudit } = require('../middleware/auditLogger');

/**
 * POST /api/v1/loans
 * Submit a new loan application.
 */
async function createLoan(req, res, next) {
  try {
    const { profileId, loanAmount, tenureMonths, purpose } = req.body;

    // Verify profile exists
    const profile = await BusinessProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'The referenced business profile does not exist',
          details: [],
        },
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const loan = await LoanApplication.create({
      profileId,
      loanAmount,
      tenureMonths,
      purpose,
    });

    await logAudit({
      action: 'LOAN_SUBMITTED',
      entityType: 'loan',
      entityId: loan.id,
      payload: { profileId, loanAmount, tenureMonths, purpose },
      req,
    });

    res.status(201).json({
      success: true,
      data: loan,
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
 * GET /api/v1/loans/:id
 * Retrieve a loan application with business profile data.
 */
async function getLoan(req, res, next) {
  try {
    const loan = await LoanApplication.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: 'Loan application not found',
          details: [],
        },
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      data: loan,
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

module.exports = { createLoan, getLoan };
