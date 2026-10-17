import { createServer } from 'http';
import { parse } from 'url';

/**
 * Interactive CLI helper to perform one-time OAuth consent for Gmail sending.
 * Run locally via: npx ts-node scripts/gmail/authorize-sender.ts
 */

const CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET;
const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ ERROR: GMAIL_OAUTH_CLIENT_ID and GMAIL_OAUTH_CLIENT_SECRET environment variables must be set.');
  console.error('Usage: GMAIL_OAUTH_CLIENT_ID=xxx GMAIL_OAUTH_CLIENT_SECRET=yyy npx ts-node scripts/gmail/authorize-sender.ts\n');
  process.exit(1);
}

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  }).toString();

console.log('\n======================================================');
console.log('PARAM SATHYA — GMAIL SENDER OAUTH AUTHORIZATION');
console.log('======================================================\n');
console.log('1. Open this authorization URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Sign in with the dedicated ParamSathya sender Gmail account.');
console.log(`3. Waiting for authorization callback on localhost:${PORT}...\n`);

const server = createServer(async (req, res) => {
  try {
    const parsed = parse(req.url || '', true);
    if (parsed.pathname === '/oauth2callback') {
      const code = parsed.query.code as string;
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Failed: No code received</h1>');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Success!</h1><p>You can close this window now. Return to the terminal.</p>');

      console.log('Authorization code received! Exchanging for refresh token...');

      const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResp.json();

      if (tokenData.refresh_token) {
        console.log('\n✅ REFRESH TOKEN GENERATED SUCCESSFULLY!\n');
        console.log('======================================================');
        console.log(`GMAIL_SENDER_REFRESH_TOKEN=${tokenData.refresh_token}`);
        console.log('======================================================\n');
        console.log('Next steps:');
        console.log('1. Save this refresh token in Secret Manager or your Cloud Run environment.');
        console.log('2. Note: Under External Testing OAuth policy, this refresh token expires in 7 days.');
      } else {
        console.error('Failed to get refresh token:', tokenData);
      }

      server.close();
      process.exit(0);
    }
  } catch (err) {
    console.error('Callback error:', err);
  }
});

server.listen(PORT);
