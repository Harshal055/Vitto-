# LendDecide - MSME Lending Decision System

A complete, full-stack, production-ready lending decision system built for the Vitto Technical Assessment.

## 🚀 Quick Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Cloud like Neon) 
- MongoDB (Local or Atlas)

### 2. Environment Configuration
Create a `.env` file in the `server` directory using the provided `.env.example`:

```env
PORT=5000
NODE_ENV=development

# Postgres Connection String
DATABASE_URL=postgresql://your_user:your_password@your_host/your_db?sslmode=require

# MongoDB Connection String (For Audit Logging)
MONGO_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/audit_db

# CORS configuration
CLIENT_URL=http://localhost:5173
```

*(Note: The server features a graceful fallback. If PostgreSQL or MongoDB connection fails, it will boot using a resilient in-memory data store for testing.)*

### 3. Installation & Running Locally

1. **Install dependencies for both Client and Server:**
```bash
# In the server directory
cd server
npm install

# In the client directory
cd ../client
npm install
```

2. **Start the backend server:**
```bash
cd server
npm start 
# Runs on http://localhost:5000
# Automatically initializes PG tables on first boot
```

3. **Start the frontend interface:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

---

## 🧠 Decision Engine Logic

The custom decision engine evaluates applicants using a strict **750-point weighted scoring model**. Applications scoring >= 450 are Approved.

### Core Signals & Scoring Weights:

1. **Revenue-to-EMI Ratio (30% weight | 225 Pts max)**
   - Computes an estimated Monthly EMI based on the requested loan amount, tenure, and a 14% p.a. interest assumption.
   - If EMI is <10% of monthly revenue: Max points.
   - If EMI exceeds 40% of monthly revenue: 0 points and heavily biases toward rejection, throwing `INSUFFICIENT_EMI_COVERAGE`.

2. **Loan-to-Revenue Multiple (25% weight | 188 Pts max)**
   - Checks if the total loan amount requested is a safe multiple of the gross monthly revenue.
   - Safe (<3x): Max points.
   - High Risk (>12x): 0 points, throwing `HIGH_LOAN_RATIO` flag.

3. **Tenure Risk Adjustment (15% weight | 113 Pts max)**
   - Optimal risk window is 12 to 36 months.
   - Short tenures (<6 months): Penalized due to high monthly repayment burden (`SHORT_TENURE_RISK`).
   - Long tenures (>60 months): Penalized due to high lifetime interest exposure (`LONG_TENURE_RISK`).

4. **Industry Sector Risk (10% weight | 75 Pts max)**
   - Base risk profiles assigned by sector. E.g., 'Retail' and 'Services' hold standard risk models while 'Manufacturing' (asset-backed) is viewed favorably.

5. **PAN Validity (10% weight | 75 Pts max)**
   - Enforces strict regex match (`^[A-Z]{5}[0-9]{4}[A-Z]$`). Invalid PAN instantly triggers `INVALID_PAN` and drains points.

6. **Basic Fraud & Data Consistency (10% weight | 75 Pts max)**
   - Validates baseline logic. E.g. Requesting a ₹5Cr loan with a ₹10,000 monthly revenue fails consistency checks and triggers `DATA_INCONSISTENCY`.

### Assumptions
- Interest rate is fixed at 14% p.a. calculated on a reducing balance basis.
- Income stated by MSME is gross and unverified (thus conservative multiples applied).

---

## 🛡️ Edge Case Strategy

* **Missing/Incomplete Data:** Handled dually via React client-side validation states (blocking submissions) and backend `express-validator` middleware (which rejects bad payloads with structured 400 error arrays).
* **Invalid Input Formats:** Numeric validation ensures no negative revenues. String cleanup strips whitespace from endpoints.
* **Malicious Load:** All decision endpoints are guarded by a strict rate limiter (`express-rate-limit`) to prevent brute-force querying of the engine thresholds.

---

## 📖 API Reference

### `POST /api/v1/profiles`
Create a business profile representation.
* **Body:** `{ ownerName, pan, businessType, monthlyRevenue }`

### `POST /api/v1/loans`
Create the linked loan request.
* **Body:** `{ profileId, loanAmount, tenureMonths, purpose }`

### `POST /api/v1/decisions`
Triggers the background decision evaluation (returns 202 Accepted).
* **Body:** `{ applicationId }`
* **Response:** `{ status: "PROCESSING", decisionId: "uuid" }`

### `GET /api/v1/decisions/:id`
Polls for the completed decision struct. Returns computed scores, EMI, and reason arrays.
