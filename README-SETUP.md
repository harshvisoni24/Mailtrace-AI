# MAILTRACE AI

**AI-Powered Email Threat Detection, GeoLocation & Forensic Intelligence Platform**

*Detect. Trace. Correlate. Investigate.*

Built around SIH Problem Statement **26106**, AICTE Cyber Security Cell, theme *Blockchain & Cybersecurity*.

---

## ⚠️ Honest Scope Note (read this first)

This is a large, genuinely functional full-stack project, not a mockup. Every
button and page described below is wired to a real API endpoint and real
logic — there are no static/fake numbers or dead buttons. That said, the
original specification for this platform describes a project comparable in
scope to a multi-month commercial SOC product. To keep everything **real and
working end-to-end**, some advanced items were intentionally simplified or
left as clearly-documented extension points rather than faked:

| Area | Status |
|---|---|
| Email parsing, header forensics, SPF/DKIM/DMARC, IOC extraction | ✅ Fully implemented |
| Rule-based explainable threat scoring | ✅ Fully implemented |
| Gemini-based explanation / attack story / copilot | ✅ Implemented, with automatic rule-engine fallback if no key |
| Case management, evidence vault, chain of custody | ✅ Fully implemented |
| Tamper-evident hash-chain evidence ledger | ✅ Fully implemented (honestly labeled — **not** a decentralized blockchain) |
| Campaign detection (shared-infrastructure correlation) | ✅ Fully implemented, rule-based |
| Interactive Threat Graph (React Flow) | ✅ Fully implemented |
| Blast radius | ✅ Fully implemented |
| PDF forensic report export | ✅ Fully implemented |
| RBAC, JWT auth, audit log, rate limiting | ✅ Fully implemented |
| Live external threat intel (VirusTotal/AbuseIPDB/URLhaus) | 🟡 Adapter architecture ready; returns clearly-labeled `SIMULATED` results until you add API keys and wire the adapter (see `backend/src/controllers/intelController.ts`) |
| IP geolocation (country/city/ISP) | 🟡 Data model + UI ready; wire a GeoIP provider in the AI service or backend to populate `IP.country/city/isp` |
| pgvector-based semantic search / RAG | 🟡 Schema + fallback logic ready; true vector search needs an embeddings model wired in (see `docs/PGVECTOR.md`) |
| shadcn/ui components | 🟡 Tailwind design system implemented directly; run `npx shadcn@latest init` in `frontend/` if you want shadcn's exact component primitives |
| Automated test suites | 🟡 Structure documented below; add test files as the codebase evolves |

Everything marked ✅ works today with `npm run dev` / `uvicorn`. Everything
marked 🟡 has a real, non-fake fallback (clearly labeled as simulated/demo)
and a documented path to making it fully live.

---

## 1. Architecture

```text
React + TypeScript + Vite (frontend/)
              ↓ REST (JWT auth)
Node.js + Express + TypeScript (backend/)
              ↓ REST
Python + FastAPI AI Service (ai-service/)
              ↓
Google Gemini (explanation only) + Rule Engine + RAG
              ↓
PostgreSQL (+ pgvector, optional) via Prisma
```

Hybrid detection pipeline (per email):

```text
Email → Parser (mailparser) → Feature Extraction → Rule Engine (Python)
      → RAG (optional) → Gemini (explanation only) → Risk Engine
      → Final Investigation Result
```

Gemini is **never** the sole source of a technical verdict — it only
explains, summarizes, and narrates evidence the rule engine already computed.

---

## 2. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, React Flow, Recharts, Lucide icons
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, JWT + bcrypt, Zod, Multer, PDFKit
- **AI Service:** Python, FastAPI, Google Generative AI SDK, psycopg2
- **Database:** PostgreSQL (+ optional pgvector)

---

## 3. Folder Structure

```text
mailtrace-ai/
├── frontend/           React + Vite + Tailwind SPA
├── backend/            Express + TypeScript API + Prisma schema
├── ai-service/          FastAPI AI/ML/RAG service
├── demo-data/           5 synthetic demo .eml files (also copied to frontend/public/demo-data)
├── docs/                 PGVECTOR.md, REMOTE_POSTGRESQL.md
├── scripts/              setup.sh helper
├── README.md
└── .gitignore
```

---

## 4. Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- PostgreSQL ≥ 14 (can be local, LAN, or cloud — see `docs/REMOTE_POSTGRESQL.md`)
- (Optional) A Google Gemini API key for AI-assisted explanations
- (Optional) pgvector extension for true semantic search (see `docs/PGVECTOR.md`)

---

## 5. Quick Start

```bash
git clone <this-repo> mailtrace-ai
cd mailtrace-ai
bash scripts/setup.sh
```

