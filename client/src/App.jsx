import { useState, useCallback } from 'react';
import './App.css';
import BusinessProfileForm from './components/forms/BusinessProfileForm';
import LoanDetailsForm from './components/forms/LoanDetailsForm';
import DecisionResult from './components/decision/DecisionResult';
import { useDecisionPolling } from './hooks/useDecisionPolling';
import { submitFullApplication } from './services/api';

const STEPS = [
  { number: 1, label: 'Business Profile' },
  { number: 2, label: 'Loan Details' },
  { number: 3, label: 'Decision' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({});
  const [loanData, setLoanData] = useState({});
  const [decisionId, setDecisionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const { decision, isPolling, error: pollingError } = useDecisionPolling(decisionId);

  // Handle full application submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const result = await submitFullApplication({
        profile: {
          ownerName: profileData.ownerName,
          pan: profileData.pan,
          businessType: profileData.businessType,
          monthlyRevenue: Number(profileData.monthlyRevenue),
        },
        loan: {
          loanAmount: Number(loanData.loanAmount),
          tenureMonths: Number(loanData.tenureMonths),
          purpose: loanData.purpose,
        },
      });

      setDecisionId(result.decisionId);
      setCurrentStep(3);
    } catch (err) {
      setApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [profileData, loanData]);

  // Reset to start a new application
  const handleReset = () => {
    setCurrentStep(1);
    setProfileData({});
    setLoanData({});
    setDecisionId(null);
    setApiError(null);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="header-logo">L</div>
            <div>
              <div className="header-title">LendDecide</div>
              <div className="header-subtitle">MSME Lending Decision System</div>
            </div>
          </div>
          <div className="header-badge">v1.0 — Vitto Assessment</div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        {/* Step Indicator */}
        <div className="step-indicator">
          {STEPS.map((step, i) => (
            <div className="step-item" key={step.number}>
              {i > 0 && (
                <div className={`step-connector ${currentStep > step.number - 1 ? 'completed' : ''}`} />
              )}
              <div
                className={`step-circle ${
                  currentStep === step.number
                    ? 'active'
                    : currentStep > step.number
                      ? 'completed'
                      : ''
                }`}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <span
                className={`step-label ${
                  currentStep === step.number
                    ? 'active'
                    : currentStep > step.number
                      ? 'completed'
                      : ''
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* API Error */}
        {apiError && (
          <div className="error-alert">
            <span className="error-alert-icon">⚠</span>
            <div>
              <div className="error-alert-text" style={{ fontWeight: 600 }}>
                {apiError.code || 'Error'}
              </div>
              <div className="error-alert-text">
                {apiError.message}
              </div>
              {apiError.details && apiError.details.length > 0 && (
                <ul style={{
                  marginTop: 'var(--space-2)',
                  paddingLeft: 'var(--space-4)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--accent-red)',
                }}>
                  {apiError.details.map((d, i) => (
                    <li key={i}>{d.field}: {d.message}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Business Profile */}
        {currentStep === 1 && (
          <BusinessProfileForm
            data={profileData}
            onChange={setProfileData}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* Step 2: Loan Details */}
        {currentStep === 2 && (
          <LoanDetailsForm
            data={loanData}
            onChange={setLoanData}
            onNext={handleSubmit}
            onBack={() => setCurrentStep(1)}
            profileData={profileData}
          />
        )}

        {/* Step 3: Decision / Processing */}
        {currentStep === 3 && (
          <>
            {(isSubmitting || isPolling) && !decision && (
              <div className="glass-card">
                <div className="loading-overlay">
                  <div className="spinner spinner-lg" style={{
                    borderTopColor: 'var(--accent-blue)',
                  }} />
                  <div className="loading-text">
                    Processing your application
                    <span className="processing-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  </div>
                  <div className="loading-subtext">
                    Our decision engine is evaluating your credit profile.
                    This typically takes 2–4 seconds.
                  </div>
                </div>
              </div>
            )}

            {pollingError && (
              <div className="glass-card">
                <div className="error-alert">
                  <span className="error-alert-icon">⚠</span>
                  <div>
                    <div className="error-alert-text" style={{ fontWeight: 600 }}>
                      Processing Error
                    </div>
                    <div className="error-alert-text">
                      {pollingError.message || 'An error occurred while processing your application.'}
                    </div>
                  </div>
                </div>
                <div className="form-actions" style={{ justifyContent: 'center', borderTop: 'none', marginTop: 'var(--space-4)' }}>
                  <button className="btn btn-primary" onClick={handleReset}>
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {decision && (
              <div className="glass-card">
                <DecisionResult decision={decision} onReset={handleReset} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: 'var(--space-6) var(--space-4)',
        borderTop: '1px solid var(--border-glass)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--text-muted)',
      }}>
        MSME Lending Decision System — Built for Vitto Technical Assessment
      </footer>
    </div>
  );
}
