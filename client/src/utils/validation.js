/**
 * Validate business profile fields.
 */
export function validateProfile(data) {
  const errors = {};

  if (!data.ownerName || data.ownerName.trim().length < 2) {
    errors.ownerName = 'Owner name must be at least 2 characters';
  }

  if (!data.pan || data.pan.trim().length === 0) {
    errors.pan = 'PAN is required';
  } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(data.pan.trim())) {
    errors.pan = 'PAN must be in format ABCDE1234F';
  }

  if (!data.businessType) {
    errors.businessType = 'Please select a business type';
  }

  if (!data.monthlyRevenue && data.monthlyRevenue !== 0) {
    errors.monthlyRevenue = 'Monthly revenue is required';
  } else if (isNaN(data.monthlyRevenue) || Number(data.monthlyRevenue) < 0) {
    errors.monthlyRevenue = 'Revenue must be a positive number';
  }

  return errors;
}

/**
 * Validate loan application fields.
 */
export function validateLoan(data) {
  const errors = {};

  if (!data.loanAmount && data.loanAmount !== 0) {
    errors.loanAmount = 'Loan amount is required';
  } else if (isNaN(data.loanAmount) || Number(data.loanAmount) <= 0) {
    errors.loanAmount = 'Loan amount must be a positive number';
  }

  if (!data.tenureMonths && data.tenureMonths !== 0) {
    errors.tenureMonths = 'Tenure is required';
  } else {
    const tenure = Number(data.tenureMonths);
    if (isNaN(tenure) || tenure < 1 || tenure > 120 || !Number.isInteger(tenure)) {
      errors.tenureMonths = 'Tenure must be between 1 and 120 months';
    }
  }

  if (!data.purpose || data.purpose.trim().length < 5) {
    errors.purpose = 'Purpose must be at least 5 characters';
  }

  return errors;
}
