import type {
  InvitationMailer,
  InvitationMailRequest,
  InvitationMailResult,
} from '../domain/invitations';




/**
 * HTML escaper to strictly prevent injection vulnerabilities in email bodies
 */
export function escapeHtml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds RFC 2822 / MIME compliant multipart or HTML message string and encodes it in URL-safe base64.
 */
export function buildMimeMessage(options: {
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}): string {
  const fromHeader = options.fromName
    ? `"${options.fromName.replace(/"/g, '')}" <${options.fromEmail}>`
    : options.fromEmail;

  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  const rawMime = [
    `From: ${fromHeader}`,
    `To: <${options.toEmail}>`,
    `Subject: ${options.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    options.textBody,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    options.htmlBody,
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  // Convert to base64url (RFC 4648 § 5)
  return Buffer.from(rawMime, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Builds standard ParamSathya invitation email templates (HTML and plain text).
 * Explicitly excludes private memories, transcripts, audio, or internal Firestore identifiers.
 */
export function renderInvitationEmail(req: InvitationMailRequest): {
  subject: string;
  htmlBody: string;
  textBody: string;
} {
  const safeInviter = escapeHtml(req.inviterName || 'A family member');
  const safePerson = escapeHtml(req.representedPersonName || 'our loved one');
  const safeRole = req.role === 'CONTRIBUTOR' ? 'Contributor (Add memories & voice)' : 'Viewer (Listen & view memories)';
  const safeUrl = escapeHtml(req.inviteUrl);
  const safeExpires = escapeHtml(req.expiresAtFormatted);

  const subject = `Invitation to join ${req.representedPersonName || 'ParamSathya'}'s Connected Circle`;

  const textBody = [
    `ParamSathya — Private Remembrance Vault`,
    ``,
    `${req.inviterName || 'A family member'} has invited you to join the private memory circle for ${req.representedPersonName || 'our loved one'} as a ${req.role}.`,
    ``,
    `ParamSathya preserves authentic voice recordings and memories in a quiet, private space.`,
    ``,
    `To accept this invitation, open this link in your browser:`,
    req.inviteUrl,
    ``,
    `This invitation link expires on ${req.expiresAtFormatted}.`,
    `If you did not expect this invitation, you can safely ignore this message.`,
  ].join('\n');

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9;">
  <div style="max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
    <div style="border-bottom: 1px solid #1f2937; padding-bottom: 20px; margin-bottom: 24px;">
      <span style="font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #06b6d4;">ParamSathya Vault</span>
      <h1 style="font-size: 22px; margin: 8px 0 0; color: #f8fafc; font-weight: 600;">Private Remembrance Invitation</h1>
    </div>

    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 16px;">
      <strong style="color: #f8fafc;">${safeInviter}</strong> has invited you to join the private family remembrance circle for <strong style="color: #f8fafc;">${safePerson}</strong>.
    </p>

    <div style="background: #1e293b; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #334155;">
      <p style="margin: 0 0 6px; font-size: 13px; color: #94a3b8;">Granted Circle Role:</p>
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #38bdf8;">${safeRole}</p>
    </div>

    <p style="font-size: 14px; line-height: 1.5; color: #94a3b8; margin: 0 0 24px;">
      You will be able to listen to authentic preserved voice recordings and collaborate on cherished memories.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);">
        Accept Circle Invitation
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 24px 0 0; border-top: 1px solid #1f2937; padding-top: 20px;">
      This link is unique to you and expires on <strong style="color: #94a3b8;">${safeExpires}</strong>.<br />
      If button doesn't work, copy and paste this URL into your browser:<br />
      <span style="color: #06b6d4; word-break: break-all;">${safeUrl}</span>
    </p>
  </div>
</body>
</html>`;

  return { subject, htmlBody, textBody };
}

export interface GmailMailerConfig {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  senderEmail?: string;
}

/**
 * GmailInvitationMailer
 * Sends invitation messages using Google Gmail REST API users.messages.send.
 * Requires ONLY the sensitive scope: https://www.googleapis.com/auth/gmail.send
 * Exchanges refresh token using native fetch, requiring no heavy external SDKs.
 */
export class GmailInvitationMailer implements InvitationMailer {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private senderEmail: string;

  constructor(config?: GmailMailerConfig) {
    this.clientId = config?.clientId || process.env.GMAIL_OAUTH_CLIENT_ID || '';
    this.clientSecret = config?.clientSecret || process.env.GMAIL_OAUTH_CLIENT_SECRET || '';
    this.refreshToken = config?.refreshToken || process.env.GMAIL_SENDER_REFRESH_TOKEN || '';
    this.senderEmail = config?.senderEmail || process.env.GMAIL_SENDER_EMAIL || 'me';
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret && this.refreshToken);
  }

  /**
   * Refreshes an OAuth 2.0 access token via Google token endpoint.
   */
  async getAccessToken(): Promise<{ token: string; error?: string }> {
    if (!this.isConfigured()) {
      return { token: '', error: 'GMAIL_CREDENTIALS_MISSING' };
    }

    try {
      const resp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        return {
          token: '',
          error: errJson.error_description || errJson.error || `OAUTH_HTTP_${resp.status}`,
        };
      }

      const data = await resp.json();
      return { token: data.access_token };
    } catch (err: any) {
      return { token: '', error: err.message || 'TOKEN_REFRESH_NETWORK_ERROR' };
    }
  }

  async sendInvitation(req: InvitationMailRequest): Promise<InvitationMailResult> {
    const { token, error: tokenError } = await this.getAccessToken();
    if (!token) {
      return {
        success: false,
        errorCode: tokenError || 'AUTH_TOKEN_FAILED',
        errorMessage: 'Failed to obtain Gmail API access token',
      };
    }

    const { subject, htmlBody, textBody } = renderInvitationEmail(req);
    const rawEncoded = buildMimeMessage({
      fromEmail: this.senderEmail,
      fromName: 'ParamSathya Memory Vault',
      toEmail: req.toEmail,
      subject,
      htmlBody,
      textBody,
    });

    try {
      const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: rawEncoded }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        const code = errData.error?.status || `GMAIL_HTTP_${resp.status}`;
        const message = errData.error?.message || 'Gmail API send failed';
        return {
          success: false,
          errorCode: code,
          errorMessage: message,
        };
      }

      const data = await resp.json();
      return {
        success: true,
        gmailMessageId: data.id,
      };
    } catch (err: any) {
      return {
        success: false,
        errorCode: 'GMAIL_NETWORK_ERROR',
        errorMessage: err.message || 'Network error calling Gmail API',
      };
    }
  }
}
