/**
 * Global constants and thresholds for the lending decision system.
 * All values are documented and defensible.
 */
module.exports = {
  // ── Credit Score ──
  MAX_CREDIT_SCORE: 750,
  APPROVAL_THRESHOLD: 450,        // Score >= 450 → Approved
  HIGH_CONFIDENCE_THRESHOLD: 600, // Score >= 600 → Low Risk approval

  // ── Scoring Weights (must sum to 1.0) ──
  WEIGHTS: {
    REVENUE_EMI_RATIO: 0.30,       // 30% — most critical signal
    LOAN_REVENUE_MULTIPLE: 0.25,   // 25% — how much relative to income
    TENURE_RISK: 0.15,             // 15% — repayment period risk
    BUSINESS_TYPE: 0.10,           // 10% — sector risk profile
    PAN_VALIDITY: 0.10,            // 10% — data quality
    FRAUD_CONSISTENCY: 0.10,       // 10% — anomaly detection
  },

  // ── Revenue-to-EMI Ratio Thresholds ──
  EMI_RATIO: {
    EXCELLENT: 4,    // revenue / EMI >= 4 → full marks
    GOOD: 3,         // >= 3 → high marks
    ACCEPTABLE: 2,   // >= 2 → moderate
    // < 2 → red flag
  },

  // ── Loan-to-Revenue Multiple Thresholds ──
  LOAN_MULTIPLE: {
    SAFE: 6,         // loan / monthlyRevenue <= 6 → safe
    MODERATE: 12,    // <= 12 → moderate risk
    // > 12 → high risk
  },

  // ── Tenure Ranges (months) ──
  TENURE: {
    MIN_OPTIMAL: 6,
    MAX_OPTIMAL: 36,
    MAX_ALLOWED: 60,
    MIN_ALLOWED: 3,
  },

  // ── Business Type Risk Scores (0-1, lower = safer) ──
  BUSINESS_RISK: {
    manufacturing: 0.2,
    services: 0.4,
    retail: 0.6,
    trading: 0.5,
    agriculture: 0.7,
    other: 0.5,
  },

  // ── Assumed Annual Interest Rate for EMI calculation ──
  ANNUAL_INTEREST_RATE: 0.14, // 14% p.a.

  // ── Fraud Detection Thresholds ──
  FRAUD: {
    MAX_REVENUE_LAKHS: 10000,       // ₹100Cr cap — flag beyond this
    MIN_REVENUE: 1000,              // ₹1,000 minimum monthly revenue
    EXTREME_LOAN_RATIO: 50,         // loan > 50x revenue → fraud flag
  },

  // ── PAN Format ──
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
};
