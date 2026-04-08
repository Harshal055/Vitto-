const { getPool, isInMemoryMode, getMemoryStore } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

const Decision = {
  async create({ applicationId, profileId }) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      const decision = {
        id: uuidv4(),
        application_id: applicationId,
        profile_id: profileId,
        status: 'PROCESSING',
        decision: null,
        credit_score: null,
        risk_level: null,
        reason_codes: null,
        score_breakdown: null,
        estimated_emi: null,
        processed_at: null,
        created_at: new Date().toISOString(),
      };
      store.decisions.push(decision);
      return decision;
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO decisions (application_id, profile_id, status)
       VALUES ($1, $2, 'PROCESSING')
       RETURNING *`,
      [applicationId, profileId]
    );
    return result.rows[0];
  },

  async complete(id, { decision, creditScore, riskLevel, reasonCodes, scoreBreakdown, estimatedEmi }) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      const dec = store.decisions.find((d) => d.id === id);
      if (dec) {
        dec.status = 'COMPLETED';
        dec.decision = decision;
        dec.credit_score = creditScore;
        dec.risk_level = riskLevel;
        dec.reason_codes = reasonCodes;
        dec.score_breakdown = scoreBreakdown;
        dec.estimated_emi = estimatedEmi;
        dec.processed_at = new Date().toISOString();
      }
      return dec;
    }

    const pool = getPool();
    const result = await pool.query(
      `UPDATE decisions
       SET status = 'COMPLETED',
           decision = $1,
           credit_score = $2,
           risk_level = $3,
           reason_codes = $4,
           score_breakdown = $5,
           estimated_emi = $6,
           processed_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [decision, creditScore, riskLevel, reasonCodes, JSON.stringify(scoreBreakdown), estimatedEmi, id]
    );
    return result.rows[0];
  },

  async findById(id) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      const dec = store.decisions.find((d) => d.id === id);
      if (!dec) return null;
      const loan = store.loan_applications.find((l) => l.id === dec.application_id);
      const profile = store.business_profiles.find((p) => p.id === dec.profile_id);
      return {
        ...dec,
        loan_amount: loan?.loan_amount,
        tenure_months: loan?.tenure_months,
        purpose: loan?.purpose,
        owner_name: profile?.owner_name,
        pan: profile?.pan,
        business_type: profile?.business_type,
        monthly_revenue: profile?.monthly_revenue,
      };
    }

    const pool = getPool();
    const result = await pool.query(
      `SELECT d.*, la.loan_amount, la.tenure_months, la.purpose,
              bp.owner_name, bp.pan, bp.business_type, bp.monthly_revenue
       FROM decisions d
       JOIN loan_applications la ON d.application_id = la.id
       JOIN business_profiles bp ON d.profile_id = bp.id
       WHERE d.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByApplicationId(applicationId) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      return store.decisions.filter((d) => d.application_id === applicationId);
    }

    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM decisions WHERE application_id = $1 ORDER BY created_at DESC',
      [applicationId]
    );
    return result.rows;
  },
};

module.exports = Decision;
