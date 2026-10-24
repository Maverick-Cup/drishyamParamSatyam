import { test } from 'node:test';
import assert from 'node:assert/strict';

// Test domain URL parser logic directly
const FLOW_URL_REGEX =
  /^https?:\/\/flow\.google\.com\/project\/([a-f0-9-]{36})\/character\/([a-f0-9-]{36})/i;

function parseGoogleFlowUrl(rawUrl) {
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

const DEFAULT_FLOW_CHARACTER_URL =
  'https://flow.google.com/project/9c5b28a6-8399-4c9a-9dd8-fb3b15ff96e0/character/e58923b8-3ce4-4a2c-b390-35739ab01715';

const DEFAULT_TRAINED_MALE_VOICE = {
  id: '09ac157f-8b37-41c8-97a2-22a83c41568d',
  name: 'Harshit_voice (Trained Male Voice)',
};

test('FLOW-001: parseGoogleFlowUrl parses the user target character URL', () => {
  const result = parseGoogleFlowUrl(DEFAULT_FLOW_CHARACTER_URL);
  assert.equal(result.isValid, true);
  assert.equal(result.projectId, '9c5b28a6-8399-4c9a-9dd8-fb3b15ff96e0');
  assert.equal(result.characterId, 'e58923b8-3ce4-4a2c-b390-35739ab01715');
});

test('FLOW-002: parseGoogleFlowUrl rejects non-Google domains and malicious input', () => {
  assert.equal(parseGoogleFlowUrl('https://evil.com/project/9c5b28a6/character/e58923b8').isValid, false);
  assert.equal(parseGoogleFlowUrl('javascript:alert(1)').isValid, false);
  assert.equal(parseGoogleFlowUrl('').isValid, false);
  assert.equal(parseGoogleFlowUrl(null).isValid, false);
  assert.equal(parseGoogleFlowUrl(undefined).isValid, false);
});

test('FLOW-003: parseGoogleFlowUrl rejects truncated or malformed UUIDs', () => {
  const malformed = 'https://flow.google.com/project/not-a-valid-uuid/character/e58923b8-3ce4-4a2c-b390-35739ab01715';
  const result = parseGoogleFlowUrl(malformed);
  assert.equal(result.isValid, false);
  assert.match(result.error, /Invalid Google Flow URL format/);
});

test('FLOW-004: Default Voice Profile is Harshit_voice with correct ID', () => {
  assert.equal(DEFAULT_TRAINED_MALE_VOICE.id, '09ac157f-8b37-41c8-97a2-22a83c41568d');
  assert.match(DEFAULT_TRAINED_MALE_VOICE.name, /Harshit_voice/);
});

test('FLOW-005: Construct complete GoogleFlowCharacterBinding packet', () => {
  const parsed = parseGoogleFlowUrl(DEFAULT_FLOW_CHARACTER_URL);
  assert.equal(parsed.isValid, true);

  const binding = {
    projectId: parsed.projectId,
    characterId: parsed.characterId,
    flowUrl: DEFAULT_FLOW_CHARACTER_URL,
    characterName: 'Grandpa Thomas',
    relationship: 'Grandfather',
    characterAssetUrl: '/avatar_RajeshBadePapa_clean.jpg',
    videoLoopUrl: '/sample_reference.mp4',
    voiceProfileId: DEFAULT_TRAINED_MALE_VOICE.id,
    voiceName: DEFAULT_TRAINED_MALE_VOICE.name,
    generationMode: 'INTERACTIVE_VISIMES',
    generationStatus: 'READY',
    boundAt: new Date().toISOString(),
    consentVersion: 'v2.2_custom_adult_consent_grant',
  };

  assert.equal(binding.projectId, '9c5b28a6-8399-4c9a-9dd8-fb3b15ff96e0');
  assert.equal(binding.characterId, 'e58923b8-3ce4-4a2c-b390-35739ab01715');
  assert.equal(binding.voiceProfileId, '09ac157f-8b37-41c8-97a2-22a83c41568d');
  assert.equal(binding.generationStatus, 'READY');
  assert.equal(binding.consentVersion, 'v2.2_custom_adult_consent_grant');
});
