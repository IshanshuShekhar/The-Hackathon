# PRD: AI-Powered Applicant Journey for Germany
**ImpactX'26 — Agentic AI Track | Sponsor: Educaro Deutschland GmbH**

---

## 1. Problem & Vision
Indian applicants exploring study, vocational training, or employment in Germany face a fragmented journey: scattered document collection, manual qualification checks, and no clear next step. Many applicants also have limited German proficiency, which adds another barrier to understanding requirements and next steps.

**Vision**: One guided, agentic journey — from first interaction to a complete, verified, qualified applicant profile — that reduces manual effort for both applicant and consultant, and clearly tells the applicant what they qualify for and what to do next.

---

## 2. Goals
- Turn an unstructured applicant (chat, documents, video) into a structured, qualified profile with minimal manual re-entry.
- Make the AI's work legible: what it did, what it's sure of, what it assumed.
- Never invent applicant data — every field is traceable to a source.
- Support applicants with weak German via guided tutorials and a learning-readiness path, instead of blocking them.
- Let the applicant unlock premium/consultant services via a simple, mobile-friendly Indian payment flow (UPI/QR), with access persisting after logout.

---

## 3. Users
| Persona | Need |
| :--- | :--- |
| **Applicant** (India, various German levels) | Understand fastest path to Germany, upload documents once, get a clear qualification outcome, pay for consultant support easily |
| **Consultant** (Educaro) | See a pre-digested applicant summary and lead score instead of re-collecting information |
| **Admin/Ops** | Configure eligibility rules, monitor journeys, manage payment records |

---

## 4. End-to-End User Journey
1. **Landing & Login** — Applicant creates an account / logs in (email or phone OTP).
2. **Goal Intake** — Agent asks: study, vocational training, or employment?
3. **Profile Building (Chat)** — Agent progressively collects Personal, Education, Employment, Skills, Languages, Motivation.
4. **Document Upload** — Degrees, certificates, experience letters, language certificates, existing CV. Agent extracts fields via OCR/parsing.
5. **Video Intro (optional)** — Applicant records a short intro video; agent transcribes and extracts motivation/goals/background.
6. **Clarification Loop** — Agent flags missing/inconsistent info (e.g., conflicting dates) and asks targeted follow-up questions.
7. **German Level Check** — If weak/absent, agent offers a learning path with tutorial videos and a readiness estimate, rather than a hard rejection.
8. **Qualification Assessment** — Agent evaluates profile against eligibility rules; outputs status + missing requirements.
9. **Generated CV** — Professional CV auto-generated from verified profile data.
10. **Recommended Next Step** — Suggested Educaro service, consultant referral, or applicant action.
11. **Payment (optional, for premium/consultant services)** — UPI / QR code checkout. Payment confirmation and unlocked services remain accessible even after the applicant logs out (tied to account + payment record, not session).
12. **Consultant Handoff** — Consultant views AI-generated summary, lead score, and full provenance-tagged profile.

---

## 5. Core Features (Must-Have)
- Goal understanding (study / vocational / employment)
- Progressive structured profile building
- Document extraction (degrees, certificates, experience letters, language certs, CVs)
- Auto-generated professional CV
- Missing/incomplete/inconsistent info detection with clarification prompts
- Qualification/eligibility assessment against predefined rules (deterministic, not LLM)
- Clear qualification outcome + missing requirements
- Recommended next step within Educaro ecosystem

---

## 6. Must-Have "Wow Moments"
1. **Agent Trace Panel** — Live feed of which agent acted, which tool it called, and why (e.g., "Extraction Agent → OCR tool → parsing degree certificate"). Proves real agent orchestration.
2. **Provenance Badges** — Every profile field labeled: `Verified` / `Applicant-provided` / `AI-extracted` / `AI-generated`. Directly satisfies the brief's requirement to distinguish these.
3. **Side-by-Side Extraction Review** — Certificate image next to extracted fields with confidence scores; applicant confirms or corrects. Visibly proves the AI isn't inventing data.
4. **Inconsistency Catcher** — Upload documents with conflicting dates/details → agent detects the conflict and asks a targeted clarifying question live.
5. **What-If Simulator** — e.g., "If I reach German B1, what changes?" — outcome updates instantly via deterministic rules (not AI), showing appropriate use of rules vs. models.

---

## 7. Differentiators
- Hindi voice/chat support — reflects real understanding of the Indian applicant base.
- Consultant Dashboard — lead scores with a "why this score" explanation, tying AI output to business value.
- AI Consultant Summary — one-page brief so consultants don't re-collect information.
- Weak-German Learning Path — tutorial videos + readiness estimate, framing weak German as a guided path rather than a rejection.

---

## 8. New Requirements
### 8.1 German-Language Support
- If detected/self-reported German level is weak or absent, surface a tutorial video track (A1 → B1 basics) alongside the qualification outcome.
- Show a readiness estimate ("~4 months to B1 at current pace") rather than a flat disqualification.
- Tutorials can be curated embedded video links (YouTube/Educaro content) — no need to build video hosting for MVP.

### 8.2 Authentication
- Dedicated Sign Up / Login page (not a modal) — email/phone entry, OTP or password, toggle link between sign in & sign up.
- On successful signup or login, the applicant is taken to a new page: the first step of the journey (Goal Intake), not back to the homepage.
- Persistent "← Back" control, "Continue →" / "Next" control, step indicator ("Step 2 of 6").
- Progress is saved at each step.

### 8.3 Payments
- UPI ID entry and QR code (static or dynamically generated per transaction) as primary Indian payment methods.
- Used to unlock premium services (e.g., consultant review, priority processing).
- Critical requirement: once paid, entitlement is stored against the applicant's account, not the session/cookie — so the applicant retains access even after logging out.

---

## 9. Visual Design System
Soft, elegant, premium academic/consulting — muted natural tones, generous whitespace, rounded cards, thin subtle borders, soft shadows. No bright/neon colors, no pure white backgrounds.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| Main background | `#F5F5EF` | Warm off-white / ivory — app base background |
| Secondary background | `#E8ECE5` | Very light sage — alternate sections, dashboard panels |
| Card background | `#EEF1EB` | Soft pale gray-green — all cards |
| Icon background | `#E5EDF0` | Very pale blue-gray — icon chips, badges |
| Primary text | `#344653` | Dark desaturated navy/blue-gray — headings, body copy |
| Secondary text | `#71808A` | Muted blue-gray — descriptions, captions |
| Accent | `#718C9B` | Muted dusty blue — links, active states, icons |
| Border | `#DCE2DC` | Subtle light gray-green — card/input borders |
| Button (primary) | `#5F7D8B` | Muted blue-gray — primary CTA background |
| Button text | `#FFFFFF` | White text on primary buttons |

---

## 10. FAQ Section
Includes 11 questions on the homepage below "How It Works" in a single-open accordion.

---

## 11. Candidate Details Page
Consolidated view showing:
- Personal, Education, Employment, Skills, Languages
- Documents with thumbnails/links
- Qualification status & requirements
- Payment / entitlement history
- Provenance badge on every field
- Inline editable fields
- Consultant view with Lead Score + "why this score" explanation
