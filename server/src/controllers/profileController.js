const BusinessProfile = require('../models/pg/BusinessProfile');
const { logAudit } = require('../middleware/auditLogger');

/**
 * POST /api/v1/profiles
 * Create a new business profile.
 */
async function createProfile(req, res, next) {
  try {
    const { ownerName, pan, businessType, monthlyRevenue } = req.body;

    const profile = await BusinessProfile.create({
      ownerName,
      pan,
      businessType,
      monthlyRevenue,
    });

    await logAudit({
      action: 'PROFILE_CREATED',
      entityType: 'profile',
      entityId: profile.id,
      payload: { ownerName, pan, businessType, monthlyRevenue },
      req,
    });

    res.status(201).json({
      success: true,
      data: profile,
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
 * GET /api/v1/profiles/:id
 * Retrieve a business profile by ID.
 */
async function getProfile(req, res, next) {
  try {
    const profile = await BusinessProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: 'Business profile not found',
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
      data: profile,
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

module.exports = { createProfile, getProfile };
