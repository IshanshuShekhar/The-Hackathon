# Educaro Applicant Journey 🇩🇪🇮🇳

> **ImpactX'26 Hackathon • Agentic AI Track**  
> Sponsor: **Educaro Deutschland GmbH**  
> Type: Working prototype

An integrated, agent-driven journey that takes Indian applicants from first contact to a structured, qualified profile and a recommended next step within the Educaro ecosystem (University Study, Dual Vocational Training / Ausbildung, Direct Employment / EU Blue Card).

---

## 🏛 Architecture & Hard Rules

1. **Strict Provenance Enforcement**:
   Every profile field carries a provenance label (`VERIFIED`, `APPLICANT_PROVIDED`, `AI_EXTRACTED`, `AI_GENERATED`). The AI service is strictly forbidden from writing `VERIFIED`.
2. **Deterministic Rules Engine**:
   Eligibility and qualification logic is deterministic code (rules engine + JSON config), never an LLM call. The LLM only explains results in plain language.
3. **Audit Trail for Agent Actions**:
   Every agent action writes an entry to `agent_events` (`agent`, `tool`, `input`, `output`, `timestamp`, `confidence`) so that the "What the AI did" panel streams real, verifiable steps.
4. **Direct UPI / QR Payments (PRD Section 22)**:
   Payments are direct UPI transfers to Educaro's business UPI ID (`upi://pay`) with QR display, 12-digit UTR submission, and consultant/finance confirmation (plus `DEMO_MODE=true` one-click simulation). No payment gateway or webhooks.

---

## 📁 Monorepo Structure

```
├── apps/
│   ├── api/             # NestJS + TypeScript backend (REST, agent orchestration, rules engine)
│   └── web/             # React + TypeScript + Vite + TailwindCSS frontend
├── packages/
│   └── shared/          # Shared TypeScript enums (Provenance, Pathway, CEFR, etc.) and types
├── docker-compose.yml   # PostgreSQL 16, Redis 7, MinIO
├── pnpm-workspace.yaml  # Workspace configuration
└── package.json         # Workspace root scripts
```

---

## 🚀 Quickstart

### 1. Prerequisites
- **Node.js**: v20 or v22+
- **pnpm**: v8 or v9+ (`npm install -g pnpm` or `corepack enable`)
- **Docker & Docker Compose**: (Optional for local PostgreSQL/Redis/MinIO)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Start Infrastructure Services
Start PostgreSQL, Redis, and MinIO in the background:
```bash
docker compose up -d
```
*(If running without Docker, point `DATABASE_URL` in `.env` to your local or cloud PostgreSQL instance.)*

### 4. Build Shared Types
```bash
pnpm build:shared
```

### 5. Run Development Servers
Run both API and Web servers concurrently:
```bash
pnpm dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (`minioadmin` / `minioadmin`)

---

## 🧪 Phase 0 "Done When" Criteria
- [x] Monorepo configured with `pnpm-workspace.yaml` containing `apps/*` and `packages/*`.
- [x] `docker-compose.yml` specifies PostgreSQL 16, Redis 7, and MinIO with volumes and health checks.
- [x] NestJS API scaffolded with `/api/health` checking database reachability and shared types.
- [x] Vite + React + TS frontend displays health status and provenance badge component preview.
- [x] Shared package `@educaro/shared` exports Provenance, Pathway, CEFR, Payment, and Profile types.
- [x] Unified `.env.example` and `README.md` provided.
- [x] `pnpm dev` launches both API and Web concurrently.
