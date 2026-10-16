import { NextRequest, NextResponse } from 'next/server';

/**
 * ParamSathya Neural Lip-Sync Gateway
 * 
 * Supports:
 * - Path A: Local CPU Runner (Flask/FastAPI on http://localhost:5000/sync)
 * - Path B: Google Colab T4 GPU (ngrok / pinggy tunnel URL)
 * - Fallback: Web Audio API RMS viseme generator if runner is unreachable
 *
 * ZERO SECRETS: Reads LIPSYNC_BACKEND_URL from process.env or request headers without hardcoded keys.
 */

import { AgentGuardrails } from '@/services/AgentGuardrails';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const faceImage = formData.get('faceImage');
    const audioFile = formData.get('audioFile');
    const backendUrl = process.env.LIPSYNC_BACKEND_URL || request.headers.get('x-lipsync-backend-url') || '';

    // If external runner is specified, validate against SSRF before connecting
    if (backendUrl) {
      const urlCheck = AgentGuardrails.validateSafeWebhookUrl(backendUrl);
      if (!urlCheck.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: `Insecure or unauthorized runner destination blocked: ${urlCheck.reason}`,
            threatType: 'SSRF_BLOCKED',
          },
          { status: 400 }
        );
      }

      const targetUrl = backendUrl.endsWith('/') ? `${backendUrl}sync` : `${backendUrl}/sync`;
      const MAX_RETRIES = 3;
      const RETRY_BASE_DELAY_MS = 600;
      let lastErrorMessage = '';
      const retryLogs: string[] = [];

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const forwardData = new FormData();
          if (faceImage) forwardData.append('video', faceImage);
          if (audioFile) forwardData.append('audio', audioFile);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second connect/read timeout

          const response = await fetch(targetUrl, {
            method: 'POST',
            body: forwardData,
            signal: controller.signal,
            headers: {
              'User-Agent': 'ParamSathya-Gateway/1.0',
            },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const data = await response.json();
              return NextResponse.json({
                success: true,
                mode: 'neural',
                attempts: attempt,
                videoUrl: data.video_url || data.videoUrl || data.output_path,
                logs: [
                  ...retryLogs,
                  `✓ Neural lip-sync connected successfully (attempt ${attempt}/${MAX_RETRIES})!`,
                ],
              });
            } else if (contentType.includes('video/mp4')) {
              const blob = await response.blob();
              return new NextResponse(blob, {
                headers: {
                  'Content-Type': 'video/mp4',
                  'X-Sync-Attempts': attempt.toString(),
                },
              });
            }
          } else {
            lastErrorMessage = `Server returned status ${response.status}: ${response.statusText}`;
            retryLogs.push(`Attempt ${attempt}/${MAX_RETRIES} failed (${lastErrorMessage}).`);
          }
        } catch (fetchErr: any) {
          const isTimeout = fetchErr.name === 'AbortError';
          lastErrorMessage = isTimeout ? 'Network socket request timed out' : fetchErr.message;
          retryLogs.push(`Attempt ${attempt}/${MAX_RETRIES} network drop: ${lastErrorMessage}`);
        }

        // Apply exponential backoff delay before reattempting connection
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          retryLogs.push(`Retrying neural model connection in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      console.warn(`[SyncGateway] Neural model connection exhausted after ${MAX_RETRIES} attempts. Reason: ${lastErrorMessage}`);
    }

    // Default Fallback: Return status indicating runner is optional
    return NextResponse.json({
      success: true,
      mode: 'fallback_web_audio',
      backendConfigured: Boolean(backendUrl),
      message: backendUrl
        ? 'Backend configured but runner is currently offline. Active audio will use real-time Web Audio RMS mouth viseme scaling.'
        : 'Ready. Use Path A (Local CPU) or Path B (Colab GPU) by setting LIPSYNC_BACKEND_URL in .env.local, or enjoy zero-latency Web Audio visemes.',
      logs: [
        'Checked Lip-Sync Runner Gateway.',
        backendUrl ? `Configured endpoint: ${backendUrl}` : 'No external neural runner configured (using local real-time RMS Visemes).',
      ],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal gateway error' },
      { status: 500 }
    );
  }
}
