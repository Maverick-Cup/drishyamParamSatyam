<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Principal Engineering, Data Provenance & Anti-Slop Gate

All planning (`/plan`) and implementation work in this repository MUST follow `.gemini/rules/principal-architecture-gate.md`:
1. **Zero Fabricated Data & Single Source of Truth**: Never invent filler stories, locations, speakers, or static counter offsets (`+ 12`, `+ 80`). Derive all counters from deduplicated `Set`s of verified records.
2. **Contract & Provenance First**: Define typed `EvidenceAnchor`, `ProvenanceTier`, and `ReviewStatus` contracts before UI components. Fail closed on AI synthesis when zero approved anchors exist.
3. **Pure Domain Layer**: Keep graph/data transformations in pure, unit-tested `domain/` functions rather than monolithic React components.
4. **Discriminated-Union State Machines & Cleanup**: Model UI/async states as discriminated unions with `requestId` cancellation and unmount media cleanup.
5. **12-Point Self-Audit + `node --test` Matrix**: Include the 12-row Senior Review Verdict table in every `/plan` and verify requirements with automated tests (`node --test`) plus `npx tsc --noEmit`.
