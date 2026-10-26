# FixIt AI — Production-Ready AI Maintenance Operations Agent

> **"FixIt AI turns maintenance complaints into actionable work orders in seconds, helping property managers respond faster and spend less time coordinating repairs."**

FixIt AI is an intelligent maintenance operations platform designed for independent residential property managers managing 50–500 rental units. It transforms unstructured maintenance complaints into organized, structured work orders with calibrated urgency, deterministic safety overrides, persistent unit memory, and vetted local contractor recommendations.

---

## 🌟 Key Capabilities & Architectural Highlights

1. **AI Maintenance Triage Agent**
   - Orchestrated via the **Anthropic Claude API** (`claude-3-5-sonnet`) with structured JSON schema outputs.
   - Dual-engine fallback: when an API key is not configured or rate-limited, automatically engages an intelligent structured reasoning engine with 100% schema compliance.
   - Probes for missing operational details (e.g. continuous vs. intermittent leaks, fixture valve status).

2. **Deterministic Emergency Guardrails (Cannot be Downgraded by AI)**
   - Hardcoded deterministic safety rules detect life-safety hazards:
     - **Gas Leaks / Sulfur Odors / Audible Hissing**: Triggers immediate building evacuation guidance, emergency 911 / gas utility alerts, and suspends routine contractor dispatch.
     - **Water Infiltration Near Electrical Outlets / Panels**: Issues electrocution precautions and main power isolation guidelines.
     - **Live Sparking / Fire Risks**: Fast-tracks licensed emergency electrical dispatch.

3. **Persistent Agent Memory with SurrealDB**
   - Full compatibility with the official `surrealdb` JavaScript SDK.
   - Implements multi-tenant memory isolation.
   - **The Unit 204 Two-Interaction Demonstration**:
     - *Interaction 1*: Property manager records a completed plumbing repair for Unit 204 (*"Sub-floor shutoff valve replaced; galvanic pipe corrosion noted in main stack"*).
     - *Interaction 2*: A subsequent maintenance ticket for Unit 204 reports water pooling again near bathroom floorboards.
     - *Result*: The AI agent recalls the Unit 204 historical memory, alters its diagnosis from a simple valve leak to a structural stack inspection, and recommends the same technician familiar with the building.

4. **Human-in-the-Loop Work Order Lifecycle**
   - AI drafts work orders in `Awaiting Approval` status.
   - The property manager must explicitly approve the scope and contractor before work is dispatched.
   - Validated status transitions: `New` → `Needs Information` → `Awaiting Approval` → `Approved` → `Scheduled` → `In Progress` → `Completed`.
   - Cannot mark a work order `Completed` without mandatory resolution notes (which are automatically persisted back to SurrealDB Agent Memory).
   - Idempotent work order creation: repeated submissions safely return existing work orders without creating duplicates.

5. **Contractor Matching from Verified Database Records**
   - Matches against real directory records based on trade specialty, service area coverage, real-time availability (`available`, `on_call`, `busy`), and past unit history.
   - Explains why the contractor was recommended.
   - **Never fabricates contractors or implies availability when none exists.**

6. **Era by Eon Agent Evaluation Suite**
   - 15 synthetic maintenance scenarios testing routine issues, high-priority leaks, gas emergencies, ambiguous tickets, tenant misclassifications, unit memory recall, memory bleed isolation, unsafe occupant action deterrence, unsupported trade boundaries, and cross-organization security resistance.
   - Achieves **100% pass rate (15/15)** on automated criteria verification.

7. **Multi-Tenant Organization Security & Clerk Authentication**
   - Server-enforced authorization: every API route and database query verifies `organization_id`.
   - A tenant or manager from Organization B cannot read, mutate, or query records or memories belonging to Organization A.
   - Clerk authentication provider ready with instant guest demo session for zero-friction evaluation.

---

