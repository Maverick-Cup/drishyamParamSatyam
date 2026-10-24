/**
 * Canonical Domain Contracts for Google Flow Digital Clone Integration
 * Pure TypeScript interfaces and deterministic URL parsers with ZERO third-party or browser SDK dependencies.
 */

export interface ParsedFlowUrl {
  isValid: boolean;
  projectId?: string;
  characterId?: string;
  error?: string;
}

export interface GoogleFlowCharacterBinding {
  projectId: string;
  characterId: string;
  flowUrl: string;
  characterName: string;
  relationship: string;
  characterAssetUrl: string;
  videoLoopUrl?: string;
  voiceProfileId: string;
  voiceName: string;
  generationMode: 'INTERACTIVE_VISIMES' | 'NEURAL_VIDEO_LOOP';
  generationStatus: 'DRAFT' | 'GENERATING' | 'READY' | 'FAILED';
  boundAt: string;
  consentVersion: string;
}

export interface DigitalCloneGenerationRequest {
  profileId: string;
  flowUrl: string;
  characterName: string;
  relationship: string;
  voiceProfileId?: string;
  portraitBase64OrUrl?: string;
  videoBase64OrUrl?: string;
  audioSampleUrl?: string;
  memoryPassage?: string;
  generationMode?: 'INTERACTIVE_VISIMES' | 'NEURAL_VIDEO_LOOP';
  consented: boolean;
}

export interface DigitalCloneGenerationResult {
  success: boolean;
  binding?: GoogleFlowCharacterBinding;
  logs: string[];
  error?: string;
}

export const DEFAULT_FLOW_CHARACTER_URL =
  'https://flow.google.com/project/9c5b28a6-8399-4c9a-9dd8-fb3b15ff96e0/character/e58923b8-3ce4-4a2c-b390-35739ab01715';

export const DEFAULT_TRAINED_MALE_VOICE = {
  id: '09ac157f-8b37-41c8-97a2-22a83c41568d',
  name: 'Harshit_voice (Trained Male Voice)',
};

const FLOW_URL_REGEX =
  /^https?:\/\/flow\.google\.com\/project\/([a-f0-9-]{36})\/character\/([a-f0-9-]{36})/i;

/**
 * Deterministically parses and validates a Google Flow character URL.
 * Extracts standard UUIDv4 project and character identifiers.
 */
export function parseGoogleFlowUrl(rawUrl: string): ParsedFlowUrl {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL must not be empty' };
  }
  const trimmed = rawUrl.trim();
  const match = trimmed.match(FLOW_URL_REGEX);
  if (!match) {
    return {
      isValid: false,
      error:
        'Invalid Google Flow URL format. Expected: https://flow.google.com/project/{projectId}/character/{characterId}',
    };
  }
  return {
    isValid: true,
    projectId: match[1],
    characterId: match[2],
  };
}
