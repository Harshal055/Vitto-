const env = require('./environment');
const { v4: uuidv4 } = require('uuid');

let pool = null;
let useInMemory = false;

// ── In-Memory Store (fallback when PostgreSQL is unavailable) ──
const memoryStore = {
  business_profiles: [],
  loan_applications: [],
  decisions: [],
};

/**
 * In-memory query handler that mimics pg Pool interface.
 */
const memoryPool = {
  async query(text, params) {
    // We'll handle queries in the model layer instead
    return { rows: [] };
  },
  async connect() {
    return {
      query: async () => ({ rows: [] }),
      release: () => {},
    };
  },
};

/**
 * Try to connect to PostgreSQL. If unavailable, fall back to in-memory.
 */
async function initializeDatabase() {
  try {
    const { Pool } = require('pg');
    
    // Use connection string if provided, otherwise fallback to separate config
    const pgConfig = env.DATABASE_URL
      ? { connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: env.PG_HOST,
          port: env.PG_PORT,
          database: env.PG_DATABASE,
          user: env.PG_USER,
          password: env.PG_PASSWORD,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 3000,
          ...(env.PG_SSL ? { ssl: { rejectUnauthorized: false } } : {}),
        };

    const pgPool = new Pool(pgConfig);

    pgPool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err.message);
    });

    const client = await pgPool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_name VARCHAR(255) NOT NULL,
        pan VARCHAR(10) NOT NULL,
        business_type VARCHAR(50) NOT NULL,
        monthly_revenue NUMERIC(15,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS loan_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
        loan_amount NUMERIC(15,2) NOT NULL,
        tenure_months INTEGER NOT NULL,
        purpose VARCHAR(500) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS decisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
        profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'PROCESSING',
        decision VARCHAR(20),
        credit_score INTEGER,
        risk_level VARCHAR(20),
        reason_codes TEXT[],
        score_breakdown JSONB,
        estimated_emi NUMERIC(15,2),
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_loan_profile ON loan_applications(profile_id);
      CREATE INDEX IF NOT EXISTS idx_decision_application ON decisions(application_id);
      CREATE INDEX IF NOT EXISTS idx_decision_profile ON decisions(profile_id);
    `);
    client.release();

    pool = pgPool;
    useInMemory = false;
    console.log('✓ PostgreSQL connected & schema initialized');
  } catch (err) {
    console.warn(`⚠ PostgreSQL unavailable (${err.message}). Using in-memory storage.`);
    pool = memoryPool;
    useInMemory = true;
  }
}

function getPool() {
  return pool || memoryPool;
}

function isInMemoryMode() {
  return useInMemory;
}

function getMemoryStore() {
  return memoryStore;
}

module.exports = { getPool, initializeDatabase, isInMemoryMode, getMemoryStore };
