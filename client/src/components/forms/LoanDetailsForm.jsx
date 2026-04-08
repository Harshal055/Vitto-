import { useState } from 'react';
import { validateLoan } from '../../utils/validation';
import { formatCurrency } from '../../utils/formatters';

const COMMON_PURPOSES = [
  'Working capital requirements',
  'Equipment purchase',
  'Business expansion',
  'Inventory financing',
  'Debt consolidation',
  'Infrastructure upgrade',
];

export default function LoanDetailsForm({ data, onChange, onNext, onBack, profileData }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function handleChange(field, value) {
    onChange({ ...data, [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validateLoan({ ...data });
    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateLoan(data);
    setErrors(validationErrors);
    setTouched({
      loanAmount: true,
      tenureMonths: true,
      purpose: true,
    });

    if (Object.keys(validationErrors).length === 0) {
      onNext();
    }
  }

  // Quick EMI estimate for preview
  const estimatedEmi = (() => {
    const p = Number(data.loanAmount);
    const n = Number(data.tenureMonths);
    if (!p || !n || p <= 0 || n <= 0) return null;
    const r = 0.14 / 12;
    const factor = Math.pow(1 + r, n);
    return Math.round((p * r * factor) / (factor - 1));
  })();

  return (
    <div className="glass-card">
      <div className="card-header">
        <h2 className="card-title">Loan Details</h2>
        <p className="card-description">
          Specify the loan amount, repayment tenure, and purpose.
          The decision engine will evaluate your application based on these inputs.
        </p>
      </div>

      {/* Profile Summary */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg-glass)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-glass)',
        marginBottom: 'var(--space-6)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--text-secondary)',
        flexWrap: 'wrap',
      }}>
        <span>👤 {profileData?.ownerName}</span>
        <span>🏢 {profileData?.businessType}</span>
        <span>💰 {formatCurrency(profileData?.monthlyRevenue)}/mo</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {/* Loan Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="loanAmount">
              Requested Loan Amount <span className="required">*</span>
            </label>
            <div className="input-prefix">
              <span className="prefix">₹</span>
              <input
                id="loanAmount"
                type="number"
                className={`form-input ${touched.loanAmount && errors.loanAmount ? 'error' : ''}`}
                placeholder="e.g. 2500000"
                value={data.loanAmount || ''}
                onChange={(e) => handleChange('loanAmount', e.target.value)}
                onBlur={() => handleBlur('loanAmount')}
                min="1"
                step="10000"
              />
            </div>
            {touched.loanAmount && errors.loanAmount && (
              <span className="form-error">⚠ {errors.loanAmount}</span>
            )}
          </div>

          {/* Tenure */}
          <div className="form-group">
            <label className="form-label" htmlFor="tenureMonths">
              Repayment Tenure (months) <span className="required">*</span>
            </label>
            <input
              id="tenureMonths"
              type="number"
              className={`form-input ${touched.tenureMonths && errors.tenureMonths ? 'error' : ''}`}
              placeholder="e.g. 24"
              value={data.tenureMonths || ''}
              onChange={(e) => handleChange('tenureMonths', e.target.value)}
              onBlur={() => handleBlur('tenureMonths')}
              min="1"
              max="120"
              step="1"
            />
            {touched.tenureMonths && errors.tenureMonths && (
              <span className="form-error">⚠ {errors.tenureMonths}</span>
            )}
            <span className="form-hint">Optimal range: 6–36 months</span>
          </div>

          {/* Purpose */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="purpose">
              Purpose of Loan <span className="required">*</span>
            </label>
            <textarea
              id="purpose"
              className={`form-textarea ${touched.purpose && errors.purpose ? 'error' : ''}`}
              placeholder="Describe the purpose of this loan..."
              value={data.purpose || ''}
              onChange={(e) => handleChange('purpose', e.target.value)}
              onBlur={() => handleBlur('purpose')}
              rows={3}
            />
            {touched.purpose && errors.purpose && (
              <span className="form-error">⚠ {errors.purpose}</span>
            )}
            {/* Quick purpose tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-2)',
            }}>
              {COMMON_PURPOSES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="btn btn-ghost"
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-glass)',
                  }}
                  onClick={() => handleChange('purpose', p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EMI Preview */}
        {estimatedEmi && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-4)',
            background: 'var(--gradient-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-glass)',
            marginTop: 'var(--space-5)',
          }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
              Estimated Monthly EMI
            </div>
            <div style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              background: 'var(--gradient-accent)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {formatCurrency(estimatedEmi)}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
              @ 14% p.a. reducing balance
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack} id="loan-back-btn">
            ← Back
          </button>
          <button type="submit" className="btn btn-primary" id="loan-submit-btn">
            Submit Application →
          </button>
        </div>
      </form>
    </div>
  );
}
