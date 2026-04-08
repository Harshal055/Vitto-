# Vitto Technical Assessment Write-up
**Candidate:** Full Stack SDE
**System:** MSME Lending Decision System Quick Sprint

## Architecture Decisions

The system was purposely built as a separated Monorepo containing a `server/` Node.js service and a `client/` React frontend. 

1. **Dual-Database Strategy (Postgres + MongoDB)**
   * **Transactional Data (PostgreSQL):** PostgreSQL was selected as the primary relational store to ensure ACID compliance constraints when linking Business Profiles to Loan Applications and Decisions via foreign keys.
   * **Audit Logging (MongoDB):** I offloaded the asynchronous audit trail system to a schemaless MongoDB collection. This prevents the transactional Relational Database from being bogged down with heavy write-throughput logging, improving core API response times.

2. **Asynchronous Decision Engine Model**
   * Instead of synchronous blocking on the `POST /decision` route, the architecture utilizes an asynchronous model. The API immediately returns a `202 Accepted` status while the heavy computation (scoring logic) runs offline. The React frontend natively hooks into this via a long-polling custom hook, simulating a high-throughput enterprise queueing architecture.

3. **Infrastructure Resilience**
   * The Node environment features a graceful in-memory storage fallback. By design, if either the primary PostgreSQL or MongoDB instance suffers an outage, the system will temporarily retain state in memory, allowing business operations and front-end capabilities to persist uninterrupted—a crucial edge-case defense for high-uptime financial systems.

## Tradeoffs Chosen

1. **Polling vs. WebSockets/SSE**
   * **Tradeoff:** I opted to use interval-based client polling for the asynchronous decision results instead of configuring full WebSockets or Server-Sent Events (SSE). 
   * **Reasoning:** In a 1-day sprint constraint, polling remains incredibly resilient, stateless, and significantly easier to secure and maintain. Since financial decisioning typically requires 2 to 4 seconds, configuring a massive pub/sub WebSocket pipeline was an over-engineering risk for this scope.

2. **Proprietary Scoring vs Integration**
   * **Tradeoff:** Designed a proprietary custom weighting model rather than integrating with an external API simulation (e.g. mock Equifax/Experian logic).
   * **Reasoning:** This thoroughly demonstrated the ability to program complex financial math structures and write internal testable business logic directly within the Express ecosystem.

## What I'd Improve With More Time

If given an extended timeline to productionize this platform, I would prioritize the following technical additions:

1. **Background Job Queue Architecture:** I would strip the simulated internal async processing and replace it with a dedicated Redis-backed queue like `BullMQ`. This would allow background retry semantics, dead-letter queues, and distributed workers for the credit engine calculation.
2. **Comprehensive Test Automation:** Implementing robust unit testing suites utilizing `Jest` and `Supertest` specifically targeted at edge cases inside the `decisionEngine.js` module.
3. **CI/CD Pipelines:** Structuring GitHub Actions to automate linting, testing, and container deployment (leveraging the existing `docker-compose.yml`) securely into AWS/GCP infrastructures.
