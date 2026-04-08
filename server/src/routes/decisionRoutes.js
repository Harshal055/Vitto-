const express = require('express');
const router = express.Router();
const { createDecision, getDecision, getDecisionAudit } = require('../controllers/decisionController');
const { validateDecision, validateUUIDParam } = require('../middleware/validateRequest');
const { decisionLimiter } = require('../middleware/rateLimiter');

router.post('/', decisionLimiter, validateDecision, createDecision);
router.get('/:id', validateUUIDParam, getDecision);
router.get('/:id/audit', validateUUIDParam, getDecisionAudit);

module.exports = router;
