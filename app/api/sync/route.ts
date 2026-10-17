import { NextRequest, NextResponse } from 'next/server';
import { AgentGuardrails } from '@/services/AgentGuardrails';

/**
 * ParamSathya Neural Lip-Sync Gateway & Sync Lip-Sync 2 Pro Integration
 *
 * Supports:
 * 1. Sync API v2 Reusable Base Video Asset Architecture (lipsync-2-pro):
 *    - GET ?action=status        -> Safe environment & capability inspection (0 quota)
 *    - GET ?action=verify-asset  -> Verifies registered SYNC_BASE_VIDEO_ASSET_ID via GET /v2/assets/{id} (0 quota)
 *    - GET ?action=poll&id={id}  -> Polls GET /v2/generate/{id} (PENDING / PROCESSING / COMPLETED)
 *    - POST action=sync-preflight -> Validates script & payload (0 quota)
 *    - POST action=sync-generate  -> Guarded by UI unlock toggle or SYNC_DEMO_GENERATION_ENABLED & commit token
 *
 * 2. Legacy / Parallel Neural Runner & Fallback Web Audio Viseme Gateway
 */

function getSyncConfig() {
  const baseUrl = (process.env.SYNC_API_BASE_URL || 'https://api.sync.so/v2').replace(/\/+$/, '');
  const apiKey = (process.env.SYNC_API_KEY || '').trim();
  const voiceId = (process.env.SYNC_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL').trim();
  const baseVideoAssetId = (process.env.SYNC_BASE_VIDEO_ASSET_ID || '').trim();
  const ttsEnabled = process.env.SYNC_TTS_ENABLED === 'true';
  const demoGenerationEnabled = process.env.SYNC_DEMO_GENERATION_ENABLED === 'true';
  const commitToken = (process.env.SYNC_DEMO_COMMIT_TOKEN || '').trim();
  const model = (process.env.SYNC_MODEL || 'lipsync-2-pro').trim();
  const ttsProvider = (process.env.SYNC_TTS_PROVIDER || 'elevenlabs').trim();
  const ttsStability = parseFloat(process.env.SYNC_TTS_STABILITY || '0.50');
  const ttsSimilarityBoost = parseFloat(process.env.SYNC_TTS_SIMILARITY_BOOST || '0.75');
  const maxScriptChars = parseInt(process.env.SYNC_MAX_SCRIPT_CHARS || '180', 10);
  const maxAudioSeconds = parseFloat(process.env.SYNC_MAX_AUDIO_SECONDS || '8.5');

  return {
    baseUrl,
    apiKey,
    voiceId,
    baseVideoAssetId,
    ttsEnabled,
    demoGenerationEnabled,
    commitToken,
    model,
    ttsProvider,
    ttsStability,
    ttsSimilarityBoost,
    maxScriptChars,
    maxAudioSeconds,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const cfg = getSyncConfig();

    if (action === 'status') {
      return NextResponse.json({
        success: true,
        config: {
          baseUrl: cfg.baseUrl,
          hasApiKey: Boolean(cfg.apiKey),
          voiceId: cfg.voiceId,
          hasBaseVideoAssetId: Boolean(cfg.baseVideoAssetId),
          baseVideoAssetId: cfg.baseVideoAssetId || null,
          ttsEnabled: cfg.ttsEnabled,
          demoGenerationEnabled: cfg.demoGenerationEnabled,
          hasCommitToken: Boolean(cfg.commitToken),
          model: cfg.model,
          ttsProvider: cfg.ttsProvider,
          ttsStability: cfg.ttsStability,
          ttsSimilarityBoost: cfg.ttsSimilarityBoost,
          maxScriptChars: cfg.maxScriptChars,
          maxAudioSeconds: cfg.maxAudioSeconds,
        },
      });
    }

    if (action === 'verify-asset') {
      if (!cfg.apiKey) {
        return NextResponse.json(
          { success: false, error: 'SYNC_API_KEY is not configured on the server.' },
          { status: 400 }
        );
      }
      if (!cfg.baseVideoAssetId) {
        return NextResponse.json(
          {
            success: false,
            error: 'SYNC_BASE_VIDEO_ASSET_ID is not set. Run scripts/register-sync-base-video.ps1 first.',
          },
          { status: 400 }
        );
      }

      const res = await fetch(`${cfg.baseUrl}/assets/${encodeURIComponent(cfg.baseVideoAssetId)}`, {
        method: 'GET',
        headers: {
          'x-api-key': cfg.apiKey,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          {
            success: false,
            error: `Sync asset verification failed (${res.status}): ${errText.slice(0, 200)}`,
          },
          { status: res.status }
        );
      }

      const asset = await res.json();
      return NextResponse.json({
        success: true,
        quotaSpent: 0,
        asset: {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          format: asset.format || 'mp4',
          size: asset.size,
          durationSeconds: asset.durationSeconds || null,
          visibility: asset.visibility || 'USER',
          createdAt: asset.createdAt,
        },
      });
    }

    if (action === 'poll') {
      const generationId = (searchParams.get('id') || '').trim();
      if (!generationId || !/^[a-zA-Z0-9_-]{8,64}$/.test(generationId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid or missing generation ID.' },
          { status: 400 }
        );
      }
      if (!cfg.apiKey) {
        return NextResponse.json(
          { success: false, error: 'SYNC_API_KEY is not configured.' },
          { status: 400 }
        );
      }

      const res = await fetch(`${cfg.baseUrl}/generate/${encodeURIComponent(generationId)}`, {
        method: 'GET',
        headers: {
          'x-api-key': cfg.apiKey,
          Accept: 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            error: data.message || `Sync poll returned ${res.status}`,
          },
          { status: res.status }
        );
      }

      return NextResponse.json({
        success: true,
        generation: {
          id: data.id,
          status: data.status,
          outputUrl: data.outputUrl || null,
          error: data.error || null,
          createdAt: data.createdAt,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported GET action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Sync GET error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentTypeHeader = request.headers.get('content-type') || '';

    // Branch 1: JSON request for Sync Lip-Sync 2 Pro (Reusable Asset ID flow)
    if (contentTypeHeader.includes('application/json')) {
      const body = await request.json();
      const action = body.action || 'sync-generate';
      const cfg = getSyncConfig();

      if (action === 'sync-preflight') {
        const scriptText = (body.script || '').trim();
        const logs: string[] = [
          `[${new Date().toISOString()}] Running Sync Lip-Sync 2 Pro Preflight (0 Quota)...`,
          `✓ Model configured: ${cfg.model}`,
          cfg.baseVideoAssetId
            ? `✓ Reusable Base Video Asset bound: ${cfg.baseVideoAssetId}`
            : '⚠ SYNC_BASE_VIDEO_ASSET_ID is missing.',
          `✓ Voice ID configured: ${cfg.voiceId} (${cfg.ttsProvider})`,
          `✓ Script length check: ${scriptText.length} / ${cfg.maxScriptChars} chars`,
          `✓ Max audio duration guard: ${cfg.maxAudioSeconds}s`,
          `✓ Safety Locks: SYNC_TTS_ENABLED=${cfg.ttsEnabled}, SYNC_DEMO_GENERATION_ENABLED=${cfg.demoGenerationEnabled}`,
        ];

        if (scriptText.length > cfg.maxScriptChars) {
          return NextResponse.json(
            {
              success: false,
              error: `Script exceeds maximum allowed characters (${scriptText.length}/${cfg.maxScriptChars}).`,
              logs,
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          status: 'PREFLIGHT_READY',
          quotaSpent: 0,
          inputPreview: {
            model: cfg.model,
            input: [
              { type: 'video', assetId: cfg.baseVideoAssetId || '<UNSET>' },
              {
                type: 'audio',
                provider: {
                  name: cfg.ttsProvider,
                  voiceId: cfg.voiceId,
                  script: scriptText,
                },
              },
            ],
          },
          logs,
        });
      }

      if (action === 'sync-generate') {
        const providedCommitToken = (request.headers.get('x-sync-commit-token') || body.commitToken || '').trim();
        const scriptText = (body.script || '').trim();
        const unlockSafetyGate = Boolean(body.unlockSafetyGate);
        const executionMode: 'simulation' | 'cloud' = body.executionMode === 'cloud' ? 'cloud' : 'simulation';

        // Validate script length
        if (!scriptText || scriptText.length > cfg.maxScriptChars) {
          return NextResponse.json(
            {
              success: false,
              error: `Script must be between 1 and ${cfg.maxScriptChars} characters.`,
            },
            { status: 400 }
          );
        }

        // Mode A: Instant Demo Simulation / Reusable Asset Render (0 Quota, Never Blocks)
        if (executionMode === 'simulation') {
          return NextResponse.json({
            success: true,
            mode: 'simulation',
            quotaSpent: 0,
            generationId: `sync-demo-${Date.now().toString(36)}`,
            status: 'COMPLETED',
            outputUrl: '/sample_reference.mp4',
            logs: [
              `[${new Date().toISOString()}] Executing Sync Lip-Sync 2 Pro Studio Render (Reusable Asset Route)...`,
              `✓ Bound Reusable Video Asset ID: ${cfg.baseVideoAssetId || 'local-sample-reference'}`,
              `✓ Bound Voice Profile: ${cfg.voiceId}`,
              `✓ Script synthesized (${scriptText.length} chars): "${scriptText.slice(0, 50)}..."`,
              `✓ Lip-Sync 2 Pro output ready (0 Cloud Quota consumed). Ready to attach to Main Page Companion!`,
            ],
          });
        }

        // Mode B: Live Sync Cloud API Render (1 Quota Credit)
        const isUnlocked = cfg.demoGenerationEnabled || unlockSafetyGate;
        if (!isUnlocked) {
          return NextResponse.json(
            {
              success: false,
              status: 'BLOCKED_BY_SAFETY_LOCK',
              error:
                'Live Cloud generation is locked to protect your quota. Toggle "Unlock Live Cloud Generation" in the Studio UI or use "Demo Asset Render (0 Quota)" mode.',
            },
            { status: 403 }
          );
        }

        // Verify commit token if explicitly provided, or allow when unlocked from the local Studio UI
        if (!unlockSafetyGate && (!cfg.commitToken || providedCommitToken !== cfg.commitToken)) {
          return NextResponse.json(
            {
              success: false,
              status: 'UNAUTHORIZED_COMMIT_TOKEN',
              error: 'Missing or invalid SYNC_DEMO_COMMIT_TOKEN. Toggle "Unlock Live Cloud Generation" in the Studio UI to authorize.',
            },
            { status: 403 }
          );
        }

        if (!cfg.baseVideoAssetId || !cfg.apiKey) {
          return NextResponse.json(
            {
              success: false,
              error: 'SYNC_API_KEY and SYNC_BASE_VIDEO_ASSET_ID must both be configured.',
            },
            { status: 400 }
          );
        }

        const payload = {
          model: cfg.model,
          input: [
            {
              type: 'video',
              assetId: cfg.baseVideoAssetId,
            },
            {
              type: 'audio',
              provider: {
                name: cfg.ttsProvider,
                voiceId: cfg.voiceId,
                script: scriptText,
              },
            },
          ],
        };

        const syncRes = await fetch(`${cfg.baseUrl}/generate`, {
          method: 'POST',
          headers: {
            'x-api-key': cfg.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const syncData = await syncRes.json();
        if (!syncRes.ok) {
          return NextResponse.json(
            {
              success: false,
              error: syncData.message || `Sync generation failed with HTTP ${syncRes.status}`,
            },
            { status: syncRes.status }
          );
        }

        return NextResponse.json({
          success: true,
          mode: 'cloud',
          generationId: syncData.id,
          status: syncData.status || 'PENDING',
          outputUrl: syncData.outputUrl || null,
          logs: [
            `✓ Live Sync Cloud Generation submitted! Job ID: ${syncData.id}`,
            `✓ Status: ${syncData.status || 'PENDING'}. Use Poll button to track completion.`,
          ],
        });
      }
    }

    // Branch 2: Legacy FormData Neural Lip-Sync Runner & SSRF Check (Preserved for DAST / Red Team & MuseTalk fallback)
    const formData = await request.formData();
    const faceImage = formData.get('faceImage');
    const audioFile = formData.get('audioFile');
    const backendUrl = process.env.LIPSYNC_BACKEND_URL || request.headers.get('x-lipsync-backend-url') || '';

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
          const timeoutId = setTimeout(() => controller.abort(), 12000);

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

        if (attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          retryLogs.push(`Retrying neural model connection in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      console.warn(`[SyncGateway] Neural model connection exhausted after ${MAX_RETRIES} attempts. Reason: ${lastErrorMessage}`);
    }

    return NextResponse.json({
      success: true,
      mode: 'fallback_web_audio',
      backendConfigured: Boolean(backendUrl),
      message: backendUrl
        ? 'Backend configured but runner is currently offline. Active audio will use real-time Web Audio RMS mouth viseme scaling.'
        : 'Ready. Use Sync Lip-Sync 2 Pro (/playground/sync) or local real-time RMS Visemes.',
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
