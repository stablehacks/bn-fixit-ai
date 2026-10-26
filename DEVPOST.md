# FixIt AI: Autonomous Maintenance Operations Agent

### Tagline
> **Turn tenant maintenance complaints into verified work orders in seconds, with deterministic safety guardrails and persistent unit memory.**

---

## 💡 Inspiration

Independent residential property managers (managing 50 to 500 units) spend nearly $40\%$ of their working hours fielding unstructured maintenance complaints across fragmented emails, text messages, phone calls, and spreadsheets. 

This manual triage creates two critical operational failures:
1. **Critical Safety Hazards are Missed or Delayed:** When an occupant reports a *"weird sulfur smell"* or *"sparks near the kitchen sink,"* standard ticketing systems treat it as a routine queue item. Ordinary contractor dispatch is insufficient—and potentially fatal—when emergency evacuation and 911 protocols are required.
2. **Amnesia in Maintenance History:** When a pipe bursts in Unit 204, property managers rarely remember that the same pipe had galvanic corrosion noted six months prior. Instead of replacing the compromised stack, another superficial patch is ordered, wasting thousands of dollars.

We built **FixIt AI** to bridge this gap: an autonomous maintenance operations agent that diagnoses issues, extracts missing information, enforces deterministic life-safety guardrails, recalls unit memory across interactions, and matches verified trade contractors—all while keeping property managers in firm control with human-in-the-loop approvals.

---

## ⚙️ What It Does

FixIt AI transforms raw, unstructured tenant maintenance complaints into structured, actionable operations workflows:

- **Intelligent Intake & AI Triage:** Ingests maintenance requests and leverages Anthropic Claude to classify trade categories, extract root causes, and formulate specific diagnostic probing questions (e.g., *"Is the leak continuous or only when draining?"*).
- **Deterministic Life-Safety Guardrails (No AI Downgrade):** If a suspected gas leak, fire hazard, or water intrusion onto electrical infrastructure is detected, deterministic safety rules immediately trigger emergency protocols. The system escalates urgency to **CRITICAL EMERGENCY**, provides situation-appropriate evacuation advice, alerts occupants to call 911 / utility emergency services, and suspends routine scheduling.
- **Persistent Unit Memory with SurrealDB:** FixIt AI stores and retrieves historical repair memories isolated by organization and unit. In our benchmark Unit 204 workflow, the agent recalls prior main-stack corrosion from months earlier, dynamically updating its recommendation from a routine valve replacement to a structural stack inspection.
- **Contractor Recommendation Engine:** Matches vetted local trade contractors based on specialty, geographical service area, real-time availability (`available`, `on_call`, `busy`), and historical familiarity with the building. It never invents contractors or fabricates availability.
- **Human-in-the-Loop Work Order Lifecycle:** AI drafts work orders in `Awaiting Approval` status. Property managers explicitly review and authorize assignments. State transitions are strictly validated, requiring resolution notes upon completion before archiving into permanent memory.
- **Era by Eon Evaluation Suite:** Includes an automated benchmark suite with 15 synthetic maintenance scenarios testing routine maintenance, edge cases, safety overrides, contractor boundaries, memory isolation, and unauthorized cross-organization access attempts.

---

## 🛠️ How We Built It

FixIt AI was built with a modern, high-performance, and secure full-stack architecture:

- **Frontend & App Framework:** Next.js 14 App Router, React, TypeScript, and Tailwind CSS. Designed with a clean B2B SaaS aesthetic (neutral slate backgrounds, dark navy typography, and restrained emerald accents).
- **AI Agent Engine:** Anthropic Claude 3.5 Sonnet (`@anthropic-ai/sdk`) for structured JSON schema triage, paired with an intelligent structured fallback engine ensuring zero downtime even in offline or rate-limited environments.
- **Database & Agent Memory:** SurrealDB JavaScript SDK with multi-tenant document schemas and a robust local adapter. Supports persistent memory recall, audit logging, and strict data isolation across property management organizations.
- **Authentication & Security:** Clerk authentication integration with server-enforced organization access boundaries ($\text{Auth}(\text{Org}_A) \cap \text{Data}(\text{Org}_B) = \emptyset$).
- **Agent Evaluation:** Built-in Era by Eon benchmark runner executing 15 comprehensive unit scenarios with automated assertion checks.

