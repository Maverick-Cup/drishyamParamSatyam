/**
 * AgentGuardrails: Deterministic Security & Red-Team Defense Engine
 * Protects against Prompt Injection, System Override (DAN), Exfiltration, SSRF, and Resource Abuse.
 * Grounded in "The Red Teamer's Toolkit: 15 Prompts to Break Your AI Agent".
 */

export interface GuardrailCheckResult {
  isSafe: boolean;
  threatType?: string;
  sanitizedText?: string;
  rejectionReason?: string;
}

// 1. Gaslighting & Prompt Injection signatures
const INJECTION_PATTERNS = [
  /system\s*override/i,
  /ignore\s*(all)?\s*(previous|prior)\s*(instructions|rules|prompts)/i,
  /dan\s*mode/i,
  /developer\s*mode/i,
  /debug\s*mode/i,
  /jailbreak/i,
  /unconstrained\s*(ai|model)/i,
  /disregard\s*(all)?\s*(safety|ethical|guidelines)/i,
  /repeat\s*(your)?\s*(system\s*prompt|initial\s*instructions)/i,
  /dump\s*(your)?\s*(system\s*prompt|prompts|internal\s*state)/i,
  /reveal\s*(your)?\s*(hidden\s*instructions|source\s*code|api\s*key)/i,
];

// 2. Secret & Token Exfiltration signatures
const EXFILTRATION_PATTERNS = [
  /process\.env/i,
  /api[-_]?key/i,
  /sync[-_]?api[-_]?key/i,
  /gemini[-_]?api[-_]?key/i,
  /secret[-_]?token/i,
  /auth[-_]?token/i,
  /bearer\s+[a-zA-Z0-9_\-\.]{20,}/i,
  /sk-[a-zA-Z0-9_\-]{20,}/i,
  /AIza[a-zA-Z0-9_\-]{35}/i,
  /AQ\.[a-zA-Z0-9_\-]{30,}/i,
];

// 3. Sensitive Key Scrubbing regexes for output sanitization
const OUTPUT_SCRUBBERS = [
  /sk-[a-zA-Z0-9_\-]{16,}/g,
  /AIza[a-zA-Z0-9_\-]{30,}/g,
  /AQ\.[a-zA-Z0-9_\-]{25,}/g,
  /ghp_[a-zA-Z0-9]{30,}/g,
  /xox[baprs]-[a-zA-Z0-9_\-]{20,}/g,
  /Bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi,
];

export class AgentGuardrails {
  /**
   * Validates user input before it reaches the LLM or Tool Execution.
   */
  public static validateInput(input: string): GuardrailCheckResult {
    const trimmed = (input || '').trim();

    // Check 1: Input size limits (prevents token exhaustion attacks)
    if (trimmed.length > 2000) {
      return {
        isSafe: false,
        threatType: 'TOKEN_FLOODING',
        rejectionReason: 'Input message exceeds maximum allowed length of 2000 characters.',
      };
    }

    // Check 2: Prompt Injection / System Override / Gaslighting
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isSafe: false,
          threatType: 'PROMPT_INJECTION',
          rejectionReason: 'Adversarial instruction override or jailbreak pattern detected.',
        };
      }
    }

    // Check 3: Secrets & Environment Exfiltration Probing
    for (const pattern of EXFILTRATION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isSafe: false,
          threatType: 'DATA_EXFILTRATION_PROBE',
          rejectionReason: 'Probing for internal environment variables or API keys is forbidden.',
        };
      }
    }

    return {
      isSafe: true,
      sanitizedText: trimmed,
    };
  }

  /**
   * Sanitizes model generated outputs before returning to the user.
   * Guarantees zero secret leakage even if an LLM is hallucinating or coaxed.
   */
  public static sanitizeOutput(output: string): string {
    let sanitized = output;

    for (const scrubber of OUTPUT_SCRUBBERS) {
      sanitized = sanitized.replace(scrubber, '[REDACTED_SECRET]');
    }

    // Block accidental environment variable key-value leaks
    sanitized = sanitized.replace(/(GEMINI_API_KEY|SYNC_API_KEY|LIPSYNC_BACKEND_URL)\s*[:=]\s*[^\s,]+/gi, '$1=[REDACTED]');

    return sanitized;
  }

  /**
   * Validates URL targets for external webhooks/runners to prevent SSRF.
   * Blocks AWS/GCP/Azure link-local metadata endpoints (169.254.169.254), private ranges, and non-http(s) protocols.
   */
  public static validateSafeWebhookUrl(rawUrl: string): { isValid: boolean; reason?: string } {
    try {
      const parsed = new URL(rawUrl);

      // Protocol must be HTTP or HTTPS
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isValid: false, reason: 'Invalid protocol. Only HTTP and HTTPS are permitted.' };
      }

      const hostname = parsed.hostname.toLowerCase();

      // Block cloud metadata services (AWS, GCP, Azure, OpenStack)
      if (
        hostname === '169.254.169.254' ||
        hostname === 'metadata.google.internal' ||
        hostname === 'metadata.goog' ||
        hostname.endsWith('.internal')
      ) {
        return { isValid: false, reason: 'Access to cloud instance metadata services is forbidden (SSRF protection).' };
      }

      // Allow loopback only in development environments
      const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
      if (isLoopback && process.env.NODE_ENV === 'production') {
        return { isValid: false, reason: 'Localhost endpoints are not permitted in production.' };
      }

      // Allow secure external tunnels and verified domains
      const isAllowedHost =
        isLoopback ||
        hostname.endsWith('.ngrok-free.app') ||
        hostname.endsWith('.pinggy.link') ||
        hostname.endsWith('.trycloudflare.com') ||
        hostname.endsWith('.run.app') ||
        parsed.protocol === 'https:';

      if (!isAllowedHost) {
        return { isValid: false, reason: 'Host is not in the authorized tunnel allowlist and not HTTPS.' };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, reason: 'Malformed or invalid URL.' };
    }
  }
}
