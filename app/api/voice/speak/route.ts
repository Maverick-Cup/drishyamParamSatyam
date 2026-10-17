import { NextRequest, NextResponse } from 'next/server';
import { syncLabsService } from '@/services/SyncLabsService';

/**
 * /api/voice/speak: Synthesizes speech in the designated cloned voice
 * Returns the hosted audio URL ready for streaming and driving real-time Web Audio RMS visemes.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = (body.text || '').trim();
    const requestedVoiceId = (body.voiceId || '').trim();
    const envVoiceId = (process.env.SYNC_VOICE_ID || process.env.DEFAULT_SYNC_VOICE_ID || '').trim();
    const voiceId =
      requestedVoiceId && requestedVoiceId !== 'sync-rajesh-authentic-v2'
        ? requestedVoiceId
        : envVoiceId || 'EXAVITQu4vr4xnSDxMaL';

    if (!text) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
    }

    // Hardened Resource Guard: Limit speech generation length to prevent wallet draining
    if (text.length > 300) {
      return NextResponse.json(
        {
          error: 'Text length exceeds maximum allowed limit of 300 characters for voice synthesis.',
          threatType: 'WALLET_DRAIN_PREVENTION',
        },
        { status: 400 }
      );
    }

    // Alphanumeric format check on voiceId
    if (!/^[a-zA-Z0-9_\-]{6,64}$/.test(voiceId)) {
      return NextResponse.json(
        { error: 'Invalid voiceId format. Must be alphanumeric.', threatType: 'PARAMETER_TAMPERING' },
        { status: 400 }
      );
    }

    const ttsEnabled = process.env.SYNC_TTS_ENABLED === 'true';
    if (!syncLabsService.isConfigured() || !ttsEnabled) {
      return NextResponse.json({
        success: false,
        fallback: 'BROWSER_SPEECH',
        message: 'Live cloud TTS is disabled or unconfigured; using attached companion voice fallback.',
      });
    }

    const audioUrl = await syncLabsService.synthesizeSpeech(voiceId, text);

    if (audioUrl) {
      return NextResponse.json({
        success: true,
        mode: 'cloned_voice',
        audioUrl,
        voiceId,
      });
    } else {
      return NextResponse.json({
        success: false,
        fallback: 'BROWSER_SPEECH',
        message: 'TTS synthesis did not return an audio URL; fallback to browser speech.',
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, fallback: 'BROWSER_SPEECH', error: err.message },
      { status: 500 }
    );
  }
}