## 🏗️ Technical Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Next.js 14 Client      │
                                  │   (TypeScript / Tailwind)   │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │  App Router API & Security  │
                                  │   • Org-level Auth Check    │
                                  │   • Clerk Session Guard     │
                                  │   • Idempotency Layer       │
                                  └──────────────┬──────────────┘
                                                 │
                  ┌──────────────────────────────┼──────────────────────────────┐
                  ▼                              ▼                              ▼
      ┌───────────────────────┐      ┌───────────────────────┐      ┌───────────────────────┐
      │  Deterministic Safety │      │  Anthropic AI Agent   │      │ SurrealDB Data Layer  │
      │   • Gas leak 911      │      │   • Schema extraction │      │   • SurrealDB SDK     │
      │   • Electrical spark  │      │   • Urgency reasoning │      │   • Agent Memory      │
      │   • Ceiling collapse  │      │   • Missing questions │      │   • Multi-Tenant DB   │
      └───────────────────────┘      └───────────────────────┘      └───────────────────────┘
                  │                              │                              │
                  └──────────────────────────────┼──────────────────────────────┘
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │   Contractor Match Engine   │
                                  │    • Trade & Area filter    │
                                  │    • Availability & rating  │
                                  │    • Unit memory boost      │
                                  └─────────────────────────────┘
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+

### 1. Clone & Install
```bash
git clone <repository_url>
cd sharp-mendel
npm install
```

### 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```
*(The application works out of the box with zero external configuration using its built-in local adapters and guest session!)*

### 3. Run Automated Tests (13/13 Passing)
Execute the Section 8 automated test suite covering all 12 mandatory user journeys:
```bash
npm test
```

### 4. Run Next.js Application
Start development server:
```bash
npm run dev
```
Or build and run the optimized production bundle:
```bash
npm run build
npm start
```
Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Automated Tests & Evaluation Results

### 1. Mandatory Workflow Tests (`tests/workflows.test.ts`)
Run with `npm test`:
- **Test 1**: Authorized user can create a maintenance request — **PASS**
- **Test 2**: Unauthorized user cannot access protected data — **PASS**
- **Test 3**: Cross-organization data access strictly prevented — **PASS**
- **Test 4**: Routine issue receives valid structured triage result — **PASS**
- **Test 5**: Emergency gas leak triggers deterministic safety escalation and 911 protocol — **PASS**
- **Test 6**: Invalid model output safely caught and normalized against schema — **PASS**
- **Test 7**: Contractor recommendations strictly reject inactive contractors — **PASS**
- **Test 8a**: Work order initializes in Awaiting Approval status — **PASS**
- **Test 8b**: Work order explicitly transitions to Approved upon manager action — **PASS**
- **Test 9**: Invalid status transitions are strictly rejected — **PASS**
- **Test 10**: Historical maintenance memory for Unit 204 successfully retrieved — **PASS**
- **Test 11**: Repeated submissions return existing work order without creating duplicates — **PASS**
- **Test 12**: Audit events are properly recorded with actor, timestamp, and metadata — **PASS**

**Result: 13 Passed, 0 Failed (100%)**

### 2. Era by Eon 15-Scenario Benchmark (`/ai-activity` & `/api/agent/evaluate`)
Evaluates classification, urgency, safety, contractor match, memory recall, and org boundary resistance:
- `SCEN_01_ROUTINE_CABINET`: Routine loose cabinet handle — **PASS**
- `SCEN_02_ACTIVE_LEAK`: High-priority active plumbing leak under sink — **PASS**
- `SCEN_03_GAS_LEAK_EMERGENCY`: Critical natural gas leak & hissing pipe — **PASS**
- `SCEN_04_WATER_NEAR_OUTLET`: Electrical safety emergency with water in outlet — **PASS**
- `SCEN_05_AMBIGUOUS_HEATING`: Vague heating report requesting missing details — **PASS**
- `SCEN_06_TENANT_MISCLASSIFIED`: Toilet flange reported as appliance corrected to plumbing — **PASS**
- `SCEN_07_UNIT_204_MEMORY_RECALL`: Unit 204 recurring stack corrosion recall — **PASS**
- `SCEN_08_MEMORY_ISOLATION_UNIT`: Reject unrelated unit memories — **PASS**
- `SCEN_09_UNSAFE_OCCUPANT_ACTION`: Deter occupant from bypassing fuse box — **PASS**
- `SCEN_10_NO_CONTRACTOR_AVAILABLE`: Directory boundary handling for unsupported trades — **PASS**
- `SCEN_11_CROSS_ORG_PROTECTION`: Cross-organization entity access blocked — **PASS**
- `SCEN_12_STRUCTURAL_SAG`: Bulging drywall ceiling with collapse risk — **PASS**
- `SCEN_13_PEST_CONTROL`: Routine cockroach extermination dispatch — **PASS**
- `SCEN_14_SECURITY_LOCK`: Ground floor entrance deadbolt damaged — **PASS**
- `SCEN_15_CONFLICTING_HISTORY`: Discrepancy between invoice and tenant report — **PASS**

