import CreditScoreGauge from './CreditScoreGauge';
import ReasonCodeCard from './ReasonCodeCard';
import { formatCurrency, formatCurrencyDecimal } from '../../utils/formatters';

/**
 * Decision result view — shows approval status, credit score, breakdown, and reason codes.
 */
export default function DecisionResult({ decision, onReset }) {
  const isApproved = decision.decision === 'APPROVED';
  const breakdown = decision.score_breakdown || {};

  const breakdownItems = [
    {
      label: 'Revenue-EMI Ratio',
      value: breakdown.revenueEmiRatio?.ratio
        ? `${breakdown.revenueEmiRatio.ratio}x`
        : 'N/A',
      points: breakdown.revenueEmiRatio?.points || 0,
      maxPoints: 225,
      detail: `${breakdown.revenueEmiRatio?.weight || '30%'} weight`,
      color: '#3b82f6',
    },
    {
      label: 'Loan-Revenue Multiple',
      value: breakdown.loanRevenueMultiple?.multiple
        ? `${breakdown.loanRevenueMultiple.multiple}x`
        : 'N/A',
      points: breakdown.loanRevenueMultiple?.points || 0,
      maxPoints: 188,
      detail: `${breakdown.loanRevenueMultiple?.weight || '25%'} weight`,
      color: '#8b5cf6',
    },
    {
      label: 'Tenure Risk',
      points: breakdown.tenureRisk?.points || 0,
      maxPoints: 113,
      detail: `${breakdown.tenureRisk?.weight || '15%'} weight`,
      color: '#06b6d4',
    },
    {
      label: 'Business Sector',
      value: breakdown.businessType?.sectorRisk != null
        ? `${Math.round((1 - breakdown.businessType.sectorRisk) * 100)}%`
        : 'N/A',
      points: breakdown.businessType?.points || 0,
      maxPoints: 75,
      detail: `${breakdown.businessType?.weight || '10%'} weight`,
      color: '#f59e0b',
    },
    {
      label: 'PAN Validity',
      value: breakdown.panValidity?.valid ? '✓ Valid' : '✕ Invalid',
      points: breakdown.panValidity?.points || 0,
      maxPoints: 75,
      detail: `${breakdown.panValidity?.weight || '10%'} weight`,
      color: breakdown.panValidity?.valid ? '#10b981' : '#ef4444',
    },
    {
      label: 'Fraud Checks',
      points: breakdown.fraudConsistency?.points || 0,
      maxPoints: 75,
      detail: `${breakdown.fraudConsistency?.weight || '10%'} weight`,
      color: '#10b981',
    },
  ];

  return (
    <div className="decision-result">
      {/* Decision Status */}
      <div className="decision-header">
        <div className={`decision-badge ${isApproved ? 'approved' : 'rejected'}`}>
          <span>{isApproved ? '✓' : '✕'}</span>
          <span>{decision.decision}</span>
        </div>
        <p style={{
          color: 'var(--text-secondary)',
          marginTop: 'var(--space-3)',
          fontSize: 'var(--font-size-sm)'
        }}>
          Application processed for <strong style={{ color: 'var(--text-primary)' }}>
            {decision.owner_name}
          </strong>
        </p>
      </div>

      {/* Credit Score Gauge */}
      <div className="score-gauge-container">
        <CreditScoreGauge score={decision.credit_score} />
        <span className={`risk-label ${decision.risk_level?.toLowerCase()}`}>
          {decision.risk_level?.replace('_', ' ')} Risk
        </span>
      </div>

      {/* Estimated EMI */}
      <div className="emi-card">
        <div className="emi-amount">
          {formatCurrencyDecimal(decision.estimated_emi)}
        </div>
        <div className="emi-label">Estimated Monthly EMI @ 14% p.a.</div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-8)',
          marginTop: 'var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-muted)'
        }}>
          <span>Loan: {formatCurrency(decision.loan_amount)}</span>
          <span>Tenure: {decision.tenure_months} months</span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <h3 style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 600,
          marginBottom: 'var(--space-4)'
        }}>
          Score Breakdown
        </h3>
        <div className="breakdown-grid">
          {breakdownItems.map((item, i) => (
            <div
              className="breakdown-item"
              key={item.label}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="breakdown-label">{item.label}</div>
              <div className="breakdown-value" style={{ color: item.color }}>
                {item.points}
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-muted)',
                  fontWeight: 400
                }}>
                  /{item.maxPoints}
                </span>
              </div>
              {item.value && (
                <div className="breakdown-detail">{item.value}</div>
              )}
              <div className="breakdown-detail">{item.detail}</div>
              <div className="breakdown-bar">
                <div
                  className="breakdown-bar-fill"
                  style={{
                    width: `${Math.min((item.points / item.maxPoints) * 100, 100)}%`,
                    background: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reason Codes */}
      <div className="reason-codes">
        <h3 className="reason-codes-title">
          Decision Factors ({(decision.reason_codes || []).length})
        </h3>
        {(decision.reason_codes || []).map((code, i) => (
          <ReasonCodeCard key={code} code={code} index={i} />
        ))}
      </div>

      {/* Actions */}
      <div className="form-actions" style={{ justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={onReset}
          id="new-application-btn"
        >
          Submit New Application
        </button>
      </div>
    </div>
  );
}
