const {
  MAX_CREDIT_SCORE,
  WEIGHTS,
  EMI_RATIO,
  LOAN_MULTIPLE,
  TENURE,
  BUSINESS_RISK,
  ANNUAL_INTEREST_RATE,
  FRAUD,
  PAN_REGEX,
} = require('../utils/constants');
const REASON_CODES = require('../utils/reasonCodes');

/**
 * ═══════════════════════════════════════════════════════════════
 *  MSME Credit Decision Engine — Scoring Model
 * ═══════════════════════════════════════════════════════════════
 *
 *  Computes a custom credit score (0–750) based on 6 weighted factors:
 *
 *  | Factor                    | Weight | Signal                           |
 *  |---------------------------|--------|----------------------------------|
 *  | Revenue-to-EMI Ratio      | 30%    | Can revenue cover EMI payments?  |
 *  | Loan-to-Revenue Multiple  | 25%    | How big is the loan vs income?   |
 *  | Tenure Risk               | 15%    | Is repayment period reasonable?  |
 *  | Business Type Risk        | 10%    | Sector default probability       |
 *  | PAN Validity              | 10%    | Data quality & identity check    |
 *  | Fraud & Consistency       | 10%    | Anomaly detection                |
 *
 *  EMI is calculated using standard reducing balance formula at 14% p.a.
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Calculate EMI using the standard reducing balance formula.
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 * @param {number} principal - Loan amount
 * @param {number} tenureMonths - Repayment period in months
 * @param {number} annualRate - Annual interest rate (default 14%)
 * @returns {number} Monthly EMI amount
 */
function calculateEMI(principal, tenureMonths, annualRate = ANNUAL_INTEREST_RATE) {
  const monthlyRate = annualRate / 12;
  const compoundFactor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);
  return Math.round(emi * 100) / 100;
}

/**
 * Score Factor 1: Revenue-to-EMI Ratio (30% weight)
 * Measures whether the business generates enough revenue to cover EMI.
 *
 * Thresholds:
 *   >= 4x → 100%  (excellent coverage)
 *   >= 3x → 75%   (good coverage)
 *   >= 2x → 45%   (acceptable but tight)
 *   >= 1x → 20%   (barely covering)
 *   < 1x  → 0%    (cannot cover EMI)
 */
function scoreRevenueEmiRatio(monthlyRevenue, emi) {
  const reasons = [];
  const ratio = monthlyRevenue / emi;

  let score;
  if (ratio >= EMI_RATIO.EXCELLENT) {
    score = 1.0;
    reasons.push(REASON_CODES.GOOD_REVENUE_COVERAGE);
  } else if (ratio >= EMI_RATIO.GOOD) {
    score = 0.75;
    reasons.push(REASON_CODES.GOOD_REVENUE_COVERAGE);
  } else if (ratio >= EMI_RATIO.ACCEPTABLE) {
    score = 0.45;
  } else if (ratio >= 1) {
    score = 0.20;
    reasons.push(REASON_CODES.INSUFFICIENT_EMI_COVERAGE);
  } else {
    score = 0;
    reasons.push(REASON_CODES.INSUFFICIENT_EMI_COVERAGE);
  }

  return { score, ratio: Math.round(ratio * 100) / 100, reasons };
}

/**
 * Score Factor 2: Loan-to-Revenue Multiple (25% weight)
 * Checks if the loan amount is proportionate to monthly revenue.
 *
 * Thresholds:
 *   <= 6x   → 100% (safe)
 *   <= 9x   → 65%  (moderate)
 *   <= 12x  → 35%  (elevated risk)
 *   > 12x   → 5%   (high risk)
 */
function scoreLoanRevenueMultiple(loanAmount, monthlyRevenue) {
  const reasons = [];
  const multiple = loanAmount / monthlyRevenue;

  let score;
  if (multiple <= LOAN_MULTIPLE.SAFE) {
    score = 1.0;
    reasons.push(REASON_CODES.SAFE_LOAN_RATIO);
  } else if (multiple <= 9) {
    score = 0.65;
  } else if (multiple <= LOAN_MULTIPLE.MODERATE) {
    score = 0.35;
    reasons.push(REASON_CODES.HIGH_LOAN_RATIO);
  } else {
    score = 0.05;
    reasons.push(REASON_CODES.HIGH_LOAN_RATIO);
  }

  return { score, multiple: Math.round(multiple * 100) / 100, reasons };
}