Then edit the generated `.env` files (see section 7 below), and run each
service in its own terminal:

```bash
# Terminal 1 — database migrations + seed (first time only)
cd backend
npx prisma migrate dev --name init
npm run seed

# Terminal 2 — backend API
cd backend && npm run dev            # http://localhost:5000

# Terminal 3 — AI service
cd ai-service && . venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal 4 — frontend
cd frontend && npm run dev            # http://localhost:5173
```

Open **http://localhost:5173**, sign in with the seeded admin account printed
by `npm run seed` (default `admin@mailtrace.local` / `ChangeMe123!` unless
overridden — **change this password immediately**), and go to
**Investigate → Upload Email** to try a demo investigation.

---

## 6. PostgreSQL Setup

### Local

```bash
sudo apt-get install postgresql
sudo -u postgres psql -c "CREATE DATABASE mailtrace;"
sudo -u postgres psql -c "CREATE USER mailtrace_user WITH ENCRYPTED PASSWORD 'yourpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mailtrace TO mailtrace_user;"
```

Set in `backend/.env` and `ai-service/.env`:

```env
DATABASE_URL=postgresql://mailtrace_user:yourpassword@localhost:5432/mailtrace
```

### Remote (another laptop / server / cloud)

See **`docs/REMOTE_POSTGRESQL.md`** for the full walkthrough (listening
address, `pg_hba.conf`, firewall, connection testing). The app never
hardcodes `localhost` — everything comes from `DATABASE_URL`.

### pgvector

See **`docs/PGVECTOR.md`**. The platform runs fine without it (RAG falls
back to keyword search, clearly labeled).

---

## 7. Environment Variables

Copy each `.env.example` to `.env` and fill in real values. **Never commit
`.env` files** — only `.env.example` files with placeholders belong in
version control.

### `backend/.env`

```env
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/mailtrace
JWT_SECRET=replace_with_a_long_random_secret
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
VIRUSTOTAL_API_KEY=
ABUSEIPDB_API_KEY=
GEOIP_API_KEY=
```

### `ai-service/.env`

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=your_gemini_model_here
DATABASE_URL=postgresql://username:password@host:5432/mailtrace
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**`GEMINI_API_KEY` must never appear in the frontend** — it is only read by
the Python AI service, server-side.

---

## 8. Prisma Setup

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio     # optional: visual DB browser
```

The schema (`backend/prisma/schema.prisma`) defines all core models: User,
Role, Case, Email, EmailHeader, EmailAuthentication, IP, Domain, Url,
Attachment, IOC, ThreatIntelligence, Campaign, CampaignMember,
ThreatRelationship, Evidence, ChainOfCustodyEvent, EvidenceLedgerEntry,
ForensicReport, Alert, AuditLog, Document, Embedding, InvestigationNote.

---

## 9. Gemini Setup

1. Get an API key from Google AI Studio.
2. Put it in `ai-service/.env` as `GEMINI_API_KEY`.
3. Set `GEMINI_MODEL` to a model currently available to your account (verify
   against Google's current model list — don't assume a hardcoded name will
   remain valid).
4. Restart the AI service.

Without a key, the platform still works: rule-engine scoring and template
explanations are used instead, clearly labeled `RULE_ENGINE_ONLY` in API
responses and in the UI ("Source: Rule engine (AI unavailable)").

---

## 10. Running the Application

| Service | Command | Port |
|---|---|---|
| Backend API | `cd backend && npm run dev` | 5000 |
| AI Service | `cd ai-service && uvicorn app.main:app --reload --port 8000` | 8000 |
| Frontend | `cd frontend && npm run dev` | 5173 |

Health checks:
- Backend: `GET http://localhost:5000/health`
- AI Service: `GET http://localhost:8000/health`

---

## 11. Demo Mode

`demo-data/` contains 5 synthetic, clearly-labeled emails:

1. Microsoft impersonation phishing
2. Fake invoice / BEC
3. Credential harvesting
4. Suspicious attachment
5. Legitimate email

From **Investigate → Upload Email**, click any "Demo N" button to load and
analyze one instantly — this works even with no external threat-intel APIs
or Gemini key configured. All demo data is labeled **SIMULATED DEMO DATA**
and must never be presented as real-world intelligence.

---

## 12. Threat Intelligence APIs

Optional. Without keys, `/api/threat-intelligence/lookup` returns:

```json
{ "source": "DEMO THREAT INTELLIGENCE", "status": "SIMULATED", ... }
```

To go live, add `VIRUSTOTAL_API_KEY` / `ABUSEIPDB_API_KEY` to `backend/.env`
and implement the provider call in
`backend/src/controllers/intelController.ts` (`lookupThreatIntel`) — the
adapter boundary is already there.

