/**
 * ParamSathya Capability & Feature Flag Configuration
 *
 * NOTE ON CONTRACTUAL CONSTRAINTS:
 * Google's current service terms state that custom Gemini Live voices and custom avatars
 * are restricted to approved customers and cannot be integrated into an end-user-facing application.
 * Therefore, GOOGLE_CUSTOM_LIVE_AVATAR_ENABLED and GOOGLE_CUSTOM_LIVE_VOICE_ENABLED are hardcoded to false.
 */

export interface SystemCapabilities {
  // Guide Mode (Gemini 3.8 Live neutral assistant)
  guideLiveEnabled: boolean;
  guidePresetAvatarEnabled: boolean;

  // Presence Mode (Grounded Memory Representation)
  presenceMuseTalkEnabled: boolean;
  presenceReplicatedTtsEnabled: boolean;
  presenceVoiceStudioEnabled: boolean;

  // Contractual Google Live Restrictions (Hard locked)
  googleCustomLiveAvatarEnabled: false;
  googleCustomLiveVoiceEnabled: false;
}

export const CAPABILITIES: SystemCapabilities = {
  // Live Guide capabilities
  guideLiveEnabled: process.env.NEXT_PUBLIC_GUIDE_LIVE_ENABLED === 'true',
  guidePresetAvatarEnabled: process.env.NEXT_PUBLIC_GUIDE_PRESET_AVATAR_ENABLED === 'true',

  // Custom Presence capabilities
  presenceMuseTalkEnabled: process.env.NEXT_PUBLIC_PRESENCE_MUSETALK_ENABLED === 'true',
  presenceReplicatedTtsEnabled: process.env.NEXT_PUBLIC_PRESENCE_REPLICATED_TTS_ENABLED === 'true',
  presenceVoiceStudioEnabled: process.env.NEXT_PUBLIC_PRESENCE_VOICESTUDIO_ENABLED === 'true',

  // Strictly disabled by contractual and policy terms
  googleCustomLiveAvatarEnabled: false,
  googleCustomLiveVoiceEnabled: false,
};

export function getCapabilityReport(): Record<string, { enabled: boolean; note: string }> {
  return {
    GUIDE_LIVE_ENABLED: {
      enabled: CAPABILITIES.guideLiveEnabled,
      note: 'Gemini 3.8 Live neutral companion with barge-in support',
    },
    GUIDE_PRESET_AVATAR_ENABLED: {
      enabled: CAPABILITIES.guidePresetAvatarEnabled,
      note: 'Preset Google 24fps Live Avatar for the neutral Guide (account access dependent)',
    },
    PRESENCE_MUSETALK_ENABLED: {
      enabled: CAPABILITIES.presenceMuseTalkEnabled,
      note: 'MuseTalk 1.5 L4 GPU pipeline for approved memory portraits',
    },
    PRESENCE_REPLICATED_TTS_ENABLED: {
      enabled: CAPABILITIES.presenceReplicatedTtsEnabled,
      note: 'Gemini 3.8 Flash TTS replicated voice (requires consenting adult recording)',
    },
    PRESENCE_VOICESTUDIO_ENABLED: {
      enabled: CAPABILITIES.presenceVoiceStudioEnabled,
      note: 'VoiceStudio fallback voice adapter',
    },
    GOOGLE_CUSTOM_LIVE_AVATAR_ENABLED: {
      enabled: false,
      note: 'LOCKED FALSE: Contractually restricted from end-user applications',
    },
    GOOGLE_CUSTOM_LIVE_VOICE_ENABLED: {
      enabled: false,
      note: 'LOCKED FALSE: Contractually restricted from end-user applications',
    },
  };
}
