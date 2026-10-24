/**
 * Domain Models for ParamSathya
 * Strict TypeScript contracts with ZERO external dependencies (no React, Firebase, or Google SDKs).
 */

export * from './invitations';
export * from './flow';
import type { GoogleFlowCharacterBinding } from './flow';


export type ResponseMode = 'PRESENCE' | 'GUIDE' | 'SAFETY';

export type SupportLevel =
  | 'DIRECT_SOURCE'
  | 'ATTRIBUTED_RECOLLECTION'
  | 'GENERAL_SUPPORT'
  | 'INSUFFICIENT_EVIDENCE';

export type ProvenanceType =
  | 'VERIFIED_FIRST_PERSON'
  | 'ATTRIBUTED_RECOLLECTION'
  | 'USER_CONTEXT'
  | 'GENERAL_SUPPORT'
  | 'GENERATED_CONTENT';

export type ProvenanceTier = ProvenanceType;

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'REVIEW_REQUIRED';

export type MemoryReviewStatus = 'APPROVED' | 'REVIEW_REQUIRED' | 'REVOKED';

export type EvidenceSourceType = 'AUDIO' | 'TEXT' | 'DOCUMENT' | 'PHOTO';

export interface AudioEvidenceAnchor {
  kind: 'AUDIO';
  sourceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  transcriptSegmentId: string;
  startMs: number;
  endMs: number;
  quotedText?: string;
  checksumSha256?: string;
}

export interface TextEvidenceAnchor {
  kind: 'TEXT' | 'DOCUMENT' | 'PHOTO';
  sourceId: string;
  sourceTitle: string;
  sourceUrl?: string;
  pageNumber?: number;
  paragraphId?: string;
  startChar?: number;
  endChar?: number;
  quotedText?: string;
  checksumSha256?: string;
}

export type EvidenceAnchor = AudioEvidenceAnchor | TextEvidenceAnchor;

export type SafetyState = 'NORMAL' | 'ELEVATED' | 'URGENT';

export interface ClaimVerification {
  text: string;
  evidenceRefs: string[];
  supportLevel: SupportLevel;
}

export interface GroundedResponse {
  mode: ResponseMode;
  text: string;
  claims: ClaimVerification[];
  guideHandoff: boolean;
  renderAllowed: boolean;
  safetyState: SafetyState;
}

export interface MemoryRecord {
  id: string;
  ownerUid: string;
  profileId: string;
  representedPersonId: string;
  title?: string;
  contributorUid: string;
  contributorId?: string;
  contributorDisplayName?: string;
  recordedSpeakerId?: string;
  recordedSpeakerDisplayName?: string;
  verifiedLocation?: string;
  categoryIds?: string[];
  sourceRefs: string[];
  sourceOffsetSeconds?: number;
  sourcePageOffset?: number;
  reviewedText: string;
  provenance: ProvenanceType;
  provenanceTier?: ProvenanceTier;
  reviewStatus: ReviewStatus;
  evidenceAnchors?: EvidenceAnchor[];
  restrictedScope?: boolean;
  embedding768?: number[]; // 768-dimensional Gemini Embedding 2
  createdAt: string;
  updatedAt: string;
}

export interface RepresentedPerson {
  id: string;
  ownerUid: string;
  fullName: string;
  relationship: string;
  bornYear?: number;
  passedYear?: number;
  defaultPortraitUrl?: string;
  activeVoiceProfileId?: string;
  googleFlowCharacter?: GoogleFlowCharacterBinding;
  createdAt: string;
}

export interface PermissionGrant {
  id: string;
  profileId: string;
  representedPersonId: string;
  granteeUid: string;
  allowPresenceView: boolean;
  allowVoiceSynthesis: boolean;
  allowAvatarRender: boolean;
  isConsentedAdult: boolean;
  version: number;
  updatedAt: string;
}

export interface RenderDecisionPacket {
  requestId: string;
  userId: string;
  profileId: string;
  requestedMode: ResponseMode;
  normalisedUserIntent: string;
  evidenceRefs: string[];
  proposedTextHash: string;
  claimSupportSummary: string;
  voicePermissionVersion: number;
  likenessPermissionVersion: number;
  safetyState: SafetyState;
  selectedRenderer: 'ORIGINAL_RECORDING' | 'REPLICATED_TTS' | 'VOICESTUDIO' | 'STATIC_NEUTRAL';
}

export interface RenderAuthorizationResult {
  authorized: boolean;
  reason?: string;
  decisionPacket: RenderDecisionPacket;
  authorizedTimestamp: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  profileId: string;
  eventType: 'AUTHZ_DECISION' | 'GROUNDING_EVAL' | 'MODE_TRANSITION' | 'MEDIA_RENDER' | 'SAFETY_TRIGGER';
  payload: Record<string, unknown>;
}

export interface MediaVaultRecord {
  id: string;
  profileId: string;
  ownerUid: string;
  type: 'image' | 'audio' | 'document';
  title: string;
  category: string;
  filename: string;
  storageUri: string;
  signedUrl?: string;
  mimeType: string;
  sizeBytes: number;
  originalSizeBytes?: number;
  compressed?: boolean;
  reductionPercent?: number;
  durationSeconds?: number;
  checksumSha256?: string;
  uploadedAt: string;
}