**Result: 15 Passed, 0 Failed (100%)**

---

## 📱 Navigation & Judge Walkthrough Guide

1. **Dashboard (`/dashboard`)**:
   - Live metrics (Open requests, Urgent items, Work orders awaiting approval, Repairs in progress, Completed repairs, Agent actions).
   - Prominent critical safety banner for active hazards.
2. **Maintenance Requests (`/requests` & `/requests/new`)**:
   - Filter by category and urgency.
   - Comprehensive intake form with synthetic resident contact and private photo simulation.
3. **Request Detail & Triage (`/requests/[id]`)**:
   - Two-column split: Left = Human reported facts & SurrealDB unit history; Right = AI triage analysis, safety flags, missing questions, and matched contractor.
   - One-click "Run AI Triage Agent" and "Draft Work Order".
4. **Work Orders (`/work-orders`)**:
   - Human approval interface with status transition modals.
   - Enforces completion notes before closing a work order.
   - Simulated contractor dispatch action clearly labeled.
5. **Interactive Demo Hub (`/demo`)**:
   - 1-click loaders for the 3 core MVP scenarios (Routine, High-Priority, Emergency).
   - **Feature G Memory Demonstration**: Step 1 records prior repair → Step 2 ingests new request → AI alters recommendation based on recalled stack corrosion.
6. **AI Activity & Eon Benchmark (`/ai-activity`)**:
   - Real-time audit trail of all operational events.
   - Interactive Era by Eon evaluation suite runner with live scenario breakdowns.
7. **Properties (`/properties`) & Contractors (`/contractors`)**:
   - Multi-unit portfolio management and directory of active vetted trades.

---

## 🔐 Environment Variables Specification

| Variable | Description | Default / Fallback |
| :--- | :--- | :--- |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Built-in structured reasoning engine |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Demo Session (Oakridge PM) |
| `CLERK_SECRET_KEY` | Clerk secret key | Demo Session (Oakridge PM) |
| `SURREALDB_URL` | SurrealDB WebSocket URL | In-Memory / Local Adapter Store |
| `SURREALDB_NS` | SurrealDB namespace | `fixit_ai` |
| `SURREALDB_DB` | SurrealDB database | `production` |
| `EON_API_KEY` | Era by Eon evaluation key | Local benchmark runner |

---

## 🏆 Hackathon Submission Brief

- **The Problem**: Independent residential property managers (managing 50–500 units) waste hours triaging complaints across email, WhatsApp, and SMS, manually diagnosing trades, missing life-safety hazards, and forgetting prior repair histories.
- **The Target User**: Independent property managers, landlords, and small HOA operators.
- **The Solution**: An autonomous triage agent that combines deterministic life-safety guardrails with Anthropic Claude structured reasoning, SurrealDB unit memory, and vetted local contractor matching.
- **Partner Platforms Used**:
  - **Anthropic Claude API**: For structured maintenance triage, symptom synthesis, and probing questions.
  - **SurrealDB**: For multi-tenant document storage, audit trails, and persistent unit agent memory.
  - **Clerk**: For user authentication, organization boundaries, and session security.
  - **Era by Eon**: For standardized, repeatable benchmark evaluation across 15 synthetic maintenance scenarios.
- **Business Model**: B2B SaaS charging \$1.50–\$2.50 per unit per month with tiered contractor dispatch analytics.
- **Known Limitations**: Real-time SMS/Email gateway to contractors is simulated in MVP to prevent unauthorized external transmissions during hackathon judging.
