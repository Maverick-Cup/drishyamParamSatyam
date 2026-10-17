import { NextRequest, NextResponse } from 'next/server';
import { syncLabsService } from '@/services/SyncLabsService';
import { AgentGuardrails } from '@/services/AgentGuardrails';
import { INDIC_LANGUAGES } from '@/config/indicLanguages';

/**
 * POST /api/indic/tts
 * Generates natural Indic language speech audio for real-time lip-sync and playback.
 * 1. Checks text length and security guardrails.
 * 2. If an Indic TTS provider / Sync.so voice is available, synthesizes authentic audio.
 * 3. Returns the audioUrl or instructions for high-fidelity client-side Web Speech synthesis.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = (body.text || '').trim();
    const languageCode = (body.language || 'hi').trim().toLowerCase();
    const voiceId = body.voiceId || process.env.DEFAULT_SYNC_VOICE_ID;

    if (!text) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: 'Text length exceeds maximum allowed limit of 500 characters' },
        { status: 400 }
      );
    }

    const guardrailCheck = AgentGuardrails.validateInput(text);
    if (!guardrailCheck.isSafe) {
      return NextResponse.json(
        { error: guardrailCheck.rejectionReason, threatType: guardrailCheck.threatType },
        { status: 400 }
      );
    }

    const langConfig =
      INDIC_LANGUAGES.find((l) => l.code === languageCode) || INDIC_LANGUAGES[0];

    // Check if cloud audio synthesis via Sync.so is configured
    if (syncLabsService.isConfigured() && voiceId) {
      try {
        const audioUrl = await syncLabsService.synthesizeSpeech(voiceId, text);
        if (audioUrl) {
          return NextResponse.json({
            success: true,
            mode: 'cloned_voice',
            audioUrl,
            language: langConfig.code,
            speechSynthesisTag: langConfig.speechSynthesisTag,
          });
        }
      } catch (err: any) {
        console.warn('Indic SyncLabs synthesis fallback:', err.message);
      }
    }

    // High fidelity browser speech fallback with BCP-47 tag
    return NextResponse.json({
      success: true,
      mode: 'BROWSER_SPEECH',
      audioUrl: null,
      text,
      language: langConfig.code,
      languageName: langConfig.name,
      speechSynthesisTag: langConfig.speechSynthesisTag,
      message: `Speech synthesis ready via ${langConfig.name} (${langConfig.speechSynthesisTag}) engine.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Indic speech synthesis failed' },
      { status: 500 }
    );
  }
}