---

## 13. Deployment

- Build backend: `cd backend && npm run build && npm start`
- Build frontend: `cd frontend && npm run build` → serve `dist/` via any
  static host (or add nginx/Express static serving)
- Run AI service behind a process manager (systemd, supervisor, or a
  container) — do not use `--reload` in production
- Put all three services behind a reverse proxy (nginx) with TLS in front
- Use a managed/production PostgreSQL instance with backups enabled
- Never deploy with default seeded passwords — rotate `SEED_ADMIN_PASSWORD`
  immediately post-deploy and disable/change the seeded demo analyst account

---

## 14. Security

- JWT-based auth, bcrypt password hashing (cost factor 12)
- Role-based access control: `ADMIN`, `SECURITY_ANALYST`, `INVESTIGATOR`, `VIEWER`
- Helmet security headers, CORS allow-list, rate limiting (global + login-specific)
- Zod input validation on all mutating endpoints
- Upload validation: extension + MIME allow-list, size limits, **uploaded
  files are parsed as text/MIME only and never executed**
- Audit logging on login, email analysis, evidence access, report generation
- Environment-variable-only secrets; no hardcoded credentials anywhere in
  source; `.env` is git-ignored

---

## 15. API Documentation (selected endpoints)

```text
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

GET    /api/emails
POST   /api/emails/upload         (multipart, field name: emailFile)
POST   /api/emails/paste          { rawEmail, caseId? }
GET    /api/emails/:id
GET    /api/emails/:id/headers
GET    /api/emails/:id/iocs
GET    /api/emails/:id/trace

GET    /api/cases
POST   /api/cases
GET    /api/cases/:id
PATCH  /api/cases/:id
POST   /api/cases/:id/notes
GET    /api/cases/:id/timeline
POST   /api/cases/:id/link-email

GET    /api/evidence
POST   /api/evidence
GET    /api/evidence/:id
GET    /api/evidence/verify-ledger

GET    /api/reports
POST   /api/reports               { caseId }
GET    /api/reports/:id
GET    /api/reports/:id/pdf

GET    /api/campaigns
POST   /api/campaigns/detect
GET    /api/campaigns/:id
GET    /api/campaigns/blast-radius?emailId=...
GET    /api/campaigns/threat-graph?emailId=...

GET    /api/threat-intelligence/domains
GET    /api/threat-intelligence/ips
GET    /api/threat-intelligence/lookup?type=&value=
GET    /api/threat-intelligence/search?q=

GET    /api/alerts
PATCH  /api/alerts/:id/read

GET    /api/audit
GET    /api/users
PATCH  /api/users/:id

POST   /api/copilot/ask           { question, emailId?, caseId? }
```

AI service:

```text
POST   /api/analyze   (called internally by the backend)
POST   /api/copilot    (called internally by the backend)
GET    /health
```

---

## 16. Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| Backend logs `Could not reach PostgreSQL` | Check `DATABASE_URL`, firewall, `pg_hba.conf` — see `docs/REMOTE_POSTGRESQL.md` |
| Emails analyze but show "Rule engine (AI unavailable)" | AI service isn't reachable, or `GEMINI_API_KEY` isn't set — check `ai-service` logs and `AI_SERVICE_URL` |
| `/api/threat-intelligence/lookup` always says SIMULATED | No `VIRUSTOTAL_API_KEY`/`ABUSEIPDB_API_KEY` configured — expected until you wire a provider |
| 401 responses everywhere | JWT expired or `JWT_SECRET` mismatch between requests — log in again |
| File upload rejected | Only `.eml`, `.msg`, and plain-text raw email are accepted, up to `MAX_UPLOAD_MB` |
| CORS errors in the browser console | Ensure `CORS_ORIGIN` in `backend/.env` matches the frontend's actual origin |

---

## 17. Production Recommendations

- Put a WAF / reverse proxy in front of the backend
- Rotate `JWT_SECRET` and all seeded credentials before go-live
- Enable TLS everywhere (frontend, backend, AI service, PostgreSQL connections)
- Configure real data retention per section "Settings" (30/90/180/custom days)
- Wire real threat-intel providers and a GeoIP provider before relying on
  IP/domain intelligence for real investigations
- Add automated backups for PostgreSQL, including the evidence ledger table
- Review RBAC assignments regularly via **Administration → Users**

---

## 18. License / Disclaimer

Built for demonstration and hackathon purposes (SIH Problem Statement
26106). Geolocation and infrastructure attribution features report
*probable origin infrastructure*, not attacker identity or physical
location — always corroborate with legal process before taking action
against any identified party.
