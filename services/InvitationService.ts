import crypto from 'crypto';
import type {
  CircleInvitation,
  CircleMembership,
  CircleRole,
  InvitationMailer,
  SendInviteInput,
  SendInviteResult,
  ResendInviteInput,
  ResendInviteResult,
  RevokeInviteInput,
  RevokeInviteResult,
  AcceptInviteInput,
  AcceptInviteResult,
} from '../domain/invitations';


import { MockInvitationMailer } from './MockInvitationMailer.ts';



function getDatabaseInstance(): any {
  try {
    // Dynamically retrieve firebase admin firestore if present in environment
    const admin = require('../adapters/firebase/admin');
    return admin.getFirestoreDb();
  } catch {
    return null;
  }
}





/**
 * Standard Token Expiry Duration: 72 Hours in milliseconds
 */
const DEFAULT_EXPIRY_MS = 72 * 60 * 60 * 1000;

export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function isValidEmailAddress(email: string): boolean {
  const norm = normalizeEmail(email);
  return norm.length >= 3 && norm.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm);
}

export function hashInviteToken(rawToken: string, pepper?: string): string {
  const effectivePepper = pepper || process.env.INVITE_TOKEN_PEPPER || 'paramsathya-default-pepper-2026';
  return crypto.createHash('sha256').update(`${rawToken}:${effectivePepper}`).digest('hex');
}

export function generateRawToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * InvitationService
 * Manages the complete lifecycle of Circle Invitations and Circle Memberships.
 * Supports Cloud Firestore transactions when available, with in-memory persistence fallback.
 */
export class InvitationService {
  private mailer: InvitationMailer;
  private tokenPepper: string;

  // In-memory collections for local/offline zero-cost execution
  private inMemoryInvitations: Map<string, CircleInvitation> = new Map();
  private inMemoryMemberships: Map<string, CircleMembership> = new Map();
  private inMemoryIdempotency: Map<string, string> = new Map(); // requestId -> invitationId

  constructor(mailer: InvitationMailer, tokenPepper?: string) {
    this.mailer = mailer;
    this.tokenPepper = tokenPepper || process.env.INVITE_TOKEN_PEPPER || 'paramsathya-default-pepper-2026';
  }

  setMailer(mailer: InvitationMailer) {
    this.mailer = mailer;
  }

