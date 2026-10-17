import { NextResponse } from 'next/server';
import { GmailInvitationMailer } from '@/services/GmailInvitationMailer';

/**
 * GET /api/admin/integrations/gmail/status
 * Diagnostic endpoint for checking Gmail API configuration, OAuth status, and the
 * 7-day token expiration risk under Google's External Testing consent policy.
 */

export async function GET() {
  const mailer = new GmailInvitationMailer();
  const isConfigured = mailer.isConfigured();

  const clientId = process.env.GMAIL_OAUTH_CLIENT_ID || '';
  const senderEmail = process.env.GMAIL_SENDER_EMAIL || 'paramsathya.app@gmail.com';

  const responsePayload: Record<string, any> = {
    feature: 'PARAMSATHYA-GMAIL-001',
    timestamp: new Date().toISOString(),
    isConfigured,
    senderEmail,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    oauthMode: 'EXTERNAL_TESTING',
    risks: [
      {
        id: 'OAUTH_REFRESH_TOKEN_7_DAY_RISK',
        severity: 'HIGH_IF_UNMONITORED',
        description:
          "Google OAuth refresh tokens expire after 7 calendar days when the OAuth consent screen is set to 'External' and 'Testing'. For production hackathon stability, re-consent before final presentation or publish consent screen to Internal / Production.",
      },
    ],
  };

  if (!isConfigured) {
    return NextResponse.json({
      ...responsePayload,
      status: 'UNCONFIGURED',
      message: 'Gmail API environment variables are not set. MockInvitationMailer active.',
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(process.env.GMAIL_OAUTH_CLIENT_SECRET),
      hasRefreshToken: Boolean(process.env.GMAIL_SENDER_REFRESH_TOKEN),
    });
  }

  // Probe token endpoint
  const tokenCheck = await mailer.getAccessToken();
  if (!tokenCheck.token) {
    return NextResponse.json(
      {
        ...responsePayload,
        status: 'TOKEN_EXPIRED_OR_INVALID',
        error: tokenCheck.error,
        message: 'Unable to refresh OAuth token. Run scripts/gmail/authorize-sender.ts to generate a new refresh token.',
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ...responsePayload,
    status: 'HEALTHY',
    message: 'Gmail sender connection is valid and operational.',
  });
}
