/**
 * Domain Repositories and Provider Interfaces
 * Free of concrete database or vendor dependencies.
 */

import {
  MemoryRecord,
  PermissionGrant,
  GroundedResponse,
  RenderDecisionPacket,
  RenderAuthorizationResult,
  AuditEvent,
  ResponseMode
} from './models';

export interface MemoryRepository {
  findById(id: string, profileId: string): Promise<MemoryRecord | null>;
  searchVector768(embedding: number[], profileId: string, limit: number): Promise<MemoryRecord[]>;
  save(record: MemoryRecord): Promise<void>;
}

export interface PermissionRepository {
  getGrant(userId: string, profileId: string): Promise<PermissionGrant | null>;
}

export interface AuditRepository {
  logEvent(event: AuditEvent): Promise<void>;
  listEventsByProfile?(profileId: string, limit?: number): Promise<AuditEvent[]>;
}

export interface VoiceRenderer {
  readonly providerName: string;
  renderVoice(text: string, voiceProfileId: string): Promise<{ audioWavBuffer: ArrayBuffer; durationSeconds: number }>;
}

export interface AvatarRenderer {
  readonly providerName: string;
  renderLipSync(audioWavBuffer: ArrayBuffer, portraitImageBuffer: ArrayBuffer): Promise<{ videoMp4Buffer: ArrayBuffer }>;
}

export interface GroundedConversationModel {
  generateGroundedResponse(
    userQuery: string,
    evidences: MemoryRecord[],
    currentMode: ResponseMode
  ): Promise<GroundedResponse>;
}

export interface SafetyEvaluator {
  evaluateQuery(query: string): Promise<{
    safetyState: 'NORMAL' | 'ELEVATED' | 'URGENT';
    flaggedKeywords: string[];
    suggestedMode: ResponseMode;
  }>;
}

export interface RenderAuthorizationService {
  authorizeRender(packet: RenderDecisionPacket): Promise<RenderAuthorizationResult>;
}