---

## 📐 Safety Reconciler Formula

To prevent non-deterministic LLM behavior from ever downgrading a life-safety hazard, our backend applies a deterministic urgency reconciliation function:

$$\text{Urgency}_{\text{final}} = \max\Big(\text{Urgency}_{\text{AI}}, \,\, \text{Urgency}_{\text{SafetyRule}}\Big)$$

$$\text{where} \quad \text{Urgency} \in \{\text{low} < \text{normal} < \text{high} < \text{emergency}\}$$

If deterministic safety flags an emergency ($\text{Urgency}_{\text{SafetyRule}} = \text{emergency}$), the system enforces $\text{Urgency}_{\text{final}} = \text{emergency}$, regardless of model confidence or prompt variance.

---

## 🧗 Challenges We Faced

1. **Deterministic Safety vs. Generative Flexibility:** Large Language Models are probabilistic by nature, but property maintenance involves life-or-death hazards (natural gas, live electricity, structural collapse). Ensuring the AI could never inadvertently downgrade an emergency required building a deterministic override layer that intercepts and supersedes model predictions before work orders are created.
2. **Preventing Substring False Positives:** In our early offline matching logic, innocent words triggered unexpected categories—for example, *"refrigerator"* contained *"rat"*, inadvertently triggering pest control, and *"patio accessible"* matched *"ac"*, triggering HVAC. We solved this by implementing strict tokenized regex word boundaries ($\backslash\text{b}$) and semantic trade grouping.
3. **Multi-Tenant Memory Isolation:** Agent memory must never bleed across tenants or property management companies. We built strict organization scoping into every retrieval query, ensuring memories for Unit 204 in Organization A are completely invisible to Organization B.

---

## 🏆 Accomplishments We're Proud Of

- **100% Automated Test Pass Rate:** All 12 mandatory user journeys ($13/13$ automated tests in `tests/workflows.test.ts`) pass cleanly.
- **100% Benchmark Score on Eon Benchmark:** All 15 evaluation scenarios passed on classification accuracy, safety adherence, contractor matching, and security boundaries.
- **The Unit 204 Memory Sequence:** Seeing the agent retrieve historical pipe corrosion and actively change its recommendation from a superficial patch to a structural fix demonstrated the true power of persistent agent memory.
- **Zero Hallucinated Contractors:** Every single contractor recommended by FixIt AI is matched against real, verified database records with clear explanations of why they were chosen.

---

## 📚 What We Learned

- **Hybrid AI Architecture is Essential for Ops:** Pure LLM agents are too unpredictable for physical property operations, but rigid deterministic rule systems are too brittle to understand natural language tenant complaints. Combining deterministic safety guardrails with Claude's structured reasoning created the optimal balance of safety and flexibility.
- **Memory Provenance Matters:** An agent must clearly distinguish between *confirmed historical records* (e.g., an invoice from an electrician) and *inferred observations* (e.g., an unverified tenant comment). Labeling memory sources prevents hallucinations from compounding over time.

---

## 🚀 What's Next for FixIt AI

- **Omnichannel Intake:** Direct integration with Twilio SMS and WhatsApp so tenants can submit maintenance requests without downloading an app.
- **Visual Defect Computer Vision:** Multimodal inspection of uploaded damage photos to detect moisture stains, pipe hairline fractures, and mold growth before sending out technicians.
- **Automated Insurance Telemetry:** One-click compilation of time-stamped audit logs, photos, and contractor invoices for property insurance claims during major flood or storm events.

---

## 🔗 Project Links

- **GitHub Repository:** [https://github.com/stablehacks/bn-fixit-ai](https://github.com/stablehacks/bn-fixit-ai)
- **Built With:** Next.js 14, TypeScript, Anthropic Claude API, SurrealDB, Clerk, Tailwind CSS, Era by Eon
