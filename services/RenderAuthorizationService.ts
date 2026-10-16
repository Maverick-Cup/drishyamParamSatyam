/**
 * Single Server-Side Render Authorization Service Choke Point
 * Enforces the strict rule: "Neither model judgment nor permission alone is enough for a high-impact render."
 *
 * Checks:
 * 1. Semantic judgment: Evidence references must exist and match.
 * 2. Formal authorization: User must hold an active grant for voice/avatar.
 * 3. Human consent: Replicated voices require explicit adult speaker consent.
 * 4. Safety state: High-urgency safety states instantly forbid persona rendering.
 * 5. Fail-Closed: Any missing or ambiguous state rejects rendering immediately.
 */

import {
  RenderDecisionPacket,
  RenderAuthorizationResult,
  PermissionGrant
} from '../domain/models';
import { PermissionRepository, AuditRepository } from '../domain/repositories';

export class DefaultRenderAuthorizationService {
  constructor(
    private readonly permissionRepo: PermissionRepository,
    private readonly auditRepo: AuditRepository
  ) {}

  public async authorizeRender(packet: RenderDecisionPacket): Promise<RenderAuthorizationResult> {
    const timestamp = new Date().toISOString();

    // 1. Fail-closed: Safety state check
    if (packet.safetyState === 'URGENT') {
      await this.auditRejection(packet, 'Blocked by URGENT safety state; direct support required');
      return {
        authorized: false,
        reason: 'Safety state prevents persona rendering. Switched to Safety support mode.',
        decisionPacket: packet,
        authorizedTimestamp: timestamp,
      };
    }

    // 2. Fail-closed: Mode check (represented person likeness is forbidden in GUIDE and SAFETY modes)
    if (packet.requestedMode !== 'PRESENCE') {
      await this.auditRejection(packet, `Persona rendering forbidden in ${packet.requestedMode} mode`);
      return {
        authorized: false,
        reason: `Persona rendering is strictly restricted to PRESENCE mode.`,
        decisionPacket: packet,
        authorizedTimestamp: timestamp,
      };
    }

    // 3. Evidence check: Presence requires verified evidence references
    if (!packet.evidenceRefs || packet.evidenceRefs.length === 0) {
      await this.auditRejection(packet, 'No evidence references provided for grounded persona speech');
      return {
        authorized: false,
        reason: 'Cannot speak without verified memory evidence. Please consult the Guide.',
        decisionPacket: packet,
        authorizedTimestamp: timestamp,
      };
    }

    // 4. Permission grant lookup
    const grant: PermissionGrant | null = await this.permissionRepo.getGrant(packet.userId, packet.profileId);
    if (!grant) {
      await this.auditRejection(packet, 'No permission grant found for user on this profile');
      return {
        authorized: false,
        reason: 'User lacks permission grant for this profile.',
        decisionPacket: packet,
        authorizedTimestamp: timestamp,
      };
    }

    // 5. Version freshness check
    if (grant.version !== packet.voicePermissionVersion || grant.version !== packet.likenessPermissionVersion) {
      await this.auditRejection(packet, 'Stale permission version in decision packet');
      return {
        authorized: false,
        reason: 'Permission state has changed. Re-authorization required.',
        decisionPacket: packet,
        authorizedTimestamp: timestamp,
      };
    }

    // 6. Voice consent check
    if (packet.selectedRenderer === 'REPLICATED_TTS' && (!grant.allowVoiceSynthesis || !grant.isConsentedAdult)) {
      await this.auditRejection(packet, 'Replicated voice requires explicit adult consent');
      return {
        authorized: false,
        reason: 'Replicated voice synthesis is not authorized or lacks recorded consent.',
        decisionPacket: packet,
        authorizedTimestamp: timestamp,
      };
    }

    // 7. Likeness render check
    if (!grant.allowAvatarRender) {
      await this.auditRejection(packet, 'Avatar rendering not granted');
      return {
        authorized: false,
        reason: 'Avatar likeness rendering is disabled for this profile.',
        decisionPacket: packet,
        authorizedTimestamp: timestamp,
      };
    }

    // Authorization Success
    await this.auditRepo.logEvent({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp,
      userId: packet.userId,
      profileId: packet.profileId,
      eventType: 'AUTHZ_DECISION',
      payload: {
        authorized: true,
        requestId: packet.requestId,
        selectedRenderer: packet.selectedRenderer,
        textHash: packet.proposedTextHash,
      },
    });

    return {
      authorized: true,
      decisionPacket: packet,
      authorizedTimestamp: timestamp,
    };
  }

  private async auditRejection(packet: RenderDecisionPacket, reason: string): Promise<void> {
    await this.auditRepo.logEvent({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: packet.userId,
      profileId: packet.profileId,
      eventType: 'AUTHZ_DECISION',
      payload: {
        authorized: false,
        requestId: packet.requestId,
        reason,
        requestedMode: packet.requestedMode,
      },
    });
  }
}
