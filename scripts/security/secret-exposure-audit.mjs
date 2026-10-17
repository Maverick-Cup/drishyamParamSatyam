#!/usr/bin/env node
/**
 * PARAMSATHYA-SEC-001 — Deterministic Secret Exposure Audit Engine
 *
 * Strictly adheres to zero-disclosure rules:
 * 1. Reads an allowlist of server-only environment variable NAMES & values in-process.
 * 2. Never prints, slices, hashes-without-salt, or writes raw secret values to console or files.
 * 3. Scans:
 *    - Current working tree (source, scripts, configs, docs)
 *    - Build outputs (.next/static, .next/standalone, out, dist)
 *    - Complete Git history across all branches, tags, and refs (git log --all -p)
 *    - Static dangerous patterns (NEXT_PUBLIC_*KEY/SECRET/TOKEN, hardcoded headers, process.env dumps)
 * 4. Reports ONLY: finding ID, secret category, detector name, severity, file path, line number,
 *    commit hash, branch/ref, current vs historical status, and a non-reversible ephemeral fingerprint.
 * 5. Exits non-zero if any unauthorized CRITICAL or HIGH finding is detected.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const EPHEMERAL_SALT = crypto.randomBytes(32);

function fingerprint(secretValue) {
  return crypto
    .createHmac('sha256', EPHEMERAL_SALT)
    .update(String(secretValue))
    .digest('hex')
    .slice(0, 12);
}

const KNOWN_SECRET_ENV_NAMES = [
  'GEMINI_API_KEY',
  'GOOGLE_API_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'FIREBASE_ADMIN_CREDENTIALS',
  'FIREBASE_PRIVATE_KEY',
  'SYNC_API_KEY',
  'SYNC_WEBHOOK_SECRET',
  'SYNC_DEMO_COMMIT_TOKEN',
  'SESSION_SECRET',
  'NEXTAUTH_SECRET',
  'AUTH_SECRET',
  'DATABASE_URL',
  'GOOGLE_CLIENT_SECRET',
  'OAUTH_CLIENT_SECRET',
  'ELEVENLABS_API_KEY',
];

// Load secret values silently from process.env and .env.local (never printed)
function loadLocalSecretValues() {
  const secretMap = new Map();

  for (const name of KNOWN_SECRET_ENV_NAMES) {
    const val = (process.env[name] || '').trim();
    if (val && val.length >= 12 && !val.startsWith('<') && !val.startsWith('your_')) {
      secretMap.set(name, val);
    }
  }

  const envFiles = ['.env', '.env.local', '.env.production'];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^([A-Z0-9_]+)=(.+)$/);
        if (match) {
          const [, k, rawV] = match;
          const v = rawV.trim().replace(/^["']|["']$/g, '');
          if (
            (KNOWN_SECRET_ENV_NAMES.includes(k) ||
              k.endsWith('_KEY') ||
              k.endsWith('_SECRET') ||
              k.endsWith('_TOKEN')) &&
            v.length >= 12 &&
            !v.startsWith('<') &&
            !v.startsWith('your_')
          ) {
            secretMap.set(k, v);
          }
        }
      }
    }
  }

  return secretMap;
}

const STATIC_DETECTORS = [
  {
    id: 'STATIC-PUBLIC-SECRET-ENV',
    name: 'Public Client Secret Prefix',
    category: 'Client-Bundle Secret Exposure',
    severity: 'CRITICAL',
    regex: /\b(NEXT_PUBLIC_|VITE_|PUBLIC_)[A-Z0-9_]*(API_KEY|SECRET|TOKEN|PRIVATE_KEY)\s*=/,
  },
  {
    id: 'STATIC-PROCESS-ENV-DUMP',
    name: 'Full process.env Serialization / Log Dump',
    category: 'Environment Exfiltration',
    severity: 'CRITICAL',
    regex: /\b(console\.log\s*\(\s*process\.env\s*\)|JSON\.stringify\s*\(\s*process\.env\s*\)|Response\.json\s*\(\s*process\.env\s*\))/,
  },
  {
    id: 'STATIC-PRIVATE-KEY-HEADER',
    name: 'PEM / PKCS8 Private Key Block',
    category: 'Private Key Material',
    severity: 'CRITICAL',
    regex: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  },
  {
    id: 'STATIC-GOOGLE-API-KEY-LITERAL',
    name: 'Google AIza / AQ API Key Literal',
    category: 'Cloud / Gemini API Key',
    severity: 'CRITICAL',
    regex: /\b(AIza[0-9A-Za-z\-_]{35}|AQ\.[0-9A-Za-z\-_]{30,})\b/,
  },
  {
    id: 'STATIC-SYNC-KEY-LITERAL',
    name: 'Sync Labs API Key Literal',
    category: 'Third-Party Lip-Sync API Key',
    severity: 'CRITICAL',
    regex: /\bsk-[0-9A-Za-z]{16,}\.[0-9A-Za-z]{16,}\b/,
  },
  {
    id: 'STATIC-GCP-OAUTH-BEARER',
    name: 'Google OAuth2 Access Token (ya29)',
    category: 'Cloud Access Token',
    severity: 'CRITICAL',
    regex: /\bya29\.[0-9A-Za-z\-_]{40,}\b/,
  },
];

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  '.security-reports',
]);

// Files that are expected local untracked/ignored secret stores (verified to be git-ignored separately)
const EXPECTED_LOCAL_ENV_FILES = new Set(['.env', '.env.local', '.env.production']);

const BINARY_EXTENSIONS = new Set([
  '.mp3',
  '.mp4',
  '.mov',
  '.wav',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
]);

function walkFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = path.join(dir, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        walkFiles(relPath, fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!BINARY_EXTENSIONS.has(ext)) {
        fileList.push(relPath);
      }
    }
  }
  return fileList;
}

function runAudit() {
  const findings = [];
  const secretValues = loadLocalSecretValues();
  let findingCounter = 1;

  // Verify that expected local env files are NOT tracked by git
  for (const envFile of EXPECTED_LOCAL_ENV_FILES) {
    if (fs.existsSync(envFile)) {
      try {
        const tracked = execSync(`git ls-files "${envFile}"`, { encoding: 'utf8' }).trim();
        if (tracked) {
          findings.push({
            findingId: `SEC-${String(findingCounter++).padStart(3, '0')}`,
            category: 'Tracked Environment File',
            detector: 'git-ls-files-env-check',
            severity: 'CRITICAL',
            filePath: envFile,
            lineNumber: 1,
            commitHash: 'WORKING_TREE',
            branchRef: 'HEAD',
            exposureClass: 'CURRENT_TREE',
            remediationStatus: 'UNRESOLVED',
            fingerprint: 'TRACKED_ENV_FILE',
          });
        }
      } catch {}
    }
  }

  // 1. Scan Working Tree + Build Outputs (.next, dist, out)
  const allFiles = walkFiles('.');
  for (const filePath of allFiles) {
    if (EXPECTED_LOCAL_ENV_FILES.has(filePath)) continue; // Verified untracked/ignored above
    if (filePath === 'scripts/security/secret-exposure-audit.mjs') continue;

    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const isBuildOutput = filePath.startsWith('.next/') || filePath.startsWith('dist/') || filePath.startsWith('out/');
    const lines = content.split(/\r?\n/);

    // Check exact secret value matches
    for (const [envName, secretVal] of secretValues.entries()) {
      if (content.includes(secretVal)) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(secretVal)) {
            findings.push({
              findingId: `SEC-${String(findingCounter++).padStart(3, '0')}`,
              category: `Exact Secret Match (${envName})`,
              detector: 'exact-byte-probe',
              severity: 'CRITICAL',
              filePath,
              lineNumber: i + 1,
              commitHash: 'WORKING_TREE',
              branchRef: 'HEAD',
              exposureClass: isBuildOutput ? 'BUILD_OUTPUT' : 'CURRENT_TREE',
              remediationStatus: 'UNRESOLVED',
              fingerprint: fingerprint(secretVal),
            });
          }
        }
      }
    }

    // Check static regex detectors
    for (const detector of STATIC_DETECTORS) {
      for (let i = 0; i < lines.length; i++) {
        if (detector.regex.test(lines[i])) {
          findings.push({
            findingId: `SEC-${String(findingCounter++).padStart(3, '0')}`,
            category: detector.category,
            detector: detector.id,
            severity: detector.severity,
            filePath,
            lineNumber: i + 1,
            commitHash: 'WORKING_TREE',
            branchRef: 'HEAD',
            exposureClass: isBuildOutput ? 'BUILD_OUTPUT' : 'CURRENT_TREE',
            remediationStatus: 'UNRESOLVED',
            fingerprint: fingerprint(`${detector.id}:${filePath}:${i + 1}`),
          });
        }
      }
    }
  }

  // 2. Scan Complete Git History across all branches, tags, and refs
  try {
    const revList = execSync('git rev-list --all', { encoding: 'utf8' })
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);

    for (const commitHash of revList) {
      const patch = execSync(`git show --format="" "${commitHash}"`, {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024,
      });

      let currentFile = 'UNKNOWN';
      let lineNum = 0;
      for (const line of patch.split(/\r?\n/)) {
        if (line.startsWith('+++ b/')) {
          currentFile = line.slice(6).trim();
          lineNum = 0;
          continue;
        }
        if (line.startsWith('@@ ')) {
          const m = line.match(/\+(\d+)/);
          lineNum = m ? parseInt(m[1], 10) - 1 : 0;
          continue;
        }
        if (line.startsWith('+') && !line.startsWith('+++')) {
          lineNum++;
          if (currentFile === 'scripts/security/secret-exposure-audit.mjs') continue;

          // Check exact secret match in commit diff
          for (const [envName, secretVal] of secretValues.entries()) {
            if (line.includes(secretVal)) {
              findings.push({
                findingId: `SEC-${String(findingCounter++).padStart(3, '0')}`,
                category: `Historical Exact Secret (${envName})`,
                detector: 'git-history-exact-probe',
                severity: 'HIGH',
                filePath: currentFile,
                lineNumber: lineNum,
                commitHash: commitHash.slice(0, 12),
                branchRef: 'ALL_REFS',
                exposureClass: 'GIT_HISTORY',
                remediationStatus: 'UNRESOLVED',
                fingerprint: fingerprint(secretVal),
              });
            }
          }

          // Check static regex detectors in commit diff
          for (const detector of STATIC_DETECTORS) {
            if (detector.regex.test(line)) {
              findings.push({
                findingId: `SEC-${String(findingCounter++).padStart(3, '0')}`,
                category: detector.category,
                detector: detector.id,
                severity: 'HIGH',
                filePath: currentFile,
                lineNumber: lineNum,
                commitHash: commitHash.slice(0, 12),
                branchRef: 'ALL_REFS',
                exposureClass: 'GIT_HISTORY',
                remediationStatus: 'UNRESOLVED',
                fingerprint: fingerprint(`${detector.id}:${commitHash}:${currentFile}`),
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[Audit Warning] Git history scan encountered an error:', err.message);
  }

  // Ensure .security-reports directory exists
  if (!fs.existsSync('.security-reports')) {
    fs.mkdirSync('.security-reports', { recursive: true });
  }

  const summary = {
    timestamp: new Date().toISOString(),
    secretEnvNamesMonitored: Array.from(secretValues.keys()),
    totalFilesScanned: allFiles.length,
    totalFindings: findings.length,
    criticalCount: findings.filter((f) => f.severity === 'CRITICAL').length,
    highCount: findings.filter((f) => f.severity === 'HIGH').length,
    publicationStatus:
      findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length === 0
        ? 'GO'
        : 'NO_GO',
    findings,
  };

  fs.writeFileSync(
    '.security-reports/secret-exposure-summary.json',
    JSON.stringify(summary, null, 2)
  );

  console.log('================================================================');
  console.log(' 🛡️  PARAMSATHYA-SEC-001 SECRET EXPOSURE AUDIT SUMMARY');
  console.log('================================================================');
  console.log(` Files Scanned:            ${summary.totalFilesScanned}`);
  console.log(` Monitored Secret Vars:    ${summary.secretEnvNamesMonitored.join(', ') || 'None in local env'}`);
  console.log(` Critical Findings:        ${summary.criticalCount}`);
  console.log(` High Findings:            ${summary.highCount}`);
  console.log(` Total Findings:           ${summary.totalFindings}`);
  console.log(` PUBLICATION_STATUS:       ${summary.publicationStatus}`);
  console.log('================================================================');

  if (findings.length > 0) {
    console.log('\nSanitized Findings (Zero Secret Values Disclosed):');
    for (const f of findings) {
      console.log(
        ` - [${f.findingId}] [${f.severity}] [${f.exposureClass}] ${f.category} | File: ${f.filePath}:${f.lineNumber} | Commit: ${f.commitHash} | Fingerprint: ${f.fingerprint}`
      );
    }
    process.exit(1);
  }
}

runAudit();
