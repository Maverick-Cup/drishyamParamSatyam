# Pending Implementation Bucket List

This document tracks deferred tasks, features placed on hold, and pending production environment configurations for ParamSathya.

---

## 1. Real Gmail API Connected-Circle Invitations (`PARAMSATHYA-GMAIL-001`)

- **Status**: `DEFERRED / PENDING CREDENTIAL SETUP`
- **Current State**: 
  - **Slice 1 Complete**: Full Firestore domain model, token hashing (`SHA256(rawToken + PEPPER)`), idempotency deduplication, UI integration, acceptance landing page (`/invite/accept`), and test suite (23/23 passing) are implemented and safe.
  - Runtime defaults to `MockInvitationMailer` with **0 live network calls** to Google.
- **Pending Actions to Activate Real Email Sends**:
  1. **Enable Gmail API**:
     - Project: `gen-lang-client-0271147199`.
     - Enable `gmail.googleapis.com` via Google Cloud Console.
  2. **OAuth Consent Screen**:
     - User Type: `External` (or `Internal` if Google Workspace is added later).
     - App Name: `ParamSathya`.
     - Scope: `https://www.googleapis.com/auth/gmail.send` only (strictly no inbox read/modify scopes).
     - Test Users: Add dedicated sender email address.
     - *Risk Reminder*: External Testing refresh tokens expire after 7 days under Google's policy.
  3. **Generate Refresh Token**:
     - Run locally: `npx ts-node scripts/gmail/authorize-sender.ts`.
  4. **Inject Secrets into Cloud Run**:
     - Set in Cloud Run `paramsatya` (`asia-east1`) via Secret Manager / Environment Variables without committing keys to git:
       - `GMAIL_OAUTH_CLIENT_ID`
       - `GMAIL_OAUTH_CLIENT_SECRET`
       - `GMAIL_SENDER_REFRESH_TOKEN`
       - `GMAIL_SENDER_EMAIL`
       - `INVITE_TOKEN_PEPPER`
- **Safety Boundary**: Zero secrets or credentials in git. Until configured, mock mailer remains active and UI works seamlessly without breaking.

---

## 2. PWA Offline Caching & Background Sync
- **Status**: `DEFERRED`
- **Context**: Requires privacy review before caching voice recordings or private memory records in client-side storage.

---

## 3. Real Android Physical Device Field Testing
- **Status**: `QUEUED FOR PHASE M5`
- **Context**: Post-Phase M1 adaptive shell implementation.
