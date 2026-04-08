/**
 * Reason codes returned by the decision engine.
 * Each code maps to a human-readable description.
 */
const REASON_CODES = {
  LOW_REVENUE: {
    code: 'LOW_REVENUE',
    message: 'Monthly revenue is insufficient for the requested loan amount',
    severity: 'critical',
  },
  HIGH_LOAN_RATIO: {
    code: 'HIGH_LOAN_RATIO',
    message: 'Loan amount exceeds safe revenue multiple (>12x monthly revenue)',
    severity: 'critical',
  },
  INSUFFICIENT_EMI_COVERAGE: {
    code: 'INSUFFICIENT_EMI_COVERAGE',
    message: 'Monthly revenue cannot adequately cover estimated EMI payments',
    severity: 'critical',
  },
  SHORT_TENURE_RISK: {
    code: 'SHORT_TENURE_RISK',
    message: 'Very short repayment window increases monthly burden and default risk',
    severity: 'warning',
  },
  LONG_TENURE_RISK: {
    code: 'LONG_TENURE_RISK',
    message: 'Extended tenure significantly increases total interest burden',
    severity: 'warning',
  },
  HIGH_RISK_SECTOR: {
    code: 'HIGH_RISK_SECTOR',
    message: 'Business sector carries an elevated risk profile',
    severity: 'info',
  },
  INVALID_PAN: {
    code: 'INVALID_PAN',
    message: 'PAN format validation failed — expected format: ABCDE1234F',
    severity: 'critical',
  },
  DATA_INCONSISTENCY: {
    code: 'DATA_INCONSISTENCY',
    message: 'Input data contains conflicting or implausible values',
    severity: 'critical',
  },
  FRAUD_INDICATOR: {
    code: 'FRAUD_INDICATOR',
    message: 'Suspicious patterns detected in the application data',
    severity: 'critical',
  },
  MISSING_DATA: {
    code: 'MISSING_DATA',
    message: 'One or more required fields are incomplete or missing',
    severity: 'critical',
  },
  GOOD_REVENUE_COVERAGE: {
    code: 'GOOD_REVENUE_COVERAGE',
    message: 'Strong revenue-to-EMI coverage ratio',
    severity: 'positive',
  },
  SAFE_LOAN_RATIO: {
    code: 'SAFE_LOAN_RATIO',
    message: 'Loan amount is within safe revenue multiple',
    severity: 'positive',
  },
  OPTIMAL_TENURE: {
    code: 'OPTIMAL_TENURE',
    message: 'Repayment tenure is within the optimal range',
    severity: 'positive',
  },
  LOW_RISK_SECTOR: {
    code: 'LOW_RISK_SECTOR',
    message: 'Business sector has a historically low default rate',
    severity: 'positive',
  },
};

module.exports = REASON_CODES;
