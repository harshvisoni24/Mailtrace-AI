# MailTrace AI

**AI-Powered Email Threat Detection, GeoLocation & Forensic Intelligence Platform**

*Detect. Trace. Correlate. Investigate.*

MailTrace AI is a full-stack security platform for investigating suspicious
emails end-to-end — from raw `.eml` upload to a courtroom-ready forensic
report. It parses email headers, verifies authentication (SPF/DKIM/DMARC),
extracts indicators of compromise, scores threats with an explainable
rule engine, and uses AI to narrate the findings in plain language for
analysts.

Built around **SIH Problem Statement 26106** (AICTE Cyber Security Cell,
theme: *Blockchain & Cybersecurity*).

---

## What it does

- **Email Forensics** — parses raw email files and extracts headers, sender
  authentication results, IPs, domains, URLs, and attachments.
- **Explainable Threat Scoring** — a transparent rule engine assigns a risk
  score with a clear breakdown of *why*, instead of a black-box verdict.
- **AI Copilot** — an AI assistant explains findings, tells the "attack
  story" behind an email, and answers investigator questions in natural
  language.
- **Case Management** — organize investigations into cases, attach evidence,
  add notes, and track a full timeline.
- **Evidence Vault** — a tamper-evident, hash-chained evidence ledger so
  investigators can prove nothing was altered after the fact.
- **Campaign Correlation** — automatically links emails that share
  infrastructure (IPs, domains, senders) into a single campaign.
- **Interactive Threat Graph** — a visual, explorable map of how an email
  connects to IPs, domains, URLs, and other emails.
- **Blast Radius Analysis** — see how far a campaign has spread across your
  organization at a glance.
- **PDF Forensic Reports** — export a full investigation as a shareable,
  professional report.
- **Role-Based Access Control** — Admin, Security Analyst, Investigator, and
  Viewer roles with full audit logging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Flow, Recharts |
| Backend | Node.js, Express, TypeScript, Prisma ORM, JWT auth |
| AI Service | Python, FastAPI, Google Gemini |
| Database | PostgreSQL (optional pgvector for semantic search) |

**Pipeline:** Email → Parser → Feature Extraction → Rule Engine → RAG
(optional) → Gemini (explanation only) → Final Investigation Result.

AI is used strictly for explanation and narration — every technical verdict
comes from the deterministic rule engine, never from the model alone.

---

## Status

This is a real, working full-stack application — every screen is wired to
a live API and real logic, with no placeholder data. A few advanced,
optional integrations (live threat-intel providers, GeoIP, true vector
search) ship with clearly-labeled simulated fallbacks and a documented path
to going fully live. See `README-SETUP.md` in this repo for the honest,
item-by-item breakdown and full local setup instructions.

---

## Disclaimer

Built for demonstration and hackathon purposes. Geolocation and
infrastructure attribution features report *probable origin
infrastructure*, not attacker identity or physical location — always
corroborate with legal process before taking action against any identified
party.