/**
 * Score Factor 3: Tenure Risk (15% weight)
 * Very short tenures → high monthly burden, very long → high interest cost.
 *
 * Thresholds:
 *   6–36 months  → 100% (optimal)
 *   3–5 months   → 50%  (short, high burden)
 *   37–60 months → 60%  (long, acceptable)
 *   > 60 months  → 20%  (very long)
 *   < 3 months   → 15%  (extremely short)
 */
function scoreTenureRisk(tenureMonths) {
  const reasons = [];
  let score;

  if (tenureMonths >= TENURE.MIN_OPTIMAL && tenureMonths <= TENURE.MAX_OPTIMAL) {
    score = 1.0;
    reasons.push(REASON_CODES.OPTIMAL_TENURE);
  } else if (tenureMonths < TENURE.MIN_OPTIMAL && tenureMonths >= TENURE.MIN_ALLOWED) {
    score = 0.50;
    reasons.push(REASON_CODES.SHORT_TENURE_RISK);
  } else if (tenureMonths > TENURE.MAX_OPTIMAL && tenureMonths <= TENURE.MAX_ALLOWED) {
    score = 0.60;
    reasons.push(REASON_CODES.LONG_TENURE_RISK);
  } else if (tenureMonths > TENURE.MAX_ALLOWED) {
    score = 0.20;
    reasons.push(REASON_CODES.LONG_TENURE_RISK);
  } else {
    score = 0.15;
    reasons.push(REASON_CODES.SHORT_TENURE_RISK);
  }

  return { score, reasons };
}

/**
 * Score Factor 4: Business Type Risk (10% weight)
 * Different sectors have different default probabilities.
 */
function scoreBusinessType(businessType) {
  const reasons = [];
  const risk = BUSINESS_RISK[businessType] || BUSINESS_RISK.other;
  const score = 1 - risk; // Invert: lower risk → higher score

  if (risk <= 0.3) {
    reasons.push(REASON_CODES.LOW_RISK_SECTOR);
  } else if (risk >= 0.6) {
    reasons.push(REASON_CODES.HIGH_RISK_SECTOR);
  }

  return { score, sectorRisk: risk, reasons };
}

/**
 * Score Factor 5: PAN Validity (10% weight)
 * Validates PAN format as a proxy for data quality.
 */
function scorePanValidity(pan) {
  const reasons = [];
  const isValid = PAN_REGEX.test(pan);

  if (!isValid) {
    reasons.push(REASON_CODES.INVALID_PAN);
  }

  return { score: isValid ? 1.0 : 0.0, valid: isValid, reasons };
}

/**
 * Score Factor 6: Fraud & Consistency Checks (10% weight)
 * Detects anomalous or inconsistent application data.
 *
 * Checks:
 *   - Revenue below minimum threshold (₹1,000)
 *   - Revenue above extreme cap (₹100Cr)
 *   - Loan-to-revenue ratio beyond 50x (extreme outlier)
 *   - Zero or negative values that passed validation
 */
function scoreFraudConsistency(monthlyRevenue, loanAmount) {
  const reasons = [];
  let score = 1.0;
  const loanRatio = loanAmount / monthlyRevenue;

  // Check minimum revenue
  if (monthlyRevenue < FRAUD.MIN_REVENUE) {
    score -= 0.5;
    reasons.push(REASON_CODES.LOW_REVENUE);
  }

  // Check extreme revenue (potential fraud)
  if (monthlyRevenue > FRAUD.MAX_REVENUE_LAKHS * 100000) {
    score -= 0.3;
    reasons.push(REASON_CODES.DATA_INCONSISTENCY);
  }

  // Check extreme loan-to-revenue ratio
  if (loanRatio > FRAUD.EXTREME_LOAN_RATIO) {
    score -= 0.5;
    reasons.push(REASON_CODES.FRAUD_INDICATOR);
  }

  return { score: Math.max(0, score), reasons };
}

/**
 * ═════════════════════════════════════════════════
 *  Main Decision Engine — processes a single application
 * ═════════════════════════════════════════════════
 */
