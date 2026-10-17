/**
 * Canonical Domain Contracts for ParamSathya Connected Circle Invitations
 * Strict TypeScript models with ZERO third-party or browser SDK dependencies.
 */

export type CircleRole = 'CONTRIBUTOR' | 'VIEWER';

export type InvitationStatus =
  | 'CREATED'
  | 'SENDING'
  | 'SENT'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'SEND_FAILED';

export interface CircleInvitation {
  id: string;
  profileId: string;
  inviterUid: string;
  invitedEmailNormalized: string;
  role: CircleRole;
  status: InvitationStatus;
  tokenHash: string;
  expiresAt: string; // ISO 8601 string (e.g. 72h default)
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  acceptedAt?: string;
  revokedAt?: string;
  gmailMessageId?: string;
  sendAttemptCount: number;
  lastSendErrorCode?: string;
}

export type MembershipRole = 'OWNER' | 'CONTRIBUTOR' | 'VIEWER';

export interface CircleMembership {
  id: string; // formatted as: ${profileId}_${uid}
  profileId: string;
  uid: string;
  emailNormalized: string;
  displayName: string;
  role: MembershipRole;
  status: 'ACTIVE' | 'REVOKED';
  joinedAt: string;
  invitedByUid?: string;
  invitationId?: string;
}

export interface InvitationMailRequest {
  toEmail: string;
  inviterName: string;
  representedPersonName: string;
  role: CircleRole;
  inviteUrl: string;
  expiresAtFormatted: string;
}

export interface InvitationMailResult {
  success: boolean;
  gmailMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface InvitationMailer {
  sendInvitation(req: InvitationMailRequest): Promise<InvitationMailResult>;
}

export interface SendInviteInput {
  profileId: string;
  inviterUid: string;
  inviterName: string;
  representedPersonName: string;
  email: string;
  role: CircleRole;
  requestId: string;
  baseUrl: string;
}

export interface SendInviteResult {
  success: boolean;
  invitation?: CircleInvitation;
  errorCode?: string;
  errorMessage?: string;
}

export interface ResendInviteInput {
  invitationId: string;
  profileId: string;
  inviterUid: string;
  inviterName: string;
  representedPersonName: string;
  baseUrl: string;
}

export interface ResendInviteResult {
  success: boolean;
  invitation?: CircleInvitation;
  errorCode?: string;
  errorMessage?: string;
}

export interface RevokeInviteInput {
  invitationId: string;
  profileId: string;
  inviterUid: string;
}

export interface RevokeInviteResult {
  success: boolean;
  invitation?: CircleInvitation;
  errorCode?: string;
  errorMessage?: string;
}

export interface AcceptInviteInput {
  rawToken: string;
  authenticatedUid: string;
  authenticatedEmail: string;
  authenticatedDisplayName?: string;
}

export interface AcceptInviteResult {
  success: boolean;
  membership?: CircleMembership;
  invitation?: CircleInvitation;
  errorCode?: string;
  errorMessage?: string;
}