  /**
   * Helper to format human-readable expiration string
   */
  private formatExpiry(isoString: string): string {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return isoString;
    }
  }

  /**
   * 1. Send Invitation
   */
  async sendInvitation(input: SendInviteInput): Promise<SendInviteResult> {
    const emailNorm = normalizeEmail(input.email);
    if (!isValidEmailAddress(emailNorm)) {
      return { success: false, errorCode: 'INVALID_EMAIL', errorMessage: 'Invalid recipient email address format' };
    }

    if (input.role !== 'CONTRIBUTOR' && input.role !== 'VIEWER') {
      return { success: false, errorCode: 'INVALID_ROLE', errorMessage: 'Role must be CONTRIBUTOR or VIEWER' };
    }

    if (!input.profileId || !input.inviterUid) {
      return { success: false, errorCode: 'UNAUTHORIZED', errorMessage: 'Profile ID and inviter UID required' };
    }

    const db = getDatabaseInstance();
    const rawToken = generateRawToken();
    const tokenHash = hashInviteToken(rawToken, this.tokenPepper);
    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + DEFAULT_EXPIRY_MS).toISOString();

    if (db) {
      // FIRESTORE TRANSACTION PATH
      try {
        const result = await db.runTransaction(async (t: any) => {
          // Idempotency check via idempotency collection

          const idempRef = db.collection('idempotency_keys').doc(`invite_${input.requestId}`);
          const idempDoc = await t.get(idempRef);
          if (idempDoc.exists) {
            const existingInviteId = idempDoc.data()?.invitationId;
            const existingInviteRef = db.collection('profiles').doc(input.profileId).collection('invitations').doc(existingInviteId);
            const existingInviteDoc = await t.get(existingInviteRef);
            if (existingInviteDoc.exists) {
              return { success: true, invitation: existingInviteDoc.data() as CircleInvitation };
            }
          }

          // Check if user is already an active member
          const membershipsRef = db.collection('profiles').doc(input.profileId).collection('memberships');
          const existingMemberSnap = await t.get(
            membershipsRef.where('emailNormalized', '==', emailNorm).where('status', '==', 'ACTIVE')
          );
          if (!existingMemberSnap.empty) {
            return { success: false, errorCode: 'ALREADY_MEMBER', errorMessage: 'User is already an active member' };
          }

          // Check if an active invitation already exists for this email
          const invitationsRef = db.collection('profiles').doc(input.profileId).collection('invitations');
          const pendingSnap = await t.get(
            invitationsRef
              .where('invitedEmailNormalized', '==', emailNorm)
              .where('status', 'in', ['CREATED', 'SENDING', 'SENT'])
          );
          if (!pendingSnap.empty) {
            return {
              success: false,
              errorCode: 'ALREADY_PENDING',
              errorMessage: 'An active invitation is already pending for this email',
            };
          }

          const inviteId = `inv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
          const inviteDocRef = invitationsRef.doc(inviteId);

          const newInvite: CircleInvitation = {
            id: inviteId,
            profileId: input.profileId,
            inviterUid: input.inviterUid,
            invitedEmailNormalized: emailNorm,
            role: input.role,
            status: 'CREATED',
            tokenHash,
            expiresAt: expiresIso,
            createdAt: nowIso,
            updatedAt: nowIso,
            sendAttemptCount: 1,
          };

          t.set(inviteDocRef, newInvite);
          t.set(idempRef, { invitationId: inviteId, createdAt: nowIso, inviterUid: input.inviterUid });

          return { success: true, invitation: newInvite, rawToken };
        });

        if (!result.success || !result.invitation || !result.rawToken) {
          return { success: false, errorCode: result.errorCode, errorMessage: result.errorMessage };
        }

        const inviteUrl = `${input.baseUrl.replace(/\/$/, '')}/invite/accept?t=${result.rawToken}`;

        // Attempt mailing
        const mailResult = await this.mailer.sendInvitation({
          toEmail: emailNorm,
          inviterName: input.inviterName,
          representedPersonName: input.representedPersonName,
          role: input.role,
          inviteUrl,
          expiresAtFormatted: this.formatExpiry(expiresIso),
        });

        const inviteDocRef = db.collection('profiles').doc(input.profileId).collection('invitations').doc(result.invitation.id);

        if (mailResult.success) {
          const sentAt = new Date().toISOString();
          await inviteDocRef.update({
            status: 'SENT',
            sentAt,
            updatedAt: sentAt,
            gmailMessageId: mailResult.gmailMessageId || null,
          });
          return {
            success: true,
            invitation: {
              ...result.invitation,
              status: 'SENT',
              sentAt,
              updatedAt: sentAt,
              gmailMessageId: mailResult.gmailMessageId,
            },
          };
        } else {
          await inviteDocRef.update({
            status: 'SEND_FAILED',
            lastSendErrorCode: mailResult.errorCode || 'MAIL_DELIVERY_FAILED',
            updatedAt: new Date().toISOString(),
          });
          return {
            success: false,
            errorCode: mailResult.errorCode || 'SEND_FAILED',
            errorMessage: mailResult.errorMessage || 'Failed to send invitation email',
          };
        }
      } catch (err: any) {
        return { success: false, errorCode: 'TRANSACTION_FAILED', errorMessage: err.message };
      }
    } else {
      // IN-MEMORY FALLBACK PATH
      // Idempotency check
      if (input.requestId && this.inMemoryIdempotency.has(input.requestId)) {
        const existingId = this.inMemoryIdempotency.get(input.requestId)!;
        const existing = this.inMemoryInvitations.get(existingId);
        if (existing) return { success: true, invitation: existing };
      }

      // Check existing active membership
      for (const m of this.inMemoryMemberships.values()) {
        if (m.profileId === input.profileId && m.emailNormalized === emailNorm && m.status === 'ACTIVE') {
          return { success: false, errorCode: 'ALREADY_MEMBER', errorMessage: 'User is already an active member' };
        }
      }

      // Check existing pending invitation
      for (const inv of this.inMemoryInvitations.values()) {
        if (
          inv.profileId === input.profileId &&
          inv.invitedEmailNormalized === emailNorm &&
          ['CREATED', 'SENDING', 'SENT'].includes(inv.status)
        ) {
          return {
            success: false,
            errorCode: 'ALREADY_PENDING',
            errorMessage: 'An active invitation is already pending for this email',
          };
        }
      }

      const inviteId = `inv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const newInvite: CircleInvitation = {
        id: inviteId,
        profileId: input.profileId,
        inviterUid: input.inviterUid,
        invitedEmailNormalized: emailNorm,
        role: input.role,
        status: 'CREATED',
        tokenHash,
        expiresAt: expiresIso,
        createdAt: nowIso,
        updatedAt: nowIso,
        sendAttemptCount: 1,
      };

      this.inMemoryInvitations.set(inviteId, newInvite);
      if (input.requestId) this.inMemoryIdempotency.set(input.requestId, inviteId);

      const inviteUrl = `${input.baseUrl.replace(/\/$/, '')}/invite/accept?t=${rawToken}`;
      const mailResult = await this.mailer.sendInvitation({
        toEmail: emailNorm,
        inviterName: input.inviterName,
        representedPersonName: input.representedPersonName,
        role: input.role,
        inviteUrl,
        expiresAtFormatted: this.formatExpiry(expiresIso),
      });

      if (mailResult.success) {
        newInvite.status = 'SENT';
        newInvite.sentAt = new Date().toISOString();
        newInvite.updatedAt = newInvite.sentAt;
        newInvite.gmailMessageId = mailResult.gmailMessageId;
        return { success: true, invitation: newInvite };
      } else {
        newInvite.status = 'SEND_FAILED';
        newInvite.lastSendErrorCode = mailResult.errorCode;
        newInvite.updatedAt = new Date().toISOString();
        return {
          success: false,
          errorCode: mailResult.errorCode || 'SEND_FAILED',
          errorMessage: mailResult.errorMessage || 'Failed to send invitation email',
        };
      }
    }
  }

  /**
   * 2. Resend Invitation
   */
  async resendInvitation(input: ResendInviteInput): Promise<ResendInviteResult> {
    const db = getDatabaseInstance();
    const rawToken = generateRawToken();
    const tokenHash = hashInviteToken(rawToken, this.tokenPepper);
    const expiresIso = new Date(Date.now() + DEFAULT_EXPIRY_MS).toISOString();
    const nowIso = new Date().toISOString();

    if (db) {
      try {
        const inviteRef = db.collection('profiles').doc(input.profileId).collection('invitations').doc(input.invitationId);
        const doc = await inviteRef.get();
        if (!doc.exists) {
          return { success: false, errorCode: 'INVITATION_NOT_FOUND', errorMessage: 'Invitation doc not found' };
        }
        const inv = doc.data() as CircleInvitation;
        if (inv.status === 'ACCEPTED') {
          return { success: false, errorCode: 'ALREADY_ACCEPTED', errorMessage: 'Invitation is already accepted' };
        }
        if (inv.status === 'REVOKED') {
          return { success: false, errorCode: 'REVOKED', errorMessage: 'Cannot resend a revoked invitation' };
        }

        const inviteUrl = `${input.baseUrl.replace(/\/$/, '')}/invite/accept?t=${rawToken}`;
        const mailResult = await this.mailer.sendInvitation({
          toEmail: inv.invitedEmailNormalized,
          inviterName: input.inviterName,
          representedPersonName: input.representedPersonName,
          role: inv.role,
          inviteUrl,
          expiresAtFormatted: this.formatExpiry(expiresIso),
        });

        if (mailResult.success) {
          const updated: Partial<CircleInvitation> = {
            tokenHash,
            expiresAt: expiresIso,
            status: 'SENT',
            sentAt: nowIso,
            updatedAt: nowIso,
            sendAttemptCount: (inv.sendAttemptCount || 1) + 1,
            gmailMessageId: mailResult.gmailMessageId,
          };
          await inviteRef.update(updated);
          return { success: true, invitation: { ...inv, ...updated } as CircleInvitation };
        } else {
          await inviteRef.update({
            lastSendErrorCode: mailResult.errorCode,
            updatedAt: nowIso,
          });
          return { success: false, errorCode: mailResult.errorCode, errorMessage: mailResult.errorMessage };
        }
      } catch (err: any) {
        return { success: false, errorCode: 'RESEND_FAILED', errorMessage: err.message };
      }
    } else {
      const inv = this.inMemoryInvitations.get(input.invitationId);
      if (!inv || inv.profileId !== input.profileId) {
        return { success: false, errorCode: 'INVITATION_NOT_FOUND', errorMessage: 'Invitation not found' };
      }
      if (inv.status === 'ACCEPTED') {
        return { success: false, errorCode: 'ALREADY_ACCEPTED', errorMessage: 'Invitation is already accepted' };
      }
      if (inv.status === 'REVOKED') {
        return { success: false, errorCode: 'REVOKED', errorMessage: 'Cannot resend a revoked invitation' };
      }

      const inviteUrl = `${input.baseUrl.replace(/\/$/, '')}/invite/accept?t=${rawToken}`;
      const mailResult = await this.mailer.sendInvitation({
        toEmail: inv.invitedEmailNormalized,
        inviterName: input.inviterName,
        representedPersonName: input.representedPersonName,
        role: inv.role,
        inviteUrl,
        expiresAtFormatted: this.formatExpiry(expiresIso),
      });

      if (mailResult.success) {
        inv.tokenHash = tokenHash;
        inv.expiresAt = expiresIso;
        inv.status = 'SENT';
        inv.sentAt = nowIso;
        inv.updatedAt = nowIso;
        inv.sendAttemptCount = (inv.sendAttemptCount || 1) + 1;
        inv.gmailMessageId = mailResult.gmailMessageId;
        return { success: true, invitation: inv };
      } else {
        inv.lastSendErrorCode = mailResult.errorCode;
        inv.updatedAt = nowIso;
        return { success: false, errorCode: mailResult.errorCode, errorMessage: mailResult.errorMessage };
      }
    }
  }

  /**
   * 3. Revoke Invitation
   */
  async revokeInvitation(input: RevokeInviteInput): Promise<RevokeInviteResult> {
    const nowIso = new Date().toISOString();
    const db = getDatabaseInstance();

    if (db) {
      try {
        const inviteRef = db.collection('profiles').doc(input.profileId).collection('invitations').doc(input.invitationId);
        const doc = await inviteRef.get();
        if (!doc.exists) {
          return { success: false, errorCode: 'INVITATION_NOT_FOUND', errorMessage: 'Invitation doc not found' };
        }
        const inv = doc.data() as CircleInvitation;
        if (inv.status === 'ACCEPTED') {
          return { success: false, errorCode: 'ALREADY_ACCEPTED', errorMessage: 'Cannot revoke an accepted invitation' };
        }

        await inviteRef.update({
          status: 'REVOKED',
          revokedAt: nowIso,
          updatedAt: nowIso,
        });

        return { success: true, invitation: { ...inv, status: 'REVOKED', revokedAt: nowIso, updatedAt: nowIso } };
      } catch (err: any) {
        return { success: false, errorCode: 'REVOKE_FAILED', errorMessage: err.message };
      }
    } else {
      const inv = this.inMemoryInvitations.get(input.invitationId);
      if (!inv || inv.profileId !== input.profileId) {
        return { success: false, errorCode: 'INVITATION_NOT_FOUND', errorMessage: 'Invitation not found' };
      }
      if (inv.status === 'ACCEPTED') {
        return { success: false, errorCode: 'ALREADY_ACCEPTED', errorMessage: 'Cannot revoke an accepted invitation' };
      }
      inv.status = 'REVOKED';
      inv.revokedAt = nowIso;
      inv.updatedAt = nowIso;
      return { success: true, invitation: inv };
    }
  }

  /**
   * 4. Accept Invitation
   */
  async acceptInvitation(input: AcceptInviteInput): Promise<AcceptInviteResult> {
    if (!input.rawToken) {
      return { success: false, errorCode: 'MISSING_TOKEN', errorMessage: 'Invitation token is missing' };
    }
    if (!input.authenticatedUid || !input.authenticatedEmail) {
      return { success: false, errorCode: 'UNAUTHENTICATED', errorMessage: 'Recipient must be authenticated' };
    }

    const tokenHash = hashInviteToken(input.rawToken, this.tokenPepper);
    const emailNorm = normalizeEmail(input.authenticatedEmail);
    const nowIso = new Date().toISOString();
    const db = getDatabaseInstance();

    if (db) {
      try {
        const querySnap = await db.collectionGroup('invitations').where('tokenHash', '==', tokenHash).limit(1).get();
        if (querySnap.empty) {
          return { success: false, errorCode: 'INVALID_TOKEN', errorMessage: 'Invalid or unknown invitation token' };
        }

        const inviteDoc = querySnap.docs[0];
        const inv = inviteDoc.data() as CircleInvitation;
        const profileId = inv.profileId;

        // Validity Checks
        if (inv.status === 'REVOKED') {
          return { success: false, errorCode: 'INVITATION_REVOKED', errorMessage: 'This invitation has been revoked' };
        }
        if (inv.status === 'ACCEPTED') {
          return { success: false, errorCode: 'INVITATION_ALREADY_ACCEPTED', errorMessage: 'This invitation has already been accepted' };
        }
        if (new Date(inv.expiresAt).getTime() < Date.now()) {
          return { success: false, errorCode: 'INVITATION_EXPIRED', errorMessage: 'This invitation has expired' };
        }

        // Email Matching Check
        if (inv.invitedEmailNormalized !== emailNorm) {
          return {
            success: false,
            errorCode: 'EMAIL_MISMATCH',
            errorMessage: 'Your signed-in email address does not match the recipient of this invitation',
          };
        }

        const membershipId = `${profileId}_${input.authenticatedUid}`;
        const membershipRef = db.collection('profiles').doc(profileId).collection('memberships').doc(membershipId);
        const inviteRef = inviteDoc.ref;

        const newMembership: CircleMembership = {
          id: membershipId,
          profileId,
          uid: input.authenticatedUid,
          emailNormalized: emailNorm,
          displayName: input.authenticatedDisplayName || emailNorm.split('@')[0],
          role: inv.role,
          status: 'ACTIVE',
          joinedAt: nowIso,
          invitedByUid: inv.inviterUid,
          invitationId: inv.id,
        };

        await db.runTransaction(async (t: any) => {
          t.set(membershipRef, newMembership);
          t.update(inviteRef, {
            status: 'ACCEPTED',
            acceptedAt: nowIso,
            updatedAt: nowIso,
          });
        });

        return {
          success: true,
          membership: newMembership,
          invitation: { ...inv, status: 'ACCEPTED', acceptedAt: nowIso, updatedAt: nowIso },
        };
      } catch (err: any) {
        return { success: false, errorCode: 'ACCEPT_TRANSACTION_FAILED', errorMessage: err.message };
      }
    } else {
      // In-memory verification
      let foundInv: CircleInvitation | undefined;
      for (const inv of this.inMemoryInvitations.values()) {
        if (inv.tokenHash === tokenHash) {
          foundInv = inv;
          break;
        }
      }

      if (!foundInv) {
        return { success: false, errorCode: 'INVALID_TOKEN', errorMessage: 'Invalid or unknown invitation token' };
      }

      if (foundInv.status === 'REVOKED') {
        return { success: false, errorCode: 'INVITATION_REVOKED', errorMessage: 'This invitation has been revoked' };
      }
      if (foundInv.status === 'ACCEPTED') {
        return { success: false, errorCode: 'INVITATION_ALREADY_ACCEPTED', errorMessage: 'This invitation has already been accepted' };
      }
      if (new Date(foundInv.expiresAt).getTime() < Date.now()) {
        return { success: false, errorCode: 'INVITATION_EXPIRED', errorMessage: 'This invitation has expired' };
      }

      if (foundInv.invitedEmailNormalized !== emailNorm) {
        return {
          success: false,
          errorCode: 'EMAIL_MISMATCH',
          errorMessage: 'Your signed-in email address does not match the recipient of this invitation',
        };
      }

      const membershipId = `${foundInv.profileId}_${input.authenticatedUid}`;
      const membership: CircleMembership = {
        id: membershipId,
        profileId: foundInv.profileId,
        uid: input.authenticatedUid,
        emailNormalized: emailNorm,
        displayName: input.authenticatedDisplayName || emailNorm.split('@')[0],
        role: foundInv.role,
        status: 'ACTIVE',
        joinedAt: nowIso,
        invitedByUid: foundInv.inviterUid,
        invitationId: foundInv.id,
      };

      foundInv.status = 'ACCEPTED';
      foundInv.acceptedAt = nowIso;
      foundInv.updatedAt = nowIso;
      this.inMemoryMemberships.set(membershipId, membership);

      return {
        success: true,
        membership,
        invitation: foundInv,
      };
    }
  }

  /**
   * 5. Query Active Invitations for a Profile
   */
  async listInvitations(profileId: string): Promise<CircleInvitation[]> {
    const db = getDatabaseInstance();
    if (db) {
      const snap = await db
        .collection('profiles')
        .doc(profileId)
        .collection('invitations')
        .where('status', 'in', ['CREATED', 'SENDING', 'SENT'])
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map((d: any) => d.data() as CircleInvitation);
    } else {
      return Array.from(this.inMemoryInvitations.values())
        .filter((i) => i.profileId === profileId && ['CREATED', 'SENDING', 'SENT'].includes(i.status))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  }

  /**
   * 6. Query Active Memberships for a Profile
   */
  async listMemberships(profileId: string): Promise<CircleMembership[]> {
    const db = getDatabaseInstance();
    if (db) {
      const snap = await db
        .collection('profiles')
        .doc(profileId)
        .collection('memberships')
        .where('status', '==', 'ACTIVE')
        .orderBy('joinedAt', 'desc')
        .get();
      return snap.docs.map((d: any) => d.data() as CircleMembership);

    } else {
      return Array.from(this.inMemoryMemberships.values())
        .filter((m) => m.profileId === profileId && m.status === 'ACTIVE')
        .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
    }
  }

  /**
   * Helper for tests to seed membership directly
   */
  seedMembership(membership: CircleMembership) {
    this.inMemoryMemberships.set(membership.id, membership);
  }

  /**
   * Helper for tests to inspect stored invitation
   */
  getStoredInvitation(id: string): CircleInvitation | undefined {
    return this.inMemoryInvitations.get(id);
  }

  /**
   * Helper to clear in-memory state during tests
   */
  clear() {
    this.inMemoryInvitations.clear();
    this.inMemoryMemberships.clear();
    this.inMemoryIdempotency.clear();
  }
}

// Singleton provider with default MockInvitationMailer
export const defaultMockMailer = new MockInvitationMailer();
export const invitationService = new InvitationService(defaultMockMailer);
