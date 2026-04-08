const { getPool, isInMemoryMode, getMemoryStore } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

const BusinessProfile = {
  async create({ ownerName, pan, businessType, monthlyRevenue }) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      const profile = {
        id: uuidv4(),
        owner_name: ownerName,
        pan: pan.toUpperCase(),
        business_type: businessType.toLowerCase(),
        monthly_revenue: monthlyRevenue,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.business_profiles.push(profile);
      return profile;
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO business_profiles (owner_name, pan, business_type, monthly_revenue)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ownerName, pan.toUpperCase(), businessType.toLowerCase(), monthlyRevenue]
    );
    return result.rows[0];
  },

  async findById(id) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      return store.business_profiles.find((p) => p.id === id) || null;
    }

    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM business_profiles WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll(limit = 50, offset = 0) {
    if (isInMemoryMode()) {
      const store = getMemoryStore();
      return store.business_profiles.slice(offset, offset + limit);
    }

    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM business_profiles ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  },
};

module.exports = BusinessProfile;
