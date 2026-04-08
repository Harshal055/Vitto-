const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

/**
 * Generic API request handler with error handling.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        ...data.error,
      };
    }

    return data;
  } catch (err) {
    if (err.code) throw err; // Already structured
    throw {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please check your connection.',
      details: [],
    };
  }
}

/**
 * Create a business profile.
 */
export async function createProfile(profileData) {
  return apiRequest('/profiles', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}

/**
 * Submit a loan application.
 */
export async function createLoan(loanData) {
  return apiRequest('/loans', {
    method: 'POST',
    body: JSON.stringify(loanData),
  });
}

/**
 * Request a credit decision (returns 202 with processing status).
 */
export async function requestDecision(applicationId) {
  return apiRequest('/decisions', {
    method: 'POST',
    body: JSON.stringify({ applicationId }),
  });
}

/**
 * Poll for decision status/result.
 */
export async function getDecision(decisionId) {
  return apiRequest(`/decisions/${decisionId}`);
}

/**
 * Get audit trail for a decision.
 */
export async function getDecisionAudit(decisionId) {
  return apiRequest(`/decisions/${decisionId}/audit`);
}

/**
 * Full application flow — creates profile, loan, and triggers decision.
 * Returns the decision ID for polling.
 */
export async function submitFullApplication({ profile, loan }) {
  // Step 1: Create business profile
  const profileResult = await createProfile(profile);
  const profileId = profileResult.data.id;

  // Step 2: Submit loan application
  const loanResult = await createLoan({
    profileId,
    ...loan,
  });
  const applicationId = loanResult.data.id;

  // Step 3: Request decision
  const decisionResult = await requestDecision(applicationId);

  return {
    profileId,
    applicationId,
    decisionId: decisionResult.data.id,
  };
}
