import { useState } from 'react';
import { validateProfile } from '../../utils/validation';

const BUSINESS_TYPES = [
  { value: '', label: 'Select business type...' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'retail', label: 'Retail' },
  { value: 'trading', label: 'Trading' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
];

export default function BusinessProfileForm({ data, onChange, onNext }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function handleChange(field, value) {
    onChange({ ...data, [field]: value });
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validateProfile({ ...data });
    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateProfile(data);
    setErrors(validationErrors);
    setTouched({
      ownerName: true,
      pan: true,
      businessType: true,
      monthlyRevenue: true,
    });

    if (Object.keys(validationErrors).length === 0) {
      onNext();
    }
  }

  return (
    <div className="glass-card">
      <div className="card-header">
        <h2 className="card-title">Business Profile</h2>
        <p className="card-description">
          Enter the business owner's details and financial information.
          All fields are required for credit assessment.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {/* Owner Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="ownerName">
              Business Owner Name <span className="required">*</span>
            </label>
            <input
              id="ownerName"
              type="text"
              className={`form-input ${touched.ownerName && errors.ownerName ? 'error' : ''}`}
              placeholder="e.g. Rajesh Kumar"
              value={data.ownerName || ''}
              onChange={(e) => handleChange('ownerName', e.target.value)}
              onBlur={() => handleBlur('ownerName')}
              autoComplete="name"
            />
            {touched.ownerName && errors.ownerName && (
              <span className="form-error">⚠ {errors.ownerName}</span>
            )}
          </div>

          {/* PAN */}
          <div className="form-group">
            <label className="form-label" htmlFor="pan">
              PAN <span className="required">*</span>
            </label>
            <input
              id="pan"
              type="text"
              className={`form-input ${touched.pan && errors.pan ? 'error' : ''}`}
              placeholder="e.g. ABCDE1234F"
              value={data.pan || ''}
              onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('pan')}
              maxLength={10}
              style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }}
            />
            {touched.pan && errors.pan && (
              <span className="form-error">⚠ {errors.pan}</span>
            )}
            <span className="form-hint">Format: 5 letters + 4 digits + 1 letter</span>
          </div>

          {/* Business Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="businessType">
              Business Type <span className="required">*</span>
            </label>
            <select
              id="businessType"
              className={`form-select ${touched.businessType && errors.businessType ? 'error' : ''}`}
              value={data.businessType || ''}
              onChange={(e) => handleChange('businessType', e.target.value)}
              onBlur={() => handleBlur('businessType')}
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {touched.businessType && errors.businessType && (
              <span className="form-error">⚠ {errors.businessType}</span>
            )}
          </div>

          {/* Monthly Revenue */}
          <div className="form-group">
            <label className="form-label" htmlFor="monthlyRevenue">
              Monthly Revenue <span className="required">*</span>
            </label>
            <div className="input-prefix">
              <span className="prefix">₹</span>
              <input
                id="monthlyRevenue"
                type="number"
                className={`form-input ${touched.monthlyRevenue && errors.monthlyRevenue ? 'error' : ''}`}
                placeholder="e.g. 500000"
                value={data.monthlyRevenue || ''}
                onChange={(e) => handleChange('monthlyRevenue', e.target.value)}
                onBlur={() => handleBlur('monthlyRevenue')}
                min="0"
                step="1000"
              />
            </div>
            {touched.monthlyRevenue && errors.monthlyRevenue && (
              <span className="form-error">⚠ {errors.monthlyRevenue}</span>
            )}
            <span className="form-hint">Enter gross monthly revenue in INR</span>
          </div>
        </div>

        <div className="form-actions">
          <div /> {/* Spacer */}
          <button type="submit" className="btn btn-primary" id="profile-next-btn">
            Continue to Loan Details →
          </button>
        </div>
      </form>
    </div>
  );
}
