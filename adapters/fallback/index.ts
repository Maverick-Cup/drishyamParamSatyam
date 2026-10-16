/**
 * Fallback Adapters for Voice and Avatar Rendering
 * Provides clean degradation when advanced GPU or external speech pipelines are disabled or unavailable.
 */

import { VoiceRenderer, AvatarRenderer } from '../../domain/repositories';

export class NeutralVoiceFallbackAdapter implements VoiceRenderer {
  readonly providerName = 'NEUTRAL_BROWSER_OR_FALLBACK';

  async renderVoice(text: string): Promise<{ audioWavBuffer: ArrayBuffer; durationSeconds: number }> {
    // In local fallback mode, generate an empty/dummy ArrayBuffer and return approximate duration
    const words = text.split(/\s+/).length;
    const durationSeconds = Math.max(1, Math.min(15, words * 0.35));
    return {
      audioWavBuffer: new ArrayBuffer(0),
      durationSeconds,
    };
  }
}

export class StaticPortraitFallbackAdapter implements AvatarRenderer {
  readonly providerName = 'STATIC_PORTRAIT_FALLBACK';

  async renderLipSync(
    _audioWavBuffer: ArrayBuffer,
    portraitImageBuffer: ArrayBuffer
  ): Promise<{ videoMp4Buffer: ArrayBuffer }> {
    // Returns the static portrait image buffer directly as the visual fallback
    return {
      videoMp4Buffer: portraitImageBuffer,
    };
  }
}