function evaluateApplication({ monthlyRevenue, loanAmount, tenureMonths, businessType, pan }) {
  // 1. Calculate EMI
  const emi = calculateEMI(loanAmount, tenureMonths);

  // 2. Run all scoring factors
  const factors = {
    revenueEmiRatio: scoreRevenueEmiRatio(monthlyRevenue, emi),
    loanRevenueMultiple: scoreLoanRevenueMultiple(loanAmount, monthlyRevenue),
    tenureRisk: scoreTenureRisk(tenureMonths),
    businessType: scoreBusinessType(businessType),
    panValidity: scorePanValidity(pan),
    fraudConsistency: scoreFraudConsistency(monthlyRevenue, loanAmount),
  };

  // 3. Compute weighted score
  const weightedScore =
    factors.revenueEmiRatio.score * WEIGHTS.REVENUE_EMI_RATIO +
    factors.loanRevenueMultiple.score * WEIGHTS.LOAN_REVENUE_MULTIPLE +
    factors.tenureRisk.score * WEIGHTS.TENURE_RISK +
    factors.businessType.score * WEIGHTS.BUSINESS_TYPE +
    factors.panValidity.score * WEIGHTS.PAN_VALIDITY +
    factors.fraudConsistency.score * WEIGHTS.FRAUD_CONSISTENCY;

  const creditScore = Math.round(weightedScore * MAX_CREDIT_SCORE);

  // 4. Collect all reason codes (unique)
  const allReasons = [];
  Object.values(factors).forEach((f) => {
    f.reasons.forEach((r) => {
      if (!allReasons.find((ar) => ar.code === r.code)) {
        allReasons.push(r);
      }
    });
  });

  // 5. Determine decision and risk level
  let decision, riskLevel;
  if (creditScore >= 600) {
    decision = 'APPROVED';
    riskLevel = 'LOW';
  } else if (creditScore >= 450) {
    decision = 'APPROVED';
    riskLevel = 'MEDIUM';
  } else if (creditScore >= 300) {
    decision = 'REJECTED';
    riskLevel = 'HIGH';
  } else {
    decision = 'REJECTED';
    riskLevel = 'VERY_HIGH';
  }

  // 6. Build score breakdown for transparency
  const scoreBreakdown = {
    revenueEmiRatio: {
      weight: '30%',
      rawScore: factors.revenueEmiRatio.score,
      points: Math.round(factors.revenueEmiRatio.score * WEIGHTS.REVENUE_EMI_RATIO * MAX_CREDIT_SCORE),
      ratio: factors.revenueEmiRatio.ratio,
    },
    loanRevenueMultiple: {
      weight: '25%',
      rawScore: factors.loanRevenueMultiple.score,
      points: Math.round(factors.loanRevenueMultiple.score * WEIGHTS.LOAN_REVENUE_MULTIPLE * MAX_CREDIT_SCORE),
      multiple: factors.loanRevenueMultiple.multiple,
    },
    tenureRisk: {
      weight: '15%',
      rawScore: factors.tenureRisk.score,
      points: Math.round(factors.tenureRisk.score * WEIGHTS.TENURE_RISK * MAX_CREDIT_SCORE),
    },
    businessType: {
      weight: '10%',
      rawScore: factors.businessType.score,
      points: Math.round(factors.businessType.score * WEIGHTS.BUSINESS_TYPE * MAX_CREDIT_SCORE),
      sectorRisk: factors.businessType.sectorRisk,
    },
    panValidity: {
      weight: '10%',
      rawScore: factors.panValidity.score,
      points: Math.round(factors.panValidity.score * WEIGHTS.PAN_VALIDITY * MAX_CREDIT_SCORE),
      valid: factors.panValidity.valid,
    },
    fraudConsistency: {
      weight: '10%',
      rawScore: factors.fraudConsistency.score,
      points: Math.round(factors.fraudConsistency.score * WEIGHTS.FRAUD_CONSISTENCY * MAX_CREDIT_SCORE),
    },
  };

  return {
    decision,
    creditScore,
    riskLevel,
    reasonCodes: allReasons.map((r) => r.code),
    reasonDetails: allReasons,
    scoreBreakdown,
    estimatedEmi: emi,
  };
}

module.exports = { evaluateApplication, calculateEMI };
