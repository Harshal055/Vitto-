const { getPool, isInMemoryMode, getMemoryStore } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

const LoanApplication = {
  async create({ profileId, loanAmount, tenureMonths, purpose }) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      const loan = {
        id: uuidv4(),
        profile_id: profileId,
        loan_amount: loanAmount,
        tenure_months: tenureMonths,
        purpose,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.loan_applications.push(loan);
      return loan;
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO loan_applications (profile_id, loan_amount, tenure_months, purpose, status)
       VALUES ($1, $2, $3, $4, 'PENDING')
       RETURNING *`,
      [profileId, loanAmount, tenureMonths, purpose]
    );
    return result.rows[0];
  },

  async findById(id) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      const loan = store.loan_applications.find((l) => l.id === id);
      if (!loan) return null;
      const profile = store.business_profiles.find((p) => p.id === loan.profile_id);
      return {
        ...loan,
        owner_name: profile?.owner_name,
        pan: profile?.pan,
        business_type: profile?.business_type,
        monthly_revenue: profile?.monthly_revenue,
      };
    }

    const pool = getPool();
    const result = await pool.query(
      `SELECT la.*, bp.owner_name, bp.pan, bp.business_type, bp.monthly_revenue
       FROM loan_applications la
       JOIN business_profiles bp ON la.profile_id = bp.id
       WHERE la.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async updateStatus(id, status) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      const loan = store.loan_applications.find((l) => l.id === id);
      if (loan) {
        loan.status = status;
        loan.updated_at = new Date().toISOString();
      }
      return loan;
    }

    const pool = getPool();
    const result = await pool.query(
      `UPDATE loan_applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  async findByProfileId(profileId) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      return store.loan_applications.filter((l) => l.profile_id === profileId);
    }

    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM loan_applications WHERE profile_id = $1 ORDER BY created_at DESC',
      [profileId]
    );
    return result.rows;
  },
};

module.exports = LoanApplication;
