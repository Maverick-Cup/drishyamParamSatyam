# Principal Engineering, Data Provenance & Anti-Slop Gate

All planning (`/plan`) and implementation work in this repository MUST enforce the following 12 architectural invariants before presenting any plan or writing code.

## 1. Zero Fabricated Data & Single Source of Truth (No AI Slop)
- NEVER invent plausible names, locations, timestamps, quotes, or filler records to make a UI look populated.
- NEVER add static offsets (`+ 12`, `+ 80`) or hardcoded percentages (`98.4%`) to live counters.
- Every counter, badge, and graph node MUST derive from deduplicated `Set`s over a single persisted source of truth.
- If a field is missing or unverified, render an explicit honest state (`"Speaker unknown"`, `"No verified location"`, `"0 verified recordings"`) rather than synthetic filler.

## 2. Contract-First & Provenance-First Design
- When given a screenshot or reference UI, extract the **structural interaction idea** only—never clone third-party branding/themes blindly, and ALWAYS start the plan with **Data Contract & Provenance Lineage** (TypeScript interfaces, `EvidenceAnchor`s, `ProvenanceTier`, `ReviewStatus`).
- Separate `VERIFIED_FIRST_PERSON`, `ATTRIBUTED_RECOLLECTION`, `USER_CONTEXT`, and `GENERATED_CONTENT` visually and in data types. AI synthesis must fail closed when zero approved evidence anchors exist.

## 3. Pure Domain Layer vs. Presentation Components
- Do not embed complex graph builders, deduplication, or metric calculators inside React page components.
- Extract pure, deterministic domain functions (`domain/*.ts`) that can be tested independently of React.

## 4. Explicit State Machines & Async Lifecycle Hygiene
- Model interactive flows using TypeScript discriminated unions (`IDLE | LOADING | READY | ERROR | REVOKED`), never loose boolean flags.
- Guard all async actions and media playback with monotonic `requestId` / `AbortController` tokens and mandatory `useEffect` unmount cleanup (pausing audio/video/timers on route exit).

## 5. Mandatory 12-Point Self-Grade Before Presenting Any `/plan`
Before outputting any `/plan` artifact, self-grade the draft against all 12 dimensions and include the 12-row Senior Review Verdict table at the top of the plan:
1. Product Originality & Domain Semantics
2. Data Contract & Single Source of Truth
3. Grounding, Provenance & Evidence Anchors
4. Pure Domain Architecture & File Boundaries
5. Discriminated-Union State Management & Async Cancellation
6. Complete UI State Matrix (Zero, Loading, Partial, Revoked, Error)
7. Accessibility (WCAG 2.1 AA, Keyboard Navigation, Focus Return, List View Parity, Reduced Motion)
8. Responsive Breakpoints (Desktop, Tablet, Mobile)
9. Deterministic Performance (No continuous physics jitter; static seeded layout)
10. Mental-Health, Privacy & Tenant Isolation (`profileId` scoping, zero PII logs)
11. Requirement-Mapped Automated Test Matrix (`TEST-001..N` via `node --test`)
12. Ready-to-Implement Verdict
