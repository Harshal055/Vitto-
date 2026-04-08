/**
 * Format currency in Indian Rupees.
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency with decimals.
 */
export function formatCurrencyDecimal(amount) {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a reason code to human readable label.
 */
export function formatReasonCode(code) {
  return code
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get severity info for a reason code.
 */
const SEVERITY_MAP = {
  LOW_REVENUE: 'critical',
  HIGH_LOAN_RATIO: 'critical',
  INSUFFICIENT_EMI_COVERAGE: 'critical',
  SHORT_TENURE_RISK: 'warning',
  LONG_TENURE_RISK: 'warning',
  HIGH_RISK_SECTOR: 'info',
  INVALID_PAN: 'critical',
  DATA_INCONSISTENCY: 'critical',
  FRAUD_INDICATOR: 'critical',
  MISSING_DATA: 'critical',
  GOOD_REVENUE_COVERAGE: 'positive',
  SAFE_LOAN_RATIO: 'positive',
  OPTIMAL_TENURE: 'positive',
  LOW_RISK_SECTOR: 'positive',
};

const REASON_MESSAGES = {
  LOW_REVENUE: 'Monthly revenue is insufficient for the requested loan amount',
  HIGH_LOAN_RATIO: 'Loan amount exceeds safe revenue multiple (>12x monthly revenue)',
  INSUFFICIENT_EMI_COVERAGE: 'Monthly revenue cannot adequately cover estimated EMI payments',
  SHORT_TENURE_RISK: 'Very short repayment window increases monthly burden and default risk',
  LONG_TENURE_RISK: 'Extended tenure significantly increases total interest burden',
  HIGH_RISK_SECTOR: 'Business sector carries an elevated risk profile',
  INVALID_PAN: 'PAN format validation failed — expected format: ABCDE1234F',
  DATA_INCONSISTENCY: 'Input data contains conflicting or implausible values',
  FRAUD_INDICATOR: 'Suspicious patterns detected in the application data',
  MISSING_DATA: 'One or more required fields are incomplete or missing',
  GOOD_REVENUE_COVERAGE: 'Strong revenue-to-EMI coverage ratio',
  SAFE_LOAN_RATIO: 'Loan amount is within safe revenue multiple',
  OPTIMAL_TENURE: 'Repayment tenure is within the optimal range',
  LOW_RISK_SECTOR: 'Business sector has a historically low default rate',
};

export function getReasonInfo(code) {
  return {
    code,
    severity: SEVERITY_MAP[code] || 'info',
    message: REASON_MESSAGES[code] || code,
  };
}

/**
 * Get severity icon.
 */
export function getSeverityIcon(severity) {
  switch (severity) {
    case 'critical': return '✕';
    case 'warning': return '⚠';
    case 'positive': return '✓';
    default: return 'ℹ';
  }
}

/**
 * Get score color based on credit score value.
 */
export function getScoreColor(score) {
  if (score >= 600) return '#10b981';
  if (score >= 450) return '#f59e0b';
  if (score >= 300) return '#f97316';
  return '#ef4444';
}
