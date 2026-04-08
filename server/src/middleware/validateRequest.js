const { body, param, validationResult } = require('express-validator');
const { PAN_REGEX } = require('../utils/constants');

/**
 * Middleware to check validation results and return structured errors.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'One or more fields failed validation',
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
          value: e.value,
        })),
      },
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
  next();
}

/**
 * Validation chains for profile creation.
 */
const validateProfile = [
  body('ownerName')
    .trim()
    .notEmpty().withMessage('Business owner name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Owner name must be 2–255 characters'),
  body('pan')
    .trim()
    .notEmpty().withMessage('PAN is required')
    .toUpperCase()
    .matches(PAN_REGEX).withMessage('PAN must be in format ABCDE1234F (5 letters, 4 digits, 1 letter)'),
  body('businessType')
    .trim()
    .notEmpty().withMessage('Business type is required')
    .isIn(['retail', 'manufacturing', 'services', 'trading', 'agriculture', 'other'])
    .withMessage('Business type must be one of: retail, manufacturing, services, trading, agriculture, other'),
  body('monthlyRevenue')
    .notEmpty().withMessage('Monthly revenue is required')
    .isFloat({ min: 0 }).withMessage('Monthly revenue must be a positive number')
    .toFloat(),
  handleValidationErrors,
];

/**
 * Validation chains for loan application.
 */
const validateLoan = [
  body('profileId')
    .notEmpty().withMessage('Profile ID is required')
    .isUUID().withMessage('Profile ID must be a valid UUID'),
  body('loanAmount')
    .notEmpty().withMessage('Loan amount is required')
    .isFloat({ min: 1 }).withMessage('Loan amount must be a positive number')
    .toFloat(),
  body('tenureMonths')
    .notEmpty().withMessage('Repayment tenure is required')
    .isInt({ min: 1, max: 120 }).withMessage('Tenure must be between 1 and 120 months')
    .toInt(),
  body('purpose')
    .trim()
    .notEmpty().withMessage('Purpose of the loan is required')
    .isLength({ min: 5, max: 500 }).withMessage('Purpose must be 5–500 characters'),
  handleValidationErrors,
];

/**
 * Validation chains for decision request.
 */
const validateDecision = [
  body('applicationId')
    .notEmpty().withMessage('Application ID is required')
    .isUUID().withMessage('Application ID must be a valid UUID'),
  handleValidationErrors,
];

/**
 * Validate UUID param.
 */
const validateUUIDParam = [
  param('id')
    .isUUID().withMessage('ID must be a valid UUID'),
  handleValidationErrors,
];

module.exports = {
  validateProfile,
  validateLoan,
  validateDecision,
  validateUUIDParam,
  handleValidationErrors,
};
