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
    const voiceId = body.voiceId || process.env.DEFAULT_SYNC_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Rachel or custom clone

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
    if (!/^[a-zA-Z0-9_\-]{8,64}$/.test(voiceId)) {
      return NextResponse.json(
        { error: 'Invalid voiceId format. Must be alphanumeric.', threatType: 'PARAMETER_TAMPERING' },
        { status: 400 }
      );
    }

    if (!syncLabsService.isConfigured()) {
      return NextResponse.json({
        success: false,
        fallback: 'BROWSER_SPEECH',
        message: 'Sync.so API key not configured. Using browser speech synthesis fallback.',
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
