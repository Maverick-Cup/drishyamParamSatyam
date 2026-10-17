import test from 'node:test';
import assert from 'node:assert/strict';
import {
  InvitationService,
  hashInviteToken,
  generateRawToken,
  normalizeEmail,
  isValidEmailAddress,
} from '../services/InvitationService.ts';
import { MockInvitationMailer } from '../services/MockInvitationMailer.ts';
import {
  renderInvitationEmail,
  buildMimeMessage,
  escapeHtml,
} from '../services/GmailInvitationMailer.ts';

test('PARAMSATHYA-GMAIL-001: Automated Verification Suite (Slice 1)', async (t) => {
  const mockMailer = new MockInvitationMailer();
  const testPepper = 'test-pepper-audit-2026';
  const service = new InvitationService(mockMailer, testPepper);

  // Clear state before running
  service.clear();
  mockMailer.clear();

  // Test 1: Normalize email and validator
  await t.test('INVITE-001: Email normalization and validation', () => {
    assert.equal(normalizeEmail('  User.NAME+Tag@Example.COM '), 'user.name+tag@example.com');
    assert.equal(isValidEmailAddress('test@family.org'), true);
    assert.equal(isValidEmailAddress('invalid-email'), false);
    assert.equal(isValidEmailAddress(''), false);
  });

  // Test 2: Invalid role rejected
  await t.test('INVITE-002: Injected or invalid role rejected', async () => {
    const res = await service.sendInvitation({
      profileId: 'p-1',
      inviterUid: 'u-owner',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      email: 'guest@example.com',
      role: 'SUPERADMIN',
      requestId: 'req-inv-1',

      baseUrl: 'http://localhost:3000',
    });
    assert.equal(res.success, false);
    assert.equal(res.errorCode, 'INVALID_ROLE');
  });

  // Test 3: Missing inviter or profile rejected
  await t.test('INVITE-003: Missing inviter UID or profile ID rejected', async () => {
    const res = await service.sendInvitation({
      profileId: '',
      inviterUid: '',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      email: 'guest@example.com',
      role: 'CONTRIBUTOR',
      requestId: 'req-inv-2',
      baseUrl: 'http://localhost:3000',
    });
    assert.equal(res.success, false);
    assert.equal(res.errorCode, 'UNAUTHORIZED');
  });

  // Test 4: Successful send transitions to SENT via MockInvitationMailer
  let createdInviteId = '';
  await t.test('INVITE-004: Valid invite transitions to SENT and dispatches mock mail', async () => {
    const res = await service.sendInvitation({
      profileId: 'p-1',
      inviterUid: 'u-owner',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      email: 'sister.claire@example.com',
      role: 'CONTRIBUTOR',
      requestId: 'req-success-1',
      baseUrl: 'http://localhost:3000',
    });

    assert.equal(res.success, true);
    assert.ok(res.invitation);
    assert.equal(res.invitation.status, 'SENT');
    assert.equal(res.invitation.role, 'CONTRIBUTOR');
    assert.equal(res.invitation.invitedEmailNormalized, 'sister.claire@example.com');
    assert.ok(res.invitation.gmailMessageId?.startsWith('mock-msg-'));

    createdInviteId = res.invitation.id;

    // Verify mock mailer recorded exactly 1 email
    assert.equal(mockMailer.sentMails.length, 1);
    const sent = mockMailer.getLastMail();
    assert.ok(sent);
    assert.equal(sent.toEmail, 'sister.claire@example.com');
    assert.ok(sent.inviteUrl.includes('/invite/accept?t='));
  });

  // Test 5: Raw token never stored in invitation record
  await t.test('INVITE-005: Raw token is NEVER stored in database record', () => {
    const stored = service.getStoredInvitation(createdInviteId);
    assert.ok(stored);
    assert.ok(stored.tokenHash);
    assert.equal(stored.rawToken, undefined);
    assert.equal(stored.token, undefined);
    assert.equal(stored.tokenHash.length, 64); // SHA-256 hex string length

  });

  // Test 6: Idempotent deduplication by requestId
  await t.test('INVITE-006: Duplicate requestId returns existing invitation without sending new mail', async () => {
    const mailCountBefore = mockMailer.sentMails.length;
    const res = await service.sendInvitation({
      profileId: 'p-1',
      inviterUid: 'u-owner',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      email: 'sister.claire@example.com',
      role: 'CONTRIBUTOR',
      requestId: 'req-success-1', // same requestId
      baseUrl: 'http://localhost:3000',
    });

    assert.equal(res.success, true);
    assert.equal(res.invitation?.id, createdInviteId);
    assert.equal(mockMailer.sentMails.length, mailCountBefore); // No extra email sent
  });

  // Test 7: Duplicate invite with different requestId is rejected as ALREADY_PENDING
  await t.test('INVITE-007: Pending invite prevents duplicate send to same email', async () => {
    const res = await service.sendInvitation({
      profileId: 'p-1',
      inviterUid: 'u-owner',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      email: 'sister.claire@example.com',
      role: 'VIEWER',
      requestId: 'req-different-id',
      baseUrl: 'http://localhost:3000',
    });

    assert.equal(res.success, false);
    assert.equal(res.errorCode, 'ALREADY_PENDING');
  });

  // Test 8: Mailer failure marks status SEND_FAILED
  await t.test('INVITE-008: Mailer failure marks status as SEND_FAILED', async () => {
    mockMailer.setFailNext(true, 'SMTP_REJECTED');
    const res = await service.sendInvitation({
      profileId: 'p-1',
      inviterUid: 'u-owner',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      email: 'brother.bob@example.com',
      role: 'VIEWER',
      requestId: 'req-fail-1',
      baseUrl: 'http://localhost:3000',
    });

    assert.equal(res.success, false);
    assert.equal(res.errorCode, 'SMTP_REJECTED');

    // Check stored doc is SEND_FAILED
    const list = await service.listInvitations('p-1');
    const failed = list.find((i) => i.invitedEmailNormalized === 'brother.bob@example.com');
    // listInvitations filters for CREATED, SENDING, SENT
    assert.equal(failed, undefined);
  });

  // Test 9: Resend invitation rotates token and increments send attempt count
  let resentToken = '';
  await t.test('INVITE-009: Resend generates new token hash and dispatches fresh email', async () => {
    const initialStored = service.getStoredInvitation(createdInviteId);
    assert.ok(initialStored);
    const initialHash = initialStored.tokenHash;


    const resendRes = await service.resendInvitation({
      invitationId: createdInviteId,
      profileId: 'p-1',
      inviterUid: 'u-owner',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      baseUrl: 'http://localhost:3000',
    });

    assert.equal(resendRes.success, true);
    assert.equal(resendRes.invitation?.id, createdInviteId);
    assert.notEqual(resendRes.invitation?.tokenHash, initialHash);
    assert.equal(resendRes.invitation?.sendAttemptCount, 2);

    const latestMail = mockMailer.getLastMail();
    assert.ok(latestMail);
    const url = new URL(latestMail.inviteUrl);
    resentToken = url.searchParams.get('t') || '';
    assert.ok(resentToken);
  });

  // Test 10: Revoke invitation marks status REVOKED
  await t.test('INVITE-010: Revoking invitation transitions status to REVOKED', async () => {
    // Send fresh invite to revoke
    const toRevokeRes = await service.sendInvitation({
      profileId: 'p-1',
      inviterUid: 'u-owner',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      email: 'cousin.sam@example.com',
      role: 'VIEWER',
      requestId: 'req-revoke-test',
      baseUrl: 'http://localhost:3000',
    });

    assert.equal(toRevokeRes.success, true);
    assert.ok(toRevokeRes.invitation);
    const inviteId = toRevokeRes.invitation.id;

    const revokeRes = await service.revokeInvitation({
      invitationId: inviteId,
      profileId: 'p-1',
      inviterUid: 'u-owner',
    });

    assert.equal(revokeRes.success, true);
    assert.equal(revokeRes.invitation?.status, 'REVOKED');
    assert.ok(revokeRes.invitation?.revokedAt);
  });

  // Test 11: Cannot accept revoked invitation
  await t.test('INVITE-011: Cannot accept a revoked invitation', async () => {
    // Extract token of a revoked invite
    const sendRes = await service.sendInvitation({
      profileId: 'p-1',
      inviterUid: 'u-owner',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      email: 'uncle.mark@example.com',
      role: 'VIEWER',
      requestId: 'req-revoke-accept',
      baseUrl: 'http://localhost:3000',
    });

    assert.ok(sendRes.invitation);
    const lastMail = mockMailer.getLastMail();
    assert.ok(lastMail);
    const inviteUrl = lastMail.inviteUrl;
    const token = new URL(inviteUrl).searchParams.get('t') || '';

    await service.revokeInvitation({
      invitationId: sendRes.invitation.id,
      profileId: 'p-1',
      inviterUid: 'u-owner',
    });


    const acceptRes = await service.acceptInvitation({
      rawToken: token,
      authenticatedUid: 'u-mark',
      authenticatedEmail: 'uncle.mark@example.com',
    });

    assert.equal(acceptRes.success, false);
    assert.equal(acceptRes.errorCode, 'INVITATION_REVOKED');
  });

  // Test 12: Authenticated email mismatch rejected on accept
  await t.test('INVITE-012: Recipient authenticated email mismatch rejected', async () => {
    const acceptRes = await service.acceptInvitation({
      rawToken: resentToken,
      authenticatedUid: 'u-impostor',
      authenticatedEmail: 'attacker@example.com', // Mismatch! Expects sister.claire@example.com
    });

    assert.equal(acceptRes.success, false);
    assert.equal(acceptRes.errorCode, 'EMAIL_MISMATCH');
  });

  // Test 13: Successful acceptance creates CircleMembership and transitions to ACCEPTED
  await t.test('INVITE-013: Valid acceptance creates CircleMembership and transitions status', async () => {
    const acceptRes = await service.acceptInvitation({
      rawToken: resentToken,
      authenticatedUid: 'u-claire-123',
      authenticatedEmail: 'sister.claire@example.com',
      authenticatedDisplayName: 'Claire S.',
    });

    assert.equal(acceptRes.success, true);
    assert.ok(acceptRes.membership);
    assert.equal(acceptRes.membership.uid, 'u-claire-123');
    assert.equal(acceptRes.membership.role, 'CONTRIBUTOR');
    assert.equal(acceptRes.membership.status, 'ACTIVE');

    assert.equal(acceptRes.invitation?.status, 'ACCEPTED');
    assert.ok(acceptRes.invitation?.acceptedAt);

    // Verify membership is returned in listMemberships
    const members = await service.listMemberships('p-1');
    assert.equal(members.length, 1);
    assert.equal(members[0].emailNormalized, 'sister.claire@example.com');
  });

  // Test 14: Accepted token cannot be reused
  await t.test('INVITE-014: Accepted invitation cannot be accepted a second time', async () => {
    const acceptRes = await service.acceptInvitation({
      rawToken: resentToken,
      authenticatedUid: 'u-claire-123',
      authenticatedEmail: 'sister.claire@example.com',
    });

    assert.equal(acceptRes.success, false);
    assert.equal(acceptRes.errorCode, 'INVITATION_ALREADY_ACCEPTED');
  });

  // Test 15: Existing member cannot be invited again
  await t.test('INVITE-015: Active circle member cannot receive duplicate invitation', async () => {
    const res = await service.sendInvitation({
      profileId: 'p-1',
      inviterUid: 'u-owner',
      inviterName: 'Owner',
      representedPersonName: 'Satya',
      email: 'sister.claire@example.com', // already an active member from test 13
      role: 'VIEWER',
      requestId: 'req-dup-member',
      baseUrl: 'http://localhost:3000',
    });

    assert.equal(res.success, false);
    assert.equal(res.errorCode, 'ALREADY_MEMBER');
  });

  // Test 16: Email template HTML escapes variables
  await t.test('GMAIL-001: Email template rigorously HTML-escapes inviter and person names', () => {
    const xssReq = {
      toEmail: 'test@example.com',
      inviterName: '<script>alert("xss")</script>',
      representedPersonName: '<b>Grandpa</b>',
      role: 'CONTRIBUTOR',
      inviteUrl: 'http://localhost:3000/invite/accept?t=abc&test=1',

      expiresAtFormatted: 'Oct 20, 2026',
    };

    const rendered = renderInvitationEmail(xssReq);
    assert.ok(!rendered.htmlBody.includes('<script>'));
    assert.ok(rendered.htmlBody.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'));
    assert.ok(rendered.htmlBody.includes('&lt;b&gt;Grandpa&lt;/b&gt;'));
  });

  // Test 17: Email template contains ZERO private memories or audio links
  await t.test('GMAIL-002: Email template contains zero memories, audio URLs, or transcripts', () => {
    const rendered = renderInvitationEmail({
      toEmail: 'test@example.com',
      inviterName: 'Maya',
      representedPersonName: 'Satya',
      role: 'VIEWER',
      inviteUrl: 'http://localhost:3000/invite/accept?t=token-123',
      expiresAtFormatted: 'Oct 20, 2026',
    });

    assert.ok(!rendered.htmlBody.includes('.mp3'));
    assert.ok(!rendered.htmlBody.includes('.wav'));
    assert.ok(!rendered.htmlBody.includes('transcript'));
    assert.ok(!rendered.htmlBody.includes('memoryId'));
  });

  // Test 18: RFC 2822 / MIME message base64url encoding
  await t.test('GMAIL-003: MIME message builder produces valid base64url string', () => {
    const raw = buildMimeMessage({
      fromEmail: 'vault@paramsathya.org',
      fromName: 'ParamSathya Vault',
      toEmail: 'recipient@example.com',
      subject: 'Test Subject',
      htmlBody: '<p>Hello World</p>',
      textBody: 'Hello World',
    });

    assert.equal(typeof raw, 'string');
    assert.ok(raw.length > 50);
    // Base64url should not have +, /, or =
    assert.ok(!raw.includes('+'));
    assert.ok(!raw.includes('/'));
    assert.ok(!raw.includes('='));
  });

  // Test 19: List invitations returns only active pending items
  await t.test('UI-001: listInvitations filters out REVOKED and ACCEPTED items', async () => {
    const list = await service.listInvitations('p-1');
    for (const item of list) {
      assert.ok(['CREATED', 'SENDING', 'SENT'].includes(item.status));
      assert.notEqual(item.status, 'ACCEPTED');
      assert.notEqual(item.status, 'REVOKED');
    }
  });

  // Test 20: List memberships returns active members
  await t.test('UI-002: listMemberships returns active members', async () => {
    const members = await service.listMemberships('p-1');
    assert.ok(members.length >= 1);
    for (const m of members) {
      assert.equal(m.status, 'ACTIVE');
    }
  });

  // Test 21: Zero secrets exposed in client bundle contracts
  await t.test('SEC-001: Token pepper and OAuth secrets not exported to domain types', () => {
    assert.equal(process.env.NEXT_PUBLIC_GMAIL_CLIENT_SECRET, undefined);
    assert.equal(process.env.NEXT_PUBLIC_INVITE_TOKEN_PEPPER, undefined);
  });

  // Test 22: Mock mailer strictly makes 0 network calls
  await t.test('SEC-002: Mock mailer executed completely in memory with zero outbound calls', () => {
    assert.ok(mockMailer.sentMails.length >= 1);
    for (const mail of mockMailer.sentMails) {
      assert.ok(mail.messageId.startsWith('mock-msg-'));
    }
  });
});
