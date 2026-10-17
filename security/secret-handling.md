# ParamSathya Secret Handling & Pre-Publication Policy (`PARAMSATHYA-SEC-001`)

## 1. Zero-Secret Source & Bundle Invariant
- **Never commit `.env`, `.env.local`, or `.env.production`**. Only `.env.example` with empty or non-sensitive placeholders is tracked in Git.
- **Never prefix server secrets with `NEXT_PUBLIC_`, `VITE_`, or `PUBLIC_`**. Any variable prefixed with `NEXT_PUBLIC_` is compiled into client-side JavaScript bundles.
- **Never paste credentials into chat, issues, commits, or screenshots**. Any credential exposed in any of those surfaces must be treated as compromised and rotated immediately.

---

## 2. Classification Matrix
| Classification | Examples | Policy |
|---|---|---|
| **CRITICAL** | `GEMINI_API_KEY`, `SYNC_API_KEY`, `FIREBASE_PRIVATE_KEY`, OAuth Bearer Tokens (`ya29.*`), Service Account JSON keys | Immediate rotation + server-only runtime injection |
| **HIGH** | Historical secrets in Git refs, `SYNC_DEMO_COMMIT_TOKEN`, high-entropy tokens in untracked/staged files | Block commit/push + remediate before publication |
| **INFORMATIONAL / PUBLIC** | GCP Project ID, public Cloud Run URL, Firebase Web Config API key (restricted to Firebase Auth/Firestore with Security Rules & App Check) | Allowed when restricted; never reuse for Gemini Developer API |

---

## 3. Automated Prevention Gates
1. **Pre-Commit Hook (`.git/hooks/pre-commit`)**:
   - Runs `node scripts/security/secret-exposure-audit.mjs` automatically on every `git commit`.
   - Bypassing hooks (`--no-verify`) is strictly prohibited without formal security review.
2. **Pre-Push Hook (`.git/hooks/pre-push`)**:
   - Runs full working-tree, `.next` build bundle, and full Git history checks before any `git push`.
3. **CI Gate (`.github/workflows/secret-scan.yml`)**:
   - Executes Gitleaks, TruffleHog (`--no-verification`), production build, `secret-exposure-audit.mjs`, and `npm pack --dry-run --json` on every push and pull request.
